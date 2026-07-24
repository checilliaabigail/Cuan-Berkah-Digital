from django.db import models
from django.conf import settings

class CalculationLog(models.Model):
    CALCULATOR_CHOICES = [
        ('shopee', 'Shopee'),
        ('tiktok', 'TikTok'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    calculator_type = models.CharField(max_length=20, choices=CALCULATOR_CHOICES)
    input_data = models.JSONField()
    result_data = models.JSONField()
    tokens_used = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.email} - {self.calculator_type} - {self.created_at}"