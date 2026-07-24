FROM python:3.11-slim

# Supaya log Python langsung muncul (nggak ke-buffer)
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# Copy & install dependencies dulu (biar layer cache Docker efisien
# saat cuma ganti kode tanpa ganti requirements.txt)
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy seluruh source code project
COPY backend/ /app/backend/
COPY frontend/ /app/frontend/

WORKDIR /app/backend

# Kumpulkan semua file statis (termasuk CSS/JS admin Django) ke satu folder
# supaya bisa di-serve whitenoise lewat gunicorn
RUN python manage.py collectstatic --noinput

EXPOSE 8001

# Jalankan gunicorn, bukan manage.py runserver (runserver cuma untuk development)
CMD ["gunicorn", "cuan_berkah.wsgi:application", "--bind", "0.0.0.0:8001", "--workers", "3"]