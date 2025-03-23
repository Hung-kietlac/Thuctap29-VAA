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
def phim_dang_chieu(request):
    try:
        client = MongoClient("mongodb://localhost:27017/")
        db = client["Thuctap"]
        collection = db["Phim"]

        today = datetime.today().strftime('%Y-%m-%d')  # Lấy ngày hôm nay

        if request.method == "GET":
            phim_dang_chieu = list(collection.find({"ngaychieu": {"$lte": today}}, {"_id": 0}))
            return JsonResponse({"phim": phim_dang_chieu}, safe=False, status=200)

        return JsonResponse({"error": "Method not allowed"}, status=405)

    except Exception as e:
        return JsonResponse({"error": f"Lỗi server: {str(e)}"}, status=500)
    
@csrf_exempt
def phim_sap_chieu(request):
    try:
        client = MongoClient("mongodb://localhost:27017/")
        db = client["Thuctap"]
        collection = db["Phim"]

        phim_list = list(collection.find({"trangthai": "Sắp chiếu"}))  # Lọc phim có trạng thái "Sắp chiếu"
        
        for phim in phim_list:
            phim["_id"] = str(phim["_id"])  # Chuyển ObjectId thành chuỗi

        return JsonResponse({"phim_sap_chieu": phim_list}, safe=False, status=200)

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