from django.contrib import admin
from .models import CalculationLog

@admin.register(CalculationLog)
class CalculationLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'calculator_type', 'tokens_used', 'created_at')
    list_filter = ('calculator_type', 'created_at')
    search_fields = ('user__email', 'user__username')
    readonly_fields = ('created_at',)