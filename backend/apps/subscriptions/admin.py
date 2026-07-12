from django.contrib import admin
from .models import Subscription

@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ('user', 'plan', 'tokens_per_month', 'start_date', 'end_date', 'status', 'is_active')
    list_filter = ('plan', 'status', 'start_date')
    search_fields = ('user__email', 'user__username')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('User Info', {'fields': ('user',)}),
        ('Subscription Details', {'fields': ('plan', 'tokens_per_month', 'start_date', 'end_date', 'status')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )