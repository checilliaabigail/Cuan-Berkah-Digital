<<<<<<< HEAD
from django.contrib import admin
from django.contrib.staticfiles.views import serve as static_serve
from django.urls import path, include, re_path
from django.conf import settings
from django.views.static import serve


def frontend_serve(request, path=''):
    if path == '':
        path = 'login.html'
    return serve(request, path, document_root=settings.FRONTEND_DIR)

=======
"""
URL configuration for cuan_berkah project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
>>>>>>> 8a1f99fda05f1a3fa1a79c3d9890801cfcbc40e2

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.urls')),
<<<<<<< HEAD
    path('api/calculate/', include('apps.calculator.urls')),
    path('api/subscriptions/', include('apps.subscriptions.urls')),
    re_path(r'^static/(?P<path>.*)$', static_serve),   # BARU — untuk CSS/JS admin
    re_path(r'^(?P<path>.*)$', frontend_serve),        # tetap paling bawah
=======
    path('api/calculate/', include('apps.calculator.urls')),  # ← Tambahkan ini
>>>>>>> 8a1f99fda05f1a3fa1a79c3d9890801cfcbc40e2
]