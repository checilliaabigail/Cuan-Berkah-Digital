from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone', 'total_tokens', 'used_tokens', 'remaining_tokens', 'created_at']
        read_only_fields = ['id', 'total_tokens', 'used_tokens', 'remaining_tokens', 'created_at']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'password_confirm', 'email', 'phone']

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "Password tidak cocok"})
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        
        # 🔥 TAMBAHKAN INI: Beri token 100 gratis saat register
        user.total_tokens = 100
        user.remaining_tokens = 100
        user.save()
        
        return user