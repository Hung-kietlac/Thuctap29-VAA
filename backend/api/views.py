from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from pymongo import MongoClient
import bcrypt
from twilio.rest import Client
import random
from django.conf import settings
from .models import User, Phim, SuatChieu, Ve, DichVu, PhongChieu, Rap
import traceback
from bson import ObjectId
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from .serializers import PhimSerializer, SuatChieuSerializer, VeSerializer, DichVuSerializer, UserSerializer, PhongChieuSerializer, RapSerializer
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import User
from django.db import IntegrityError
from django.core.mail import send_mail
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.template.loader import render_to_string
from django.shortcuts import redirect
from django.urls import reverse
from django.contrib import messages
from django.contrib.auth import get_user_model
import jwt
from datetime import datetime, timedelta
from rest_framework.permissions import IsAuthenticated

client = MongoClient("mongodb://localhost:27017/")
db = client["Thuctap"]

phim_collection = db["Phim"]
rap_collection = db["rap"]
showtime_collection = db["suatchieu"]
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
@api_view(['POST'])
def register_user(request):
    try:
        data = request.data
        serializer = UserSerializer(data=data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': 'Đăng ký thành công!',
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['POST'])
def login_user(request):
    try:
        print("Received login request")
        data = request.data
        print(f"Login data: {data}")
        
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            print("Missing username or password")
            return Response({'error': 'Vui lòng nhập đầy đủ thông tin'}, status=status.HTTP_400_BAD_REQUEST)
            
        print(f"Attempting to authenticate user: {username}")
        user = authenticate(username=username, password=password)
        
        if user is not None:
            print(f"User authenticated successfully: {user.username}")
            login(request, user)
            
            # Tạo token JWT
            token = jwt.encode({
                'user_id': user.id,
                'username': user.username,
                'exp': datetime.utcnow() + timedelta(days=1)
            }, settings.SECRET_KEY, algorithm='HS256')
            
            return Response({
                'message': 'Đăng nhập thành công',
                'token': token,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'hoten': user.hoten if hasattr(user, 'hoten') else None,
                    'sodienthoai': user.sodienthoai if hasattr(user, 'sodienthoai') else None,
                    'is_staff': user.is_staff
                }
            }, status=status.HTTP_200_OK)
        else:
            print(f"Authentication failed for user: {username}")
            return Response({'error': 'Tên đăng nhập hoặc mật khẩu không đúng'}, status=status.HTTP_401_UNAUTHORIZED)
            
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        traceback.print_exc()  # In ra stack trace đầy đủ
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['GET', 'POST', 'PUT', 'DELETE'])
def phim(request, pk=None):
    if request.method == 'GET':
        if pk:
            try:
                phim = Phim.objects.get(pk=pk)
                serializer = PhimSerializer(phim)
                return Response(serializer.data)
            except Phim.DoesNotExist:
                return Response({'error': 'Phim không tồn tại'}, status=status.HTTP_404_NOT_FOUND)
        else:
            phim = Phim.objects.all()
            serializer = PhimSerializer(phim, many=True)
            return Response(serializer.data)
    
    elif request.method == 'POST':
        data = request.data
        if 'trangthai' not in data:
            data['trangthai'] = 'Sắp chiếu'
            
        serializer = PhimSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'PUT':
        try:
            phim = Phim.objects.get(pk=pk)
            data = request.data
            print("Data received:", data)  # Log dữ liệu nhận được
            
            # Giữ nguyên trạng thái nếu không được cung cấp
            if 'trangthai' not in data:
                data['trangthai'] = phim.trangthai
                
            serializer = PhimSerializer(phim, data=data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            print("Serializer errors:", serializer.errors)  # Log lỗi serializer
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Phim.DoesNotExist:
            return Response({'error': 'Phim không tồn tại'}, status=status.HTTP_404_NOT_FOUND)
    
    elif request.method == 'DELETE':
        try:
            phim = Phim.objects.get(pk=pk)
            phim.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Phim.DoesNotExist:
            return Response({'error': 'Phim không tồn tại'}, status=status.HTTP_404_NOT_FOUND)

@csrf_exempt
@api_view(['GET', 'POST'])
def phongchieu(request):
    if request.method == 'GET':
        phongchieu = PhongChieu.objects.all()
        serializer = PhongChieuSerializer(phongchieu, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = PhongChieuSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@csrf_exempt
@api_view(['GET', 'POST'])
def suatchieu(request):
    if request.method == 'GET':
        suatchieu = SuatChieu.objects.all()
        serializer = SuatChieuSerializer(suatchieu, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = SuatChieuSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@csrf_exempt
@api_view(['GET', 'PUT', 'DELETE'])
def suatchieu_detail(request, pk):
    try:
        suatchieu = SuatChieu.objects.get(pk=pk)
    except SuatChieu.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = SuatChieuSerializer(suatchieu)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = SuatChieuSerializer(suatchieu, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        suatchieu.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@csrf_exempt
@api_view(['GET', 'POST'])
def ve(request):
    try:
        if request.method == "GET":
            ve_list = Ve.objects.all()
            serializer = VeSerializer(ve_list, many=True)
            return Response(serializer.data)
            
        elif request.method == "POST":
            data = json.loads(request.body)
            serializer = VeSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['GET', 'POST'])
def dichvu(request):
    try:
        if request.method == "GET":
            dichvu_list = DichVu.objects.all()
            serializer = DichVuSerializer(dichvu_list, many=True)
            return Response(serializer.data)
            
        elif request.method == "POST":
            data = json.loads(request.body)
            serializer = DichVuSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['GET'])
def rap(request):
    try:
        if request.method == "GET":
            # Trả về danh sách rạp cố định
            raps = [
                {"id": 1, "ten": "Rạp 1", "diachi": "123 Đường ABC"},
                {"id": 2, "ten": "Rạp 2", "diachi": "456 Đường XYZ"},
                {"id": 3, "ten": "Rạp 3", "diachi": "789 Đường DEF"}
            ]
            return Response(raps)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
            method = request.GET.get("method", "VNPay")
            ngay_dat = datetime.datetime.strptime(ngay_dat_str, "%Y%m%d%H%M%S") if ngay_dat_str else None
            trang_thai = "Đã thanh toán"

            data_to_save = {
                "ma_ve": ma_ve,
                "phim": phim,
                "rap": rap,
                "so_tien": so_tien,
                "phuong_thuc": method,
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

        # Ánh xạ trạng thái
        status_mapping = {
            'completed': 'Đã thanh toán',
            'pending': 'Chưa thanh toán',
            'cancelled': 'Đã hủy'
        }

        # Lấy trạng thái từ request
        frontend_status = request.GET.get('status', 'all')
        print(f"Frontend Status: {frontend_status}")

        # Xây dựng truy vấn
        query = {}
        if frontend_status != 'all':
            db_status = status_mapping.get(frontend_status, frontend_status)
            query['trangthai'] = db_status

        # Truy vấn và chuyển đổi dữ liệu
        tickets = list(collection.find(query))
        for ticket in tickets:
            ticket['_id'] = str(ticket['_id'])
            # Chuyển đổi các trường ngày về dạng string
            for date_field in ['ngayxem', 'ngaydat', 'thoigianTT']:
                if date_field in ticket and ticket[date_field]:
                    ticket[date_field] = ticket[date_field].strftime('%Y-%m-%d %H:%M:%S') if hasattr(ticket[date_field], 'strftime') else str(ticket[date_field])

        print(f"Tickets found: {len(tickets)}")

        return JsonResponse({
            "tickets": tickets, 
            "total": len(tickets)
        }, safe=False, status=200)

    except Exception as e:
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
def tickets_statistics(request):
    try:
        client = MongoClient("mongodb://localhost:27017/")
        db = client["Thuctap"]
        collection = db["ve"]
        
        # Count total tickets
        total_tickets = collection.count_documents({})
        
        # Calculate total revenue (assuming there's a 'giave' field in your documents)
        # Only count completed tickets for revenue calculation
        revenue_pipeline = [
            {"$match": {"trangthai": "Đã thanh toán"}},
            {"$group": {"_id": None, "total_revenue": {"$sum": "$giave"}}}
        ]
        
        revenue_result = list(collection.aggregate(revenue_pipeline))
        total_revenue = revenue_result[0]["total_revenue"] if revenue_result else 0
        
        return JsonResponse({
            "total_tickets": total_tickets,
            "total_revenue": total_revenue
        }, status=200)
        
    except Exception as e:
        print(f"Error in tickets_statistics: {traceback.format_exc()}")
        return JsonResponse({"error": f"Lỗi truy xuất thống kê vé: {str(e)}"}, status=500)

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
    

def get_users(request):
    try:
        client = MongoClient("mongodb://localhost:27017/")
        db = client["Thuctap"]
        collection = db["User"]

        if request.method == "GET":
            # Lấy tất cả người dùng, loại trừ trường password
            users = list(collection.find({}, {"password": 0}))
            
            # Chuyển ObjectId sang string
            for user in users:
                user["_id"] = str(user["_id"])

            return JsonResponse({"users": users}, safe=False, status=200)

        return JsonResponse({"error": "Phương thức không được hỗ trợ"}, status=405)

    except Exception as e:
        return JsonResponse({"error": f"Lỗi truy xuất người dùng: {str(e)}"}, status=500)

@csrf_exempt
def delete_user(request, user_id):
    try:
        client = MongoClient("mongodb://localhost:27017/")
        db = client["Thuctap"]
        collection = db["User"]

        if request.method == "DELETE":
            # Xóa người dùng theo ID
            result = collection.delete_one({"_id": ObjectId(user_id)})
            
            if result.deleted_count > 0:
                return JsonResponse({"message": "Xóa người dùng thành công"}, status=200)
            else:
                return JsonResponse({"error": "Không tìm thấy người dùng"}, status=404)

        return JsonResponse({"error": "Phương thức không được hỗ trợ"}, status=405)

    except Exception as e:
        return JsonResponse({"error": f"Lỗi xóa người dùng: {str(e)}"}, status=500)

@csrf_exempt
def update_user(request, user_id):
    try:
        client = MongoClient("mongodb://localhost:27017/")
        db = client["Thuctap"]
        collection = db["User"]

        if request.method == "PUT":
            # Phân tích dữ liệu từ request
            data = json.loads(request.body)
            
            # Chuẩn bị dữ liệu cập nhật
            update_data = {}
            for key in ["hoten", "ngaysinh", "sodienthoai", "username"]:
                if key in data:
                    update_data[key] = data[key]
            
            # Nếu có mật khẩu mới, mã hóa trước khi lưu
            if "password" in data:
                hashed_password = bcrypt.hashpw(data["password"].encode('utf-8'), bcrypt.gensalt())
                update_data["password"] = hashed_password.decode('utf-8')
            
            # Thực hiện cập nhật
            result = collection.update_one(
                {"_id": ObjectId(user_id)}, 
                {"$set": update_data}
            )
            
            if result.modified_count > 0:
                return JsonResponse({"message": "Cập nhật người dùng thành công"}, status=200)
            else:
                return JsonResponse({"error": "Không tìm thấy người dùng hoặc không có thay đổi"}, status=404)

        return JsonResponse({"error": "Phương thức không được hỗ trợ"}, status=405)

    except Exception as e:
        return JsonResponse({"error": f"Lỗi cập nhật người dùng: {str(e)}"}, status=500)
    


@csrf_exempt
def count_users(request):
    try:

        client = MongoClient("mongodb://localhost:27017/")
        db = client["Thuctap"]
        collection = db["User"]

        total_users = collection.count_documents({})  

        return JsonResponse({'total': total_users}, status=200)
    except Exception as e:
        return JsonResponse({'error': f'Lỗi lấy tổng số người dùng: {str(e)}'}, status=500)
    
    
@csrf_exempt
def get_movies(request):
    """Lấy danh sách phim, có thể lọc theo rạp, ngày chiếu, tên phim"""
    try:
        client = MongoClient("mongodb://localhost:27017/")
        db = client["Thuctap"]
        phim_collection = db["Phim"]

        query_params = {}
        if request.method == "POST" and request.body:
            data = json.loads(request.body)
            if data.get("tenphim"):
                query_params["tenphim"] = {"$regex": data["tenphim"], "$options": "i"}
            if data.get("ngaychieu"):
                query_params["ngaychieu"] = data["ngaychieu"]
            if data.get("rap"):
                query_params["rap"] = data["rap"]
        
        movies = list(phim_collection.find(query_params, {"_id": 1, "tenphim": 1, "theloai": 1, "ngaychieu": 1, "tendaodien": 1}))

        for movie in movies:
            movie["_id"] = str(movie["_id"])

        return JsonResponse(movies, safe=False)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
def add_movie(request):
    """Thêm phim mới vào danh sách"""
    try:
      
        client = MongoClient("mongodb://localhost:27017/")
        db = client["Thuctap"]
        phim_collection = db["Phim"]

        if request.method != "POST":
            return JsonResponse({"error": "Phương thức không hợp lệ"}, status=405)

        data = json.loads(request.body)
        if not data.get("tenphim"):
            return JsonResponse({"error": "Tên phim không được để trống"}, status=400)

        phim_collection.insert_one(data)
        return JsonResponse({"message": "Thêm phim thành công!"}, status=201)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
def update_movie(request, movie_id):
    """Cập nhật thông tin phim"""
    try:
       
        client = MongoClient("mongodb://localhost:27017/")
        db = client["Thuctap"]
        phim_collection = db["Phim"]

        if request.method != "PUT":
            return JsonResponse({"error": "Phương thức không hợp lệ"}, status=405)

        data = json.loads(request.body)
        phim_collection.update_one({"_id": ObjectId(movie_id)}, {"$set": data})
        return JsonResponse({"message": "Cập nhật phim thành công!"}, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
def delete_movie(request, movie_id):
    """Xóa phim khỏi danh sách"""
    try:
       
        client = MongoClient("mongodb://localhost:27017/")
        db = client["Thuctap"]
        phim_collection = db["Phim"]

        if request.method != "DELETE":
            return JsonResponse({"error": "Phương thức không hợp lệ"}, status=405)

        phim_collection.delete_one({"_id": ObjectId(movie_id)})
        return JsonResponse({"message": "Xóa phim thành công!"}, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
def get_showtimes(request):
    """Lấy danh sách lịch chiếu, có thể lọc theo phim, rạp, ngày"""
    try:
       
        client = MongoClient("mongodb://localhost:27017/")
        db = client["Thuctap"]
        showtime_collection = db["suatchieu"]

        query_params = {}
        if request.method == "POST" and request.body:
            data = json.loads(request.body)
            if data.get("tenphim"):
                query_params["tenphim"] = {"$regex": data["tenphim"], "$options": "i"}
            if data.get("ngaychieu"):
                query_params["ngaychieu"] = data["ngaychieu"]
            if data.get("rap"):
                query_params["rap"] = data["rap"]

        showtimes = list(
            showtime_collection.find(
                query_params,
                {"_id": 1, "tenphim": 1, "rap": 1, "phong": 1, "ngaychieu": 1, "giochieu": 1},
            )
        )

        for showtime in showtimes:
            showtime["_id"] = str(showtime["_id"])

        return JsonResponse(showtimes, safe=False)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
def add_showtime(request):
    """Thêm lịch chiếu mới"""
    try:
       
        client = MongoClient("mongodb://localhost:27017/")
        db = client["Thuctap"]
        showtime_collection = db["suatchieu"]

        if request.method != "POST":
            return JsonResponse({"error": "Phương thức không hợp lệ"}, status=405)

        data = json.loads(request.body)
        required_fields = ["tenphim", "rap", "phong", "ngaychieu", "giochieu"]

        if not all(field in data for field in required_fields):
            return JsonResponse({"error": "Thiếu thông tin lịch chiếu"}, status=400)

        showtime_collection.insert_one(data)
        return JsonResponse({"message": "Thêm lịch chiếu thành công!"}, status=201)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
def delete_showtime(request, showtime_id):
    """Xóa lịch chiếu"""
    try:
       
        client = MongoClient("mongodb://localhost:27017/")
        db = client["Thuctap"]
        showtime_collection = db["suatchieu"]

        if request.method != "DELETE":
            return JsonResponse({"error": "Phương thức không hợp lệ"}, status=405)

        showtime_collection.delete_one({"_id": ObjectId(showtime_id)})
        return JsonResponse({"message": "Xóa lịch chiếu thành công!"}, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

class PhimViewSet(viewsets.ModelViewSet):
    queryset = Phim.objects.all()
    serializer_class = PhimSerializer

class SuatChieuViewSet(viewsets.ModelViewSet):
    queryset = SuatChieu.objects.all()
    serializer_class = SuatChieuSerializer

class VeViewSet(viewsets.ModelViewSet):
    queryset = Ve.objects.all()
    serializer_class = VeSerializer

    @action(detail=False, methods=['get'])
    def chua_thanh_toan(self, request):
        ve = Ve.objects.filter(trangthai='chua_thanh_toan')
        serializer = self.get_serializer(ve, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def da_thanh_toan(self, request):
        ve = Ve.objects.filter(trangthai='da_thanh_toan')
        serializer = self.get_serializer(ve, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def da_huy(self, request):
        ve = Ve.objects.filter(trangthai='da_huy')
        serializer = self.get_serializer(ve, many=True)
        return Response(serializer.data)

class DichVuViewSet(viewsets.ModelViewSet):
    queryset = DichVu.objects.all()
    serializer_class = DichVuSerializer

@csrf_exempt
@api_view(['POST'])
def logout_user(request):
    try:
        request.session.flush()
        return JsonResponse({'message': 'Đăng xuất thành công'}, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@api_view(['GET'])
def user_list(request):
    try:
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['GET', 'PUT', 'DELETE'])
def user_detail(request, pk):
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = UserSerializer(user)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = UserSerializer(user, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class RapViewSet(viewsets.ModelViewSet):
    queryset = Rap.objects.all()
    serializer_class = RapSerializer
    permission_classes = [IsAuthenticated]
