from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.hashers import make_password, check_password

class User(AbstractUser):
    email = models.EmailField(blank=True, null=True)
    hoten = models.CharField(max_length=100, blank=True, null=True)
    sodienthoai = models.CharField(max_length=15, blank=True, null=True)
    ngaysinh = models.DateField(null=True, blank=True)
    
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='api_user_set',
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='api_user_set',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )
    
    def save(self, *args, **kwargs):
        if not self.pk and self.password:  # Nếu là user mới và có password
            self.set_password(self.password)
        super().save(*args, **kwargs)

    def check_password(self, raw_password):
        return super().check_password(raw_password)
        
class Phim(models.Model):
    tenphim = models.CharField(max_length=255)
    theloai = models.CharField(max_length=255)
    thoiluong = models.IntegerField()
    ngaykhoichieu = models.DateField()
    ngayketthuc = models.DateField()
    trangthai = models.CharField(max_length=50, default='Sắp chiếu')
    poster = models.URLField(max_length=500, blank=True, null=True)
    trailer_teaser = models.URLField(max_length=500, blank=True, null=True)
    mota = models.TextField(blank=True, null=True)
    tendaodien = models.CharField(max_length=255, blank=True, null=True)
    dienvien = models.CharField(max_length=500, blank=True, null=True)
    danhgiaphim = models.FloatField(default=0)

    def __str__(self):
        return self.tenphim

class Rap(models.Model):
    tenrap = models.CharField(max_length=100)
    diachi = models.CharField(max_length=200)
    sodienthoai = models.CharField(max_length=15)

    def __str__(self):
        return self.tenrap

class PhongChieu(models.Model):
    tenphongchieu = models.CharField(max_length=100)
    soluongghe = models.IntegerField()
    rap = models.ForeignKey(Rap, on_delete=models.CASCADE, related_name='phongchieu')

    def __str__(self):
        return f"{self.tenphongchieu} - {self.rap.tenrap}"

class SuatChieu(models.Model):
    phim = models.ForeignKey(Phim, on_delete=models.CASCADE, related_name='suatchieu')
    phongchieu = models.ForeignKey(PhongChieu, on_delete=models.CASCADE, related_name='suatchieu')
    ngaychieu = models.DateField()
    giobatdau = models.TimeField()
    gioketthuc = models.TimeField(default='23:59:59')
    giave = models.DecimalField(max_digits=10, decimal_places=2)
    trangthai = models.CharField(max_length=20, choices=[
        ('Sắp chiếu', 'Sắp chiếu'),
        ('Đang chiếu', 'Đang chiếu'),
        ('Đã kết thúc', 'Đã kết thúc')
    ], default='Sắp chiếu')

    def __str__(self):
        return f"{self.phim.tenphim} - {self.phongchieu.tenphongchieu} - {self.ngaychieu} {self.giobatdau}"

class Ve(models.Model):
    suatchieu = models.ForeignKey(SuatChieu, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    ghe = models.CharField(max_length=10)
    giave = models.IntegerField()
    trangthai = models.CharField(max_length=20, choices=[
        ('Chưa thanh toán', 'Chưa thanh toán'),
        ('Đã thanh toán', 'Đã thanh toán'),
        ('Đã hủy', 'Đã hủy')
    ])
    ngaydat = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Vé {self.ghe} - {self.suatchieu.phim.tenphim}"

class DichVu(models.Model):
    tendichvu = models.CharField(max_length=100)
    gia = models.IntegerField()
    trangthai = models.CharField(max_length=20, choices=[
        ('Còn hàng', 'Còn hàng'),
        ('Hết hàng', 'Hết hàng')
    ])

    def __str__(self):
        return self.tendichvu
