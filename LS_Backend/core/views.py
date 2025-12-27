from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, Delivery, Payment, Review
from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer,
    DeliverySerializer, DeliveryStatusUpdateSerializer,
    PaymentSerializer, ReviewSerializer, DeliveryEditSerializer,
    DeliveryCancelSerializer
)
import bcrypt
import uuid
from datetime import datetime


# Helper function to generate JWT tokens
def get_tokens_for_user(user):
    refresh = RefreshToken()
    refresh['user_id'] = str(user.id)
    refresh['email'] = user.email
    refresh['role'] = user.role
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        data = serializer.validated_data
        if User.objects(email=data['email']).first():
            return Response({"error": "User already exists"}, status=status.HTTP_400_BAD_REQUEST)
        hashed_pw = bcrypt.hashpw(data['password'].encode(), bcrypt.gensalt()).decode()
        user = User(
            email=data['email'],
            password_hash=hashed_pw,
            name=data['name'],
            address=data.get('address', ''),
            contact_number=data.get('contact_number', ''),
            role='user'
        )
        user.save()
        return Response({
            "message": "User registered successfully",
            "user": {
                "id": str(user.id),
                "email": user.email,
                "name": user.name,
                "role": user.role
            }
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        data = serializer.validated_data
        user = User.objects(email=data['email']).first()
        if not user:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        if not bcrypt.checkpw(data['password'].encode(), user.password_hash.encode()):
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        tokens = get_tokens_for_user(user)
        return Response({
            "message": "Login successful",
            "tokens": tokens,
            "user": {
                "id": str(user.id),
                "email": user.email,
                "name": user.name,
                "role": user.role,
                "address": user.address,
                "contact_number": user.contact_number
            }
        }, status=status.HTTP_200_OK)


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user_id = getattr(request.user, 'id', None)
        user = User.objects(id=user_id).first()
        if not user:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response({
            "id": str(user.id),
            "email": user.email,
            "name": user.name,
            "role": user.role,
            "address": user.address,
            "contact_number": user.contact_number,
            "created_at": user.created_at
        }, status=status.HTTP_200_OK)
    def put(self, request):
        user_id = getattr(request.user, 'id', None)
        user = User.objects(id=user_id).first()
        if not user:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        if 'name' in request.data:
            user.name = request.data['name']
        if 'address' in request.data:
            user.address = request.data['address']
        if 'contact_number' in request.data:
            user.contact_number = request.data['contact_number']
        user.updated_at = datetime.utcnow()
        user.save()
        return Response({
            "message": "Profile updated successfully",
            "user": {
                "id": str(user.id),
                "email": user.email,
                "name": user.name,
                "address": user.address,
                "contact_number": user.contact_number
            }
        }, status=status.HTTP_200_OK)


class DeliveryListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user_id = getattr(request.user, 'id', None)
        
        # Apply filters
        query = Delivery.objects(user_id=user_id)
        status_filter = request.query_params.get('status')
        if status_filter:
            query = query.filter(status=status_filter)
        
        deliveries = query.order_by('-created_at')
        data = [{
            "id": str(d.id),
            "status": d.status,
            "pickup_address": d.pickup_address,
            "delivery_address": d.delivery_address,
            "weight": d.weight,
            "package_type": d.package_type,
            "pickup_date": d.pickup_date,
            "delivery_date": d.delivery_date,
            "tracking_number": d.tracking_number,
            "created_at": d.created_at
        } for d in deliveries]
        return Response(data, status=status.HTTP_200_OK)
    def post(self, request):
        serializer = DeliverySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        user_id = getattr(request.user, 'id', None)
        data = serializer.validated_data
        tracking_number = f"LS{uuid.uuid4().hex[:10].upper()}"
        delivery = Delivery(
            user_id=user_id,
            status='Pending',
            pickup_address=data['pickup_address'],
            delivery_address=data['delivery_address'],
            weight=data.get('weight', ''),
            package_type=data.get('package_type', ''),
            pickup_date=data['pickup_date'],
            delivery_date=data.get('delivery_date'),
            tracking_number=tracking_number
        )
        delivery.save()
        return Response({
            "message": "Delivery created successfully",
            "delivery": {
                "id": str(delivery.id),
                "status": delivery.status,
                "pickup_address": delivery.pickup_address,
                "delivery_address": delivery.delivery_address,
                "tracking_number": delivery.tracking_number,
                "pickup_date": delivery.pickup_date
            }
        }, status=status.HTTP_201_CREATED)


class DeliveryDetailView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, delivery_id):
        user_id = getattr(request.user, 'id', None)
        user_role = getattr(request.user, 'role', 'user')
        delivery = Delivery.objects(id=delivery_id).first()
        if not delivery:
            return Response({"error": "Delivery not found"}, status=status.HTTP_404_NOT_FOUND)
        if delivery.user_id != user_id and user_role != 'admin':
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        return Response({
            "id": str(delivery.id),
            "user_id": delivery.user_id,
            "status": delivery.status,
            "pickup_address": delivery.pickup_address,
            "delivery_address": delivery.delivery_address,
            "weight": delivery.weight,
            "package_type": delivery.package_type,
            "pickup_date": delivery.pickup_date,
            "delivery_date": delivery.delivery_date,
            "tracking_number": delivery.tracking_number,
            "created_at": delivery.created_at,
            "updated_at": delivery.updated_at
        }, status=status.HTTP_200_OK)


class DeliveryEditView(APIView):
    permission_classes = [IsAuthenticated]
    def put(self, request, delivery_id):
        user_id = getattr(request.user, 'id', None)
        delivery = Delivery.objects(id=delivery_id).first()
        if not delivery:
            return Response({"error": "Delivery not found"}, status=status.HTTP_404_NOT_FOUND)
        if delivery.user_id != user_id:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        
        # Can only edit if not picked up yet
        if delivery.status not in ['Pending', 'Scheduled']:
            return Response({
                "error": "Cannot edit delivery after pickup"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = DeliveryEditSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Update allowed fields
        if 'pickup_address' in request.data:
            delivery.pickup_address = request.data['pickup_address']
        if 'delivery_address' in request.data:
            delivery.delivery_address = request.data['delivery_address']
        if 'weight' in request.data:
            delivery.weight = request.data['weight']
        if 'package_type' in request.data:
            delivery.package_type = request.data['package_type']
        if 'pickup_date' in serializer.validated_data:
            delivery.pickup_date = serializer.validated_data['pickup_date']
        
        delivery.updated_at = datetime.utcnow()
        delivery.save()
        
        return Response({
            "message": "Delivery updated successfully",
            "delivery": {
                "id": str(delivery.id),
                "status": delivery.status,
                "pickup_address": delivery.pickup_address,
                "delivery_address": delivery.delivery_address,
                "weight": delivery.weight,
                "package_type": delivery.package_type,
                "pickup_date": delivery.pickup_date,
                "tracking_number": delivery.tracking_number,
                "updated_at": delivery.updated_at
            }
        }, status=status.HTTP_200_OK)


class DeliveryCancelView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, delivery_id):
        user_id = getattr(request.user, 'id', None)
        delivery = Delivery.objects(id=delivery_id).first()
        if not delivery:
            return Response({"error": "Delivery not found"}, status=status.HTTP_404_NOT_FOUND)
        if delivery.user_id != user_id:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        
        # Can only cancel if not picked up
        if delivery.status not in ['Pending', 'Scheduled']:
            return Response({
                "error": "Cannot cancel delivery after pickup"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        delivery.status = 'Cancelled'
        delivery.updated_at = datetime.utcnow()
        delivery.save()
        
        return Response({
            "message": "Delivery cancelled successfully",
            "delivery": {
                "id": str(delivery.id),
                "status": delivery.status,
                "tracking_number": delivery.tracking_number,
                "updated_at": delivery.updated_at
            }
        }, status=status.HTTP_200_OK)


class TrackDeliveryView(APIView):
    def put(self, request, delivery_id):
        user_id = getattr(request.user, 'id', None)
        user_role = getattr(request.user, 'role', 'user')
        delivery = Delivery.objects(id=delivery_id).first()
        if not delivery:
            return Response({"error": "Delivery not found"}, status=status.HTTP_404_NOT_FOUND)
        if delivery.user_id != user_id and user_role != 'admin':
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        serializer = DeliveryStatusUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        delivery.status = serializer.validated_data['status']
        delivery.updated_at = datetime.utcnow()
        if delivery.status == 'Delivered' and not delivery.delivery_date:
            delivery.delivery_date = datetime.utcnow()
        delivery.save()
        return Response({
            "message": "Delivery updated successfully",
            "delivery": {
                "id": str(delivery.id),
                "status": delivery.status,
                "tracking_number": delivery.tracking_number,
                "updated_at": delivery.updated_at
            }
        }, status=status.HTTP_200_OK)


# ============ TRACKING ============

class TrackDeliveryView(APIView):
    def get(self, request, tracking_number):
        delivery = Delivery.objects(tracking_number=tracking_number).first()
        if not delivery:
            return Response({"error": "Tracking number not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response({
            "tracking_number": delivery.tracking_number,
            "status": delivery.status,
            "pickup_address": delivery.pickup_address,
            "delivery_address": delivery.delivery_address,
            "package_type": delivery.package_type,
            "weight": delivery.weight,
            "pickup_date": delivery.pickup_date,
            "delivery_date": delivery.delivery_date,
            "created_at": delivery.created_at,
            "updated_at": delivery.updated_at
        }, status=status.HTTP_200_OK)


# ============ REVIEWS ============

class ReviewListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user_id = getattr(request.user, 'id', None)
        reviews = Review.objects(user_id=user_id).order_by('-created_at')
        data = []
        for r in reviews:
            delivery = Delivery.objects(id=r.delivery_id).first()
            tracking_number = delivery.tracking_number if delivery else "Unknown"
            data.append({
                "id": str(r.id),
                "delivery_id": r.delivery_id,
                "tracking_number": tracking_number,
                "rating": r.rating,
                "comment": r.comment,
                "created_at": r.created_at
            })
        return Response(data, status=status.HTTP_200_OK)
    def post(self, request):
        serializer = ReviewSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        user_id = getattr(request.user, 'id', None)
        data = serializer.validated_data
        delivery = Delivery.objects(id=data['delivery_id']).first()
        if not delivery:
            return Response({"error": "Delivery not found"}, status=status.HTTP_404_NOT_FOUND)
        if delivery.user_id != user_id:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        existing = Review.objects(delivery_id=data['delivery_id'], user_id=user_id).first()
        if existing:
            return Response({"error": "You have already reviewed this delivery"}, status=status.HTTP_400_BAD_REQUEST)
        review = Review(
            delivery_id=data['delivery_id'],
            user_id=user_id,
            rating=data['rating'],
            comment=data.get('comment', '')
        )
        review.save()
        return Response({
            "message": "Review submitted successfully",
            "review": {
                "id": str(review.id),
                "delivery_id": review.delivery_id,
                "rating": review.rating,
                "comment": review.comment,
                "created_at": review.created_at
            }
        }, status=status.HTTP_201_CREATED)


class DeliveryReviewsView(APIView):
    def get(self, request, delivery_id):
        delivery = Delivery.objects(id=delivery_id).first()
        if not delivery:
            return Response({"error": "Delivery not found"}, status=status.HTTP_404_NOT_FOUND)
        reviews = Review.objects(delivery_id=delivery_id).order_by('-created_at')
        data = []
        for r in reviews:
            user = User.objects(id=r.user_id).first()
            user_name = user.name if user else "Anonymous"
            data.append({
                "id": str(r.id),
                "user_name": user_name,
                "rating": r.rating,
                "comment": r.comment,
                "created_at": r.created_at
            })
        return Response(data, status=status.HTTP_200_OK)


# ============ ADMIN VIEWS ============

class AdminUsersView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user_role = getattr(request.user, 'role', 'user')
        if user_role != 'admin':
            return Response({"error": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)
        users = User.objects().order_by('-created_at')
        data = [{
            "id": str(u.id),
            "email": u.email,
            "name": u.name,
            "role": u.role,
            "address": u.address,
            "contact_number": u.contact_number,
            "created_at": u.created_at
        } for u in users]
        return Response(data, status=status.HTTP_200_OK)


class AdminDeliveriesView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user_role = getattr(request.user, 'role', 'user')
        if user_role != 'admin':
            return Response({"error": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)
        deliveries = Delivery.objects().order_by('-created_at')
        data = []
        for d in deliveries:
            user = User.objects(id=d.user_id).first()
            user_name = user.name if user else "Unknown"
            user_email = user.email if user else "Unknown"
            data.append({
                "id": str(d.id),
                "user_id": d.user_id,
                "user_name": user_name,
                "user_email": user_email,
                "status": d.status,
                "pickup_address": d.pickup_address,
                "delivery_address": d.delivery_address,
                "weight": d.weight,
                "package_type": d.package_type,
                "pickup_date": d.pickup_date,
                "delivery_date": d.delivery_date,
                "tracking_number": d.tracking_number,
                "created_at": d.created_at
            })
        return Response(data, status=status.HTTP_200_OK)


class AdminDeliveryUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    def put(self, request, delivery_id):
        user_role = getattr(request.user, 'role', 'user')
        if user_role != 'admin':
            return Response({"error": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)

        delivery = Delivery.objects(id=delivery_id).first()
        if not delivery:
            return Response({"error": "Delivery not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = DeliveryStatusUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        delivery.status = serializer.validated_data['status']
        delivery.updated_at = datetime.utcnow()
        if delivery.status == 'Delivered' and not delivery.delivery_date:
            delivery.delivery_date = datetime.utcnow()
        delivery.save()

        return Response({
            "message": "Delivery status updated successfully",
            "delivery": {
                "id": str(delivery.id),
                "status": delivery.status,
                "tracking_number": delivery.tracking_number,
                "updated_at": delivery.updated_at
            }
        }, status=status.HTTP_200_OK)
