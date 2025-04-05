from django.http import JsonResponse
from django.shortcuts import redirect
from django.views.decorators.csrf import csrf_exempt
import json
from pymongo import MongoClient
import bcrypt
from twilio.rest import Client
import random
import traceback
from bson import ObjectId
from urllib.parse import urlencode
import hmac
import datetime
from django.http import HttpResponse
import hashlib
import base64

OTP_STORAGE = {}

@csrf_exempt
def send_otp(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            phone = data.get("sodienthoai")

            if not phone:
                return JsonResponse({"error": "Số điện thoại không hợp lệ"}, status=400)

            # Chuẩn hóa số điện thoại thành +84xxxxxxxxx
            if phone.startswith("0"):
                phone = "+84" + phone[1:]

            # Kiểm tra số điện thoại hợp lệ
            if not phone.startswith("+84") or not phone[1:].isdigit() or len(phone) != 12:
                return JsonResponse({"error": "Số điện thoại phải đúng định dạng Việt Nam (+84xxxxxxxxx)"}, status=400)

            otp = str(random.randint(100000, 999999))
            OTP_STORAGE[phone] = otp

            # Gửi OTP qua Twilio
            client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
            message = client.messages.create(
                body=f"Mã xác minh của bạn: {otp}",
                from_=settings.TWILIO_PHONE_NUMBER,
                to=phone
            )

            return JsonResponse({"message": "Mã OTP đã được gửi", "sid": message.sid})

        except json.JSONDecodeError:
            return JsonResponse({"error": "Dữ liệu không hợp lệ"}, status=400)
        except Exception as e:
            return JsonResponse({"error": f"Gửi OTP thất bại: {str(e)}"}, status=500)

    # Nếu request không phải là POST, trả về lỗi 405 (Method Not Allowed)
    return JsonResponse({"error": "Phương thức không được hỗ trợ"}, status=405)

@csrf_exempt
def register_user(request):
    client = MongoClient("mongodb://localhost:27017/")
    db = client["Thuctap"]
    collection = db["User"]

    if request.method == "POST":
        data = json.loads(request.body)
        hoten = data.get("hoten")
        ngaysinh = data.get("ngaysinh")
        sodienthoai = data.get("sodienthoai")
        username = data.get("username")
        password = data.get("password")

        # Kiểm tra xem username đã tồn tại chưa
        if collection.find_one({"username": username}):
            return JsonResponse({"error": "Tên đăng nhập đã tồn tại!"}, status=400)

        # Mã hóa mật khẩu trước khi lưu vào database
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

        user_data = {
            "hoten": hoten,
            "ngaysinh": ngaysinh,
            "sodienthoai": sodienthoai,
            "username": username,
            "password": hashed_password.decode('utf-8')
        }
        collection.insert_one(user_data)
        
        return JsonResponse({"message": "Đăng ký thành công!"}, status=201)

    return JsonResponse({"error": "Phương thức không hợp lệ!"}, status=405)

@csrf_exempt
def login_user(request):
    client = MongoClient("mongodb://localhost:27017/")
    db = client["Thuctap"]
    user_collection = db["User"]
    admin_collection = db["admin"]

    if request.method == "POST":
        data = json.loads(request.body)
        username = data.get("username")
        password = data.get("password")

        # Kiểm tra tài khoản admin trước
        admin = admin_collection.find_one({"username": username})
        if admin:
            stored_password = admin.get("password")

            if stored_password:
                # Kiểm tra xem mật khẩu admin có phải dạng hash không
                if stored_password.startswith("$2b$") or stored_password.startswith("$2a$"):
                    # Nếu là hash, kiểm tra bằng bcrypt
                    if bcrypt.checkpw(password.encode('utf-8'), stored_password.encode('utf-8')):
                        return JsonResponse({
                            "message": "Đăng nhập thành công!",
                            "username": username,
                            "role": "admin"
                        }, status=200)
                else:
                    # Nếu không phải hash, so sánh trực tiếp
                    if password == stored_password:
                        return JsonResponse({
                            "message": "Đăng nhập thành công!",
                            "username": username,
                            "role": "admin"
                        }, status=200)

            return JsonResponse({"error": "Mật khẩu không đúng!"}, status=400)

        # Kiểm tra tài khoản user nếu không tìm thấy trong admin
        user = user_collection.find_one({"username": username})
        if user:
            hashed_password = user.get("password")
            if hashed_password and bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8')):
                return JsonResponse({
                    "message": "Đăng nhập thành công!",
                    "username": username,
                    "role": "user"
                }, status=200)
            else:
                return JsonResponse({"error": "Mật khẩu không đúng!"}, status=400)

        return JsonResponse({"error": "Tên đăng nhập không tồn tại!"}, status=400)

    return JsonResponse({"error": "Phương thức không hợp lệ!"}, status=405)

@csrf_exempt
def phim(request):
    try:
        client = MongoClient("mongodb://localhost:27017/")
        db = client["Thuctap"]
        collection = db["Phim"]

        if request.method == "GET":
            phim_list = list(collection.find({}))
            
            # Chuyển đổi _id thành chuỗi
            for phim in phim_list:
                phim["_id"] = str(phim["_id"])

            return JsonResponse({"phim": phim_list}, safe=False, status=200)

        return JsonResponse({"error": "Method not allowed"}, status=405)

    except Exception as e:
        return JsonResponse({"error": f"Lỗi server: {str(e)}"}, status=500)

@csrf_exempt
def rap(request):
    try:
        client = MongoClient("mongodb://localhost:27017/")
        db = client["Thuctap"]
        collection = db["rap"]
        
        if request.method =="GET":
            rap = list(collection.find({}, {"_id":0}))
            return JsonResponse({"rap": rap}, safe=False, status=200)
        
        return JsonResponse({"error": "Lỗi phương thức"}, status=405)
    except Exception as e:
        return JsonResponse({"error": f"Lỗi server: {str(e)}"}, status=500)

@csrf_exempt
def dichvu(request):
    try:
        client = MongoClient("mongodb://localhost:27017/")
        db = client["Thuctap"]
        collection = db["dichvu"]
        
        if request.method =="GET":
            dichvu = list(collection.find({}, {"_id":0}))
            return JsonResponse({"dichvu": dichvu}, safe=False, status=200)
        
        return JsonResponse({"error": "Lỗi phương thức"}, status=405)
    except Exception as e:
        return JsonResponse({"error": f"Lỗi server: {str(e)}"}, status=500)

@csrf_exempt
def generate_vnpay_qr(request):
    vnp_TmnCode = 'YQ5K6E9C'
    vnp_HashSecret = 'YTLQUAUDSV4R502QNY4HXWJ2XF8WUTCD'
    vnp_Url = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'

    vnp_TxnRef = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
    vnp_Amount = int(request.GET.get("amount", 10000)) * 100
    phim = request.GET.get("phim", "Không rõ")
    rap = request.GET.get("rap", "Không rõ")

    vnp_OrderInfo = f"PHIM:{phim}|RAP:{rap}|REF:{vnp_TxnRef}"
    vnp_ReturnUrl = "http://localhost:8000/api/vnpay-return"

    data = {
        "vnp_Version": "2.1.0",
        "vnp_Command": "pay",
        "vnp_TmnCode": vnp_TmnCode,
        "vnp_Amount": vnp_Amount,
        "vnp_CurrCode": "VND",
        "vnp_TxnRef": vnp_TxnRef,
        "vnp_OrderInfo": vnp_OrderInfo,
        "vnp_OrderType": "other",
        "vnp_Locale": "vn",
        "vnp_ReturnUrl": vnp_ReturnUrl,
        "vnp_IpAddr": "127.0.0.1",
        "vnp_CreateDate": datetime.datetime.now().strftime("%Y%m%d%H%M%S"),
    }

    sorted_data = sorted(data.items())
    query_string = urlencode(sorted_data)

    hmac_signature = hmac.new(
        bytes(vnp_HashSecret, "utf-8"),
        bytes(query_string, "utf-8"),
        hashlib.sha512
    ).hexdigest()

    payment_url = f"{vnp_Url}?{query_string}&vnp_SecureHash={hmac_signature}"

    return JsonResponse({"payment_url": payment_url})

@csrf_exempt
def vnpay_return(request):
    inputData = request.GET.dict()
    vnp_HashSecret = 'YTLQUAUDSV4R502QNY4HXWJ2XF8WUTCD'

    vnp_SecureHash = inputData.pop("vnp_SecureHash", None)
    inputData.pop("vnp_SecureHashType", None)

    sorted_data = sorted(inputData.items())
    query_string = urlencode(sorted_data)

    hash_check = hmac.new(
        bytes(vnp_HashSecret, "utf-8"),
        bytes(query_string, "utf-8"),
        hashlib.sha512
    ).hexdigest()

    if hash_check == vnp_SecureHash:
        if inputData.get("vnp_ResponseCode") == "00":
            # Kết nối MongoDB
            client = MongoClient("mongodb://localhost:27017")
            db = client["Thuctap"]
            collection = db["thanhtoan"]

            order_info = inputData.get("vnp_OrderInfo", "")
            phim = rap = ""
            for part in order_info.split("|"):
                if part.startswith("PHIM:"):
                    phim = part[5:]
                elif part.startswith("RAP:"):
                    rap = part[4:]

            ma_ve = inputData.get("vnp_TxnRef")
            so_tien = int(inputData.get("vnp_Amount", 0)) / 100
            ngan_hang = inputData.get("vnp_BankCode", "")
            ngay_dat_str = inputData.get("vnp_PayDate", "")
            ngay_dat = datetime.datetime.strptime(ngay_dat_str, "%Y%m%d%H%M%S") if ngay_dat_str else None
            trang_thai = "Đã thanh toán"

            data_to_save = {
                "ma_ve": ma_ve,
                "phim": phim,
                "rap": rap,
                "so_tien": so_tien,
                "ngan_hang": ngan_hang,
                "ngay_dat": ngay_dat,
                "trang_thai": trang_thai
            }

            collection.insert_one(data_to_save)

            return redirect("http://localhost:8100/ticket-history")
        else:
            return HttpResponse("Thanh toán thất bại hoặc bị hủy")
    else:
        return HttpResponse("Sai chữ ký. Không hợp lệ")

def payment_return(request):
    code = request.GET.get('vnp_ResponseCode', '')

    if code == '24':
        # Người dùng hủy thanh toán
        html = """
        <script>
          window.opener.postMessage('payment_cancelled', '*');
          window.close();
        </script>
        """
        return HttpResponse(html)

    elif code == '00':
        # Thành công
        html = """
        <script>
          window.opener.postMessage('payment_success', '*');
          window.close();
        </script>
        """
        return HttpResponse(html)

    else:
        html = """
        <script>
          window.opener.postMessage('payment_failed', '*');
          window.close();
        </script>
        """
        return HttpResponse(html)

@csrf_exempt
def du_lieu_thanh_toan(request):
    try:
        client = MongoClient("mongodb://localhost:27017/")
        db = client["Thuctap"]
        collection = db["thanhtoan"]
        
        if request.method =="GET":
            thanhtoan = list(collection.find({}, {"_id":0}))
            return JsonResponse({"thanhtoan": thanhtoan}, safe=False, status=200)
        
        return JsonResponse({"error": "Lỗi phương thức"}, status=405)
    except Exception as e:
        return JsonResponse({"error": f"Lỗi server: {str(e)}"}, status=500)