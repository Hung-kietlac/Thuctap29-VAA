from django.core.management.base import BaseCommand
from api.models import Phim, SuatChieu, DichVu
from datetime import datetime, timedelta

class Command(BaseCommand):
    help = 'Thêm dữ liệu mẫu vào database'

    def handle(self, *args, **kwargs):
        # Thêm phim
        phim1 = Phim.objects.create(
            tenphim="Avengers: Endgame",
            theloai="Hành động",
            thoiluong=180,
            ngaykhoichieu=datetime.now(),
            ngayketthuc=datetime.now() + timedelta(days=30),
            trangthai="Đang chiếu"
        )

        phim2 = Phim.objects.create(
            tenphim="Spider-Man: No Way Home",
            theloai="Hành động",
            thoiluong=150,
            ngaykhoichieu=datetime.now(),
            ngayketthuc=datetime.now() + timedelta(days=30),
            trangthai="Đang chiếu"
        )

        # Thêm suất chiếu
        for i in range(5):
            SuatChieu.objects.create(
                phim=phim1,
                ngaychieu=datetime.now() + timedelta(days=i),
                giochieu="14:00",
                phong=f"Phòng {i+1}",
                giave=100000,
                trangthai="Còn vé"
            )

            SuatChieu.objects.create(
                phim=phim2,
                ngaychieu=datetime.now() + timedelta(days=i),
                giochieu="16:00",
                phong=f"Phòng {i+1}",
                giave=120000,
                trangthai="Còn vé"
            )

        # Thêm dịch vụ
        DichVu.objects.create(
            tendichvu="Bắp rang bơ",
            gia=45000,
            trangthai="Còn hàng"
        )

        DichVu.objects.create(
            tendichvu="Nước ngọt",
            gia=25000,
            trangthai="Còn hàng"
        )

        self.stdout.write(self.style.SUCCESS('Đã thêm dữ liệu mẫu thành công!')) 