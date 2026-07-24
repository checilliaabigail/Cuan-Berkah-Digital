from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

class CustomUserAdmin(UserAdmin):
    list_display = ('id', 'username', 'email', 'phone', 'total_tokens', 'remaining_tokens', 'is_staff', 'is_active')
    list_filter = ('is_staff', 'is_active')
    search_fields = ('username', 'email', 'phone')
    ordering = ('-id',)
    
    fieldsets = UserAdmin.fieldsets + (
        ('Token & Phone Info', {'fields': ('phone', 'total_tokens', 'used_tokens', 'remaining_tokens')}),
    )
    
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Token & Phone Info', {'fields': ('phone',)}),
    )

# Unregister default User admin, lalu register custom
try:
    admin.site.unregister(User)
except admin.sites.NotRegistered:
    pass
admin.site.register(User, CustomUserAdmin)