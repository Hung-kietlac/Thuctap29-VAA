import json
import os
from django.core.management.base import BaseCommand
from api.models import PhongChieu, Rap

class Command(BaseCommand):
    help = 'Import phong chieu data from JSON file'

    def handle(self, *args, **kwargs):
        # Lấy đường dẫn tuyệt đối của file JSON
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
        json_file = os.path.join(base_dir, 'database TTTN', 'thuctaptotnghiep.phongchieu.json')
        
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                phongchieu_data = json.load(f)
                
            # Lấy rạp đầu tiên hoặc tạo mới nếu chưa có
            rap = Rap.objects.first()
            if not rap:
                rap = Rap.objects.create(
                    tenrap="Rạp 1",
                    diachi="123 Đường ABC",
                    sodienthoai="0123456789"
                )
            
            for pc in phongchieu_data:
                PhongChieu.objects.update_or_create(
                    tenphongchieu=pc['tenphongchieu'],
                    defaults={
                        'soluongghe': pc['soluongghe'],
                        'rap': rap
                    }
                )
                
            self.stdout.write(self.style.SUCCESS(f'Successfully imported {len(phongchieu_data)} phong chieu'))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error importing phong chieu: {str(e)}')) 