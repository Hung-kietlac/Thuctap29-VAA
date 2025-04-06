from django.contrib import admin
from .models import User, Phim, SuatChieu, Ve, DichVu, PhongChieu, Rap

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'hoten', 'sodienthoai', 'is_staff')
    search_fields = ('username', 'email', 'hoten')
    list_filter = ('is_staff',)

@admin.register(Phim)
class PhimAdmin(admin.ModelAdmin):
    list_display = ('tenphim', 'theloai', 'thoiluong', 'ngaykhoichieu', 'ngayketthuc', 'trangthai')
    search_fields = ('tenphim', 'theloai')
    list_filter = ('theloai', 'trangthai')

@admin.register(SuatChieu)
class SuatChieuAdmin(admin.ModelAdmin):
    list_display = ('phim', 'phongchieu', 'ngaychieu', 'giobatdau', 'gioketthuc', 'giave', 'trangthai')
    search_fields = ('phim__tenphim', 'phongchieu__tenphongchieu')
    list_filter = ('ngaychieu', 'trangthai')

@admin.register(Ve)
class VeAdmin(admin.ModelAdmin):
    list_display = ('suatchieu', 'user', 'ghe', 'giave', 'trangthai', 'ngaydat')
    search_fields = ('suatchieu__phim__tenphim', 'user__username', 'ghe')
    list_filter = ('trangthai', 'ngaydat')

@admin.register(DichVu)
class DichVuAdmin(admin.ModelAdmin):
    list_display = ('tendichvu', 'gia', 'trangthai')
    search_fields = ('tendichvu',)
    list_filter = ('trangthai',)

@admin.register(PhongChieu)
class PhongChieuAdmin(admin.ModelAdmin):
    list_display = ('tenphongchieu', 'soluongghe', 'rap')

@admin.register(Rap)
class RapAdmin(admin.ModelAdmin):
    list_display = ('tenrap', 'diachi', 'sodienthoai')
