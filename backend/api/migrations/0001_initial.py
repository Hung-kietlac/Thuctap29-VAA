# Generated by Django 5.1.3 on 2025-03-11 13:31

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('hoten', models.CharField(max_length=255)),
                ('ngaysinh', models.DateField()),
                ('sodienthoai', models.CharField(max_length=15)),
                ('username', models.CharField(max_length=150, unique=True)),
                ('password', models.CharField(max_length=255)),
            ],
        ),
    ]
