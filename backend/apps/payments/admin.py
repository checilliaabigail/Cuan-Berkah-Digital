from django.contrib import admin
from .models import Payment

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('user', 'order_id', 'amount', 'status', 'created_at', 'paid_at')
    list_filter = ('status', 'created_at')
    search_fields = ('user__email', 'order_id')
    readonly_fields = ('created_at',)
    fieldsets = (
        ('User Info', {'fields': ('user',)}),
        ('Payment Details', {'fields': ('order_id', 'amount', 'payment_method', 'status', 'payment_link', 'qr_code')}),
        ('Timestamps', {'fields': ('created_at', 'paid_at')}),
    )