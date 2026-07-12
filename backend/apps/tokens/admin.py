from django.contrib import admin
from .models import TokenUsage, TokenAddon

@admin.register(TokenUsage)
class TokenUsageAdmin(admin.ModelAdmin):
    list_display = ('user', 'action', 'tokens_used', 'created_at')
    list_filter = ('action', 'created_at')
    search_fields = ('user__email', 'user__username')
    readonly_fields = ('created_at',)

@admin.register(TokenAddon)
class TokenAddonAdmin(admin.ModelAdmin):
    list_display = ('user', 'amount', 'price', 'payment_status', 'created_at')
    list_filter = ('payment_status', 'created_at')
    search_fields = ('user__email', 'user__username')
    readonly_fields = ('created_at',)