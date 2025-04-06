from rest_framework import serializers
from .models import User, Phim, SuatChieu, Ve, DichVu, PhongChieu, Rap
from django.contrib.auth.hashers import make_password

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'email', 'hoten', 'sodienthoai', 'ngaysinh', 'is_staff']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data.get('password'))
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if 'password' in validated_data:
            validated_data['password'] = make_password(validated_data.get('password'))
        return super().update(instance, validated_data)

class PhimSerializer(serializers.ModelSerializer):
    class Meta:
        model = Phim
        fields = ['id', 'tenphim', 'theloai', 'thoiluong', 'ngaykhoichieu', 'ngayketthuc', 
                 'trangthai', 'poster', 'trailer_teaser', 'mota', 'tendaodien', 'dienvien', 'danhgiaphim']

class PhongChieuSerializer(serializers.ModelSerializer):
    class Meta:
        model = PhongChieu
        fields = ['id', 'tenphongchieu', 'soluongghe', 'rap']

class SuatChieuSerializer(serializers.ModelSerializer):
    phim = PhimSerializer(read_only=True)
    phim_id = serializers.PrimaryKeyRelatedField(queryset=Phim.objects.all(), source='phim', write_only=True)
    phongchieu = PhongChieuSerializer(read_only=True)
    phongchieu_id = serializers.PrimaryKeyRelatedField(queryset=PhongChieu.objects.all(), source='phongchieu', write_only=True)

    class Meta:
        model = SuatChieu
        fields = ['id', 'phim', 'phim_id', 'phongchieu', 'phongchieu_id', 'ngaychieu', 'giobatdau', 'gioketthuc', 'giave', 'trangthai']

class VeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ve
        fields = '__all__'

class DichVuSerializer(serializers.ModelSerializer):
    class Meta:
        model = DichVu
        fields = '__all__'

class RapSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rap
        fields = ['id', 'tenrap', 'diachi', 'sodienthoai']