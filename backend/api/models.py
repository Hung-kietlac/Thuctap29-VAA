from djongo import models
from django.contrib.auth.hashers import make_password

class User(models.Model):
    hoten = models.CharField(max_length=255)
    ngaysinh = models.DateField()
    sodienthoai = models.CharField(max_length=10)
    username = models.CharField(max_length=255, unique=True)
    password = models.CharField(max_length=255)

    def save(self, *args, **kwargs):
        self.password = make_password(self.password)
        super(User, self).save(*args, **kwargs)
        
class Phim(models.Model):
    tenphim = models.CharField(max_length=255)
    theloai = models.CharField(max_length=255)
    ngaychieu = models.DateField()
    poster = models.CharField(max_length=255)
    trailer_teaser = models.CharField(max_length=255)
    mota = models.CharField(max_length=255)
    tendaodien = models.CharField(max_length=255)
    dienvien = models.CharField(max_length=255)
class User(models.Model):
    hoten = models.CharField(max_length=100)
    username = models.CharField(max_length=100, unique=True)
    sodienthoai = models.CharField(max_length=15, unique=True)
    ngaysinh = models.DateField()