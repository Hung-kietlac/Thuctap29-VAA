from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from pymongo import MongoClient
import bcrypt
from twilio.rest import Client
import random
from django.conf import settings
from .models import User
import traceback
from .models import Phim
from bson import ObjectId

client = MongoClient("mongodb://localhost:27017/")
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

def generate_vnpay_qr(request):
    vnp_TmnCode = settings.VNPAY_TMN_CODE
    vnp_HashSecret = settings.VNPAY_HASH_SECRET
    vnp_Url = settings.VNPAY_URL

    vnp_TxnRef = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
    vnp_Amount = int(request.GET.get("amount", 10000)) * 100  # Đơn vị VNĐ x 100
    vnp_OrderInfo = "Thanh toan don hang " + vnp_TxnRef
    vnp_ReturnUrl = "http://localhost:3000/payment-success"  # Trang React sau khi thanh toán

    # Tạo dữ liệu gửi lên VNPay
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

    # Sắp xếp tham số theo thứ tự alphabet
    sorted_data = sorted(data.items())
    query_string = urlencode(sorted_data)

    # Tạo chữ ký bảo mật (HMAC-SHA512)
    hmac_signature = hmac.new(
        bytes(vnp_HashSecret, "utf-8"), 
        bytes(query_string, "utf-8"), 
        hashlib.sha512
    ).hexdigest()

    # Thêm chữ ký vào URL
    payment_url = f"{vnp_Url}?{query_string}&vnp_SecureHash={hmac_signature}"

    # Tạo mã QR Code
    qr = qrcode.make(payment_url)
    qr.save("qrcode.png")

    # Encode QR thành Base64 để trả về frontend
    with open("qrcode.png", "rb") as qr_file:
        qr_base64 = base64.b64encode(qr_file.read()).decode()

    return JsonResponse({"qr_code": qr_base64, "payment_url": payment_url})


@csrf_exempt
def get_tickets(request):
    if request.method == "GET":
        try:
            tickets = Ticket.objects.all().values()  # Lấy tất cả vé
            return JsonResponse(list(tickets), safe=False)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid request"}, status=400)

@csrf_exempt
def ticket_history(request):
    try:
        client = MongoClient("mongodb://localhost:27017/")
        db = client["Thuctap"]  
        collection = db["ve"]  

        # Log thông tin request
        print(f"Request status: {request.GET.get('status', 'all')}")

        if request.method == "GET":
            status_mapping = {
                'completed': 'Đã thanh toán',
                'pending': 'Đang chờ thanh toán', 
                'cancelled': 'Đã hủy'
            }

            frontend_status = request.GET.get('status', 'all')
            
            query = {}
            if frontend_status != 'all':
                db_status = status_mapping.get(frontend_status)
                if db_status:
                    query['trangthai'] = db_status

            # Log query
            print(f"MongoDB Query: {query}")

            tickets = list(collection.find(query))

            # Log số lượng vé
            print(f"Total tickets found: {len(tickets)}")

            for ticket in tickets:
                ticket['_id'] = str(ticket['_id'])
                print(f"Ticket: {ticket}")

            return JsonResponse({
                "tickets": tickets, 
                "total": len(tickets)
            }, safe=False, status=200)

        return JsonResponse({"error": "Phương thức không được hỗ trợ"}, status=405)

    except Exception as e:
        # Log lỗi chi tiết
        print(f"Error in ticket_history: {traceback.format_exc()}")
        return JsonResponse({"error": f"Lỗi truy xuất dữ liệu: {str(e)}"}, status=500)
    
@csrf_exempt
def ticket_detail(request, ticket_id):
    try:
        client = MongoClient("mongodb://localhost:27017/")
        db = client["Thuctap"]
        collection = db["ve"]

        if request.method == "GET":
            # Chuyển ticket_id sang ObjectId
            ticket = collection.find_one({"_id": ObjectId(ticket_id)})

            if ticket:
                ticket['_id'] = str(ticket['_id'])
                return JsonResponse(ticket, safe=False, status=200)
            else:
                return JsonResponse({"error": "Không tìm thấy vé"}, status=404)

        return JsonResponse({"error": "Phương thức không được hỗ trợ"}, status=405)

    except Exception as e:
        return JsonResponse({"error": f"Lỗi truy xuất chi tiết vé: {str(e)}"}, status=500)

@csrf_exempt
def cancel_ticket(request, ticket_id):
    try:
        client = MongoClient("mongodb://localhost:27017/")
        db = client["Thuctap"]
        collection = db["ve"]

        if request.method == "POST":
            # Cập nhật trạng thái vé thành "Đã hủy"
            result = collection.update_one(
                {"_id": ObjectId(ticket_id)}, 
                {"$set": {"trangthai": "Đã hủy"}}
            )

            if result.modified_count > 0:
                return JsonResponse({"message": "Hủy vé thành công"}, status=200)
            else:
                return JsonResponse({"error": "Không tìm thấy vé hoặc không thể hủy"}, status=404)

        return JsonResponse({"error": "Phương thức không được hỗ trợ"}, status=405)

    except Exception as e:
        return JsonResponse({"error": f"Lỗi hủy vé: {str(e)}"}, status=500)