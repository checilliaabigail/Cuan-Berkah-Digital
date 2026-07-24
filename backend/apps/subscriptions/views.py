from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import Subscription


class SubscriptionStatusView(APIView):
    """
    GET /api/subscriptions/status
    Dipanggil frontend setelah login (langkah 3 di flow) untuk menentukan
    apakah user diarahkan ke halaman subscription atau boleh lanjut ke kalkulator.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sub = (
            Subscription.objects.filter(user=request.user, status='active')
            .order_by('-end_date')
            .first()
        )

        is_active = bool(sub and sub.is_active())

        return Response({
            'success': True,
            'is_active': is_active,
            'subscription': {
                'plan': sub.plan,
                'status': sub.status,
                'end_date': sub.end_date,
                'tokens_per_month': sub.tokens_per_month,
            } if sub else None,
        })