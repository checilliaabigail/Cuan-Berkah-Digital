from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    phone = models.CharField(max_length=15, blank=True, null=True)
    
    # Token tracking
    total_tokens = models.IntegerField(default=0)
    used_tokens = models.IntegerField(default=0)
    remaining_tokens = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.email
    
    def use_token(self):
        if self.remaining_tokens > 0:
            self.used_tokens += 1
            self.remaining_tokens -= 1
            self.save()
            return True
        return False
    
    def add_tokens(self, amount):
        """Tambah token"""
        self.total_tokens += amount
        self.remaining_tokens += amount
        self.save()
        return True
    
    def has_tokens(self):
        return self.remaining_tokens > 0