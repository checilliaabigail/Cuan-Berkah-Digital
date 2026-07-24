from django.contrib import admin
from django.contrib.staticfiles.views import serve as static_serve
from django.urls import path, include, re_path
from django.conf import settings
from django.views.static import serve


def frontend_serve(request, path=''):
    if path == '':
        path = 'login.html'
    return serve(request, path, document_root=settings.FRONTEND_DIR)


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.urls')),
    path('api/calculate/', include('apps.calculator.urls')),
    path('api/subscriptions/', include('apps.subscriptions.urls')),
    re_path(r'^static/(?P<path>.*)$', static_serve),   # BARU — untuk CSS/JS admin
    re_path(r'^(?P<path>.*)$', frontend_serve),        # tetap paling bawah
]