from django.core.management.base import BaseCommand
import json
from api.models import Phim
from datetime import datetime
import os

class Command(BaseCommand):
    help = 'Import phim từ file JSON'

    def handle(self, *args, **options):
        # Lấy đường dẫn tuyệt đối của thư mục gốc dự án
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))
        json_path = os.path.join(base_dir, 'database TTTN', 'thuctaptotnghiep.phim.json')
        
        self.stdout.write(f"Đang đọc file từ: {json_path}")
        
        with open(json_path, 'r', encoding='utf-8') as file:
            movies = json.load(file)
            
        for movie in movies:
            try:
                # Chuyển đổi ngày từ định dạng ISO sang datetime
                ngaychieu = datetime.fromisoformat(movie['ngaychieu']['$date'].replace('Z', '+00:00'))
                
                # Tạo hoặc cập nhật phim
                Phim.objects.update_or_create(
                    tenphim=movie['tenphim'],
                    defaults={
                        'theloai': movie['theloai'],
                        'thoiluong': int(movie['thoiluong']),
                        'ngaykhoichieu': ngaychieu,
                        'ngayketthuc': ngaychieu,  # Tạm thời set bằng ngày khởi chiếu
                        'trangthai': 'Sắp chiếu',
                        'poster': movie['poster'],
                        'trailer_teaser': movie['trailer_teaser'],
                        'mota': movie['mota'],
                        'tendaodien': movie['tendaodien'],
                        'dienvien': movie['dienvien'],
                        'danhgiaphim': float(movie['danhgiaphim'])
                    }
                )
                self.stdout.write(self.style.SUCCESS(f'Imported phim: {movie["tenphim"]}'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error importing {movie["tenphim"]}: {str(e)}')) 