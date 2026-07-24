from django.urls import path
from .views import SubscriptionStatusView

urlpatterns = [
    path('status', SubscriptionStatusView.as_view(), name='subscription-status'),
]