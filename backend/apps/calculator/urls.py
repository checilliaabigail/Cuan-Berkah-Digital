from django.urls import path
from .views import CalculateShopeeView

urlpatterns = [
    path('shopee', CalculateShopeeView.as_view(), name='calculate-shopee'),
]