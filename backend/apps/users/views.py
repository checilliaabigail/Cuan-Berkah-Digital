from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, RegisterSerializer

User = get_user_model()


class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        print("📨 Request data:", request.data)
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'success': True,
                'user': UserSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            })
        print("❌ Errors:", serializer.errors)
        return Response({'success': False, 'errors': serializer.errors}, status=400)


class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        # Cek apakah request.data adalah dict atau string
        if isinstance(request.data, str):
            import json
            try:
                data = json.loads(request.data)
            except:
                return Response({
                    'success': False,
                    'error': 'Format data tidak valid'
                }, status=400)
        else:
            data = request.data
        
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return Response({
                'success': False,
                'error': 'Email dan password wajib diisi'
            }, status=400)
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Email atau password salah'
            }, status=401)
        
        authenticated_user = authenticate(request, username=user.username, password=password)
        
        if not authenticated_user:
            return Response({
                'success': False,
                'error': 'Email atau password salah'
            }, status=401)
        
        refresh = RefreshToken.for_user(authenticated_user)
        
        return Response({
            'success': True,
            'user': UserSerializer(authenticated_user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })


class MeView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        return Response({
            'success': True,
            'user': UserSerializer(request.user).data
        })