from django.db import models
from django.conf import settings

class Subscription(models.Model):
    PLAN_CHOICES = [
        ('monthly', 'Monthly'),
        ('yearly', 'Yearly'),
        ('trial', 'Trial'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('expired', 'Expired'),
        ('cancelled', 'Cancelled'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    plan = models.CharField(max_length=20, choices=PLAN_CHOICES)
    tokens_per_month = models.IntegerField(default=100)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.email} - {self.plan} - {self.status}"
    
    def is_active(self):
        from django.utils import timezone
<<<<<<< HEAD
        return self.status == 'active' and self.end_date > timezone.now()

    def save(self, *args, **kwargs):
        # Deteksi transisi ke status 'active' (baru dibuat aktif, atau diubah jadi aktif)
        # supaya token cuma dikasih SEKALI setiap kali subscription "menyala".
        should_grant_tokens = False
        if self.pk:
            previous = Subscription.objects.filter(pk=self.pk).first()
            if previous and previous.status != 'active' and self.status == 'active':
                should_grant_tokens = True
        else:
            if self.status == 'active':
                should_grant_tokens = True

        super().save(*args, **kwargs)

        if should_grant_tokens:
            self.user.add_tokens(self.tokens_per_month)
=======
        return self.status == 'active' and self.end_date > timezone.now()
>>>>>>> 8a1f99fda05f1a3fa1a79c3d9890801cfcbc40e2
