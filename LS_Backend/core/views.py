from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
import bcrypt
from datetime import datetime
from .models import (User, Delivery, Payment, Review, Notification,
                     SupportTicket, TicketInternalNote, SupportFAQ, TicketFeedback)
from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer,
    DeliverySerializer, DeliveryStatusUpdateSerializer,
    PaymentSerializer, ReviewSerializer, DeliveryEditSerializer,
    DeliveryCancelSerializer, DeliveryDriverAssignSerializer,
    NotificationSerializer, PriceEstimateSerializer,
    SupportTicketSerializer, TicketStatusUpdateSerializer, TicketReassignSerializer,
    TicketInternalNoteSerializer, SupportFAQSerializer, TicketFeedbackSerializer,
    SupportAgentRegisterSerializer
)
from .notification_utils import (
    notify_admin_on_delivery_created, notify_user_on_delivery_updated,
    notify_admin_on_delivery_cancelled, notify_driver_on_assignment,
    notify_user_on_driver_assignment, notify_admin_on_delivery_delivered,
    notify_user_on_delivery_delivered
)
from .email_utils import (
    send_booking_confirmation_email, send_status_update_email,
    send_driver_assigned_email
)
from .pricing_utils import calculate_distance, calculate_price, get_price_breakdown
import uuid


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
        
        # Update user fields
        user.name = request.data.get('name', user.name)
        user.email = request.data.get('email', user.email)
        user.contact_number = request.data.get('contact_number', user.contact_number)
        user.address = request.data.get('address', user.address)
        user.updated_at = datetime.utcnow()
        user.save()
        
        return Response({
            "message": "Profile updated successfully",
            "user": {
                "id": str(user.id),
                "email": user.email,
                "name": user.name,
                "role": user.role,
                "address": user.address,
                "contact_number": user.contact_number
            }
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
        data = []
        for d in deliveries:
            driver = User.objects(id=d.driver_id).first() if d.driver_id else None
            data.append({
                "id": str(d.id),
                "status": d.status,
                "driver_id": d.driver_id,
                "driver_name": driver.name if driver else None,
                "driver_contact": driver.contact_number if driver else None,
                "pickup_address": d.pickup_address,
                "delivery_address": d.delivery_address,
                "weight": d.weight,
                "package_type": d.package_type,
                "pickup_date": d.pickup_date,
                "delivery_date": d.delivery_date,
                "tracking_number": d.tracking_number,
                "distance": d.distance,
                "price": d.price,
                "created_at": d.created_at
            })
        return Response(data, status=status.HTTP_200_OK)
    def post(self, request):
        serializer = DeliverySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        user_id = getattr(request.user, 'id', None)
        user = User.objects(id=user_id).first()
        data = serializer.validated_data
        tracking_number = f"LS{uuid.uuid4().hex[:10].upper()}"
        
        # Extract city/state (dropdowns) for distance calculation; ignore address lines/pincodes for distance
        request_data = request.data
        pickup_city = request_data.get('pickup', {}).get('city') if isinstance(request_data.get('pickup'), dict) else None
        pickup_state = request_data.get('pickup', {}).get('state') if isinstance(request_data.get('pickup'), dict) else None
        delivery_city = request_data.get('delivery', {}).get('city') if isinstance(request_data.get('delivery'), dict) else None
        delivery_state = request_data.get('delivery', {}).get('state') if isinstance(request_data.get('delivery'), dict) else None

        # Calculate distance and price based on city/state only
        weight = data.get('weight', 0)
        package_type = data.get('package_type', 'Small')
        
        distance = None
        if pickup_city and pickup_state and delivery_city and delivery_state:
            distance = calculate_distance(None, None, pickup_city, pickup_state, delivery_city, delivery_state)
        
        if distance is None:
            distance = 0  # Default to 0 if calculation fails
        
        price = calculate_price(distance, weight, package_type)
        
        pickup_address = data['pickup_address']
        delivery_address = data['delivery_address']
        
        delivery = Delivery(
            user_id=user_id,
            status='Pending',
            pickup_address=pickup_address,
            delivery_address=delivery_address,
            weight=weight,
            package_type=package_type,
            pickup_date=data['pickup_date'],
            delivery_date=data.get('delivery_date'),
            tracking_number=tracking_number,
            distance=distance,
            price=price
        )
        delivery.save()
        
        # Send notification to admin
        if user:
            notify_admin_on_delivery_created(user_id, str(delivery.id), user.name)
        
        # Send booking confirmation email to user
        if user and user.email:
            try:
                print(f"\n{'='*60}")
                print(f"[EMAIL] Attempting to send booking confirmation email")
                print(f"[EMAIL] To: {user.email}")
                print(f"[EMAIL] User: {user.name}")
                print(f"[EMAIL] Tracking: {tracking_number}")
                print(f"{'='*60}\n")
                
                send_booking_confirmation_email(
                    user_email=user.email,
                    user_name=user.name,
                    delivery_data={
                        'tracking_number': tracking_number,
                        'pickup_address': pickup_address,
                        'delivery_address': delivery_address,
                        'package_type': package_type,
                        'weight': weight,
                        'distance': distance,
                        'pickup_date': data['pickup_date'].strftime('%d %B %Y') if data.get('pickup_date') else 'N/A',
                        'price': price
                    }
                )
                print(f"\n[EMAIL] ✅ Booking confirmation email sent successfully!\n")
            except Exception as e:
                # Log error but don't fail the request
                print(f"\n[EMAIL] ❌ Failed to send booking confirmation email: {str(e)}")
                import traceback
                traceback.print_exc()
                print()
        else:
            if not user:
                print(f"\n[EMAIL] ⚠️  No user found - cannot send email\n")
            elif not user.email:
                print(f"\n[EMAIL] ⚠️  User {user.name} has no email address\n")
        
        return Response({
            "message": "Delivery created successfully",
            "delivery": {
                "id": str(delivery.id),
                "status": delivery.status,
                "pickup_address": delivery.pickup_address,
                "delivery_address": delivery.delivery_address,
                "tracking_number": delivery.tracking_number,
                "pickup_date": delivery.pickup_date,
                "distance": delivery.distance,
                "price": delivery.price
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
        driver = User.objects(id=delivery.driver_id).first() if delivery.driver_id else None
        return Response({
            "id": str(delivery.id),
            "user_id": delivery.user_id,
            "status": delivery.status,
            "driver_id": delivery.driver_id,
            "driver_name": driver.name if driver else None,
            "driver_contact": driver.contact_number if driver else None,
            "pickup_address": delivery.pickup_address,
            "delivery_address": delivery.delivery_address,
            "weight": delivery.weight,
            "package_type": delivery.package_type,
            "pickup_date": delivery.pickup_date,
            "delivery_date": delivery.delivery_date,
            "tracking_number": delivery.tracking_number,
            "distance": delivery.distance,
            "price": delivery.price,
            "created_at": delivery.created_at,
            "updated_at": delivery.updated_at
        }, status=status.HTTP_200_OK)


class PriceEstimateView(APIView):
    """Endpoint to estimate delivery price before creating a delivery"""
    def post(self, request):
        try:
            print(f"\n{'='*60}")
            print(f"[PRICE ESTIMATE] Received request data: {request.data}")
            print(f"{'='*60}\n")
            
            serializer = PriceEstimateSerializer(data=request.data)
            if not serializer.is_valid():
                print(f"[VALIDATION ERROR] Serializer errors: {serializer.errors}")
                error_response = {
                    "error": "Invalid request data",
                    "details": dict(serializer.errors)
                }
                print(f"[VALIDATION ERROR] Returning: {error_response}")
                return Response(error_response, status=status.HTTP_400_BAD_REQUEST)
            
            data = serializer.validated_data
            pickup_pincode = data['pickup_pincode']
            delivery_pincode = data['delivery_pincode']
            weight = data['weight']
            package_type = data['package_type']
            
            # Optional city and state for enhanced location verification
            pickup_city = data.get('pickup_city') or None
            pickup_state = data.get('pickup_state') or None
            delivery_city = data.get('delivery_city') or None
            delivery_state = data.get('delivery_state') or None
            
            print(f"[PRICE ESTIMATE] Validated data:")
            print(f"  - Pickup: {pickup_pincode}" + 
                  (f", {pickup_city}" if pickup_city else "") + 
                  (f", {pickup_state}" if pickup_state else ""))
            print(f"  - Delivery: {delivery_pincode}" + 
                  (f", {delivery_city}" if delivery_city else "") + 
                  (f", {delivery_state}" if delivery_state else ""))
            print(f"  - Weight: {weight}")
            print(f"  - Package type: {package_type}")
            
            # Calculate distance using pincodes and optional city/state
            print(f"[PRICE ESTIMATE] Calling calculate_distance()...")
            distance = calculate_distance(
                pickup_pincode, delivery_pincode,
                pickup_city=pickup_city, pickup_state=pickup_state,
                delivery_city=delivery_city, delivery_state=delivery_state
            )
            
            print(f"[PRICE ESTIMATE] Distance result: {distance}")
            
            if distance is None:
                error_response = {
                    "error": "Unable to calculate distance. Please check the city/state selections.",
                    "pickup_city": pickup_city,
                    "pickup_state": pickup_state,
                    "delivery_city": delivery_city,
                    "delivery_state": delivery_state
                }
                print(f"[PRICE ESTIMATE ERROR] Distance is None, returning: {error_response}")
                return Response(error_response, status=status.HTTP_400_BAD_REQUEST)
            
            # Get price breakdown
            print(f"[PRICE ESTIMATE] Calculating price breakdown...")
            breakdown = get_price_breakdown(distance, weight, package_type)
            
            print(f"[PRICE ESTIMATE] Price breakdown: {breakdown}")
            print(f"[PRICE ESTIMATE] Returning success response\n")
            
            return Response(breakdown, status=status.HTTP_200_OK)
        except Exception as e:
            import traceback
            print(f"\n[PRICE ESTIMATE EXCEPTION] {type(e).__name__}: {str(e)}")
            traceback.print_exc()
            print()
            error_response = {
                "error": f"Error calculating price: {str(e)}",
                "exception_type": type(e).__name__
            }
            return Response(error_response, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
        
        # Track if price-affecting fields changed
        recalculate_price = False
        
        # Update allowed fields
        if 'pickup_address' in request.data:
            delivery.pickup_address = request.data['pickup_address']
            recalculate_price = True
        if 'delivery_address' in request.data:
            delivery.delivery_address = request.data['delivery_address']
            recalculate_price = True
        if 'weight' in request.data:
            delivery.weight = request.data['weight']
            recalculate_price = True
        if 'package_type' in request.data:
            delivery.package_type = request.data['package_type']
            recalculate_price = True
        if 'pickup_date' in serializer.validated_data:
            delivery.pickup_date = serializer.validated_data['pickup_date']
        
        # Recalculate price if needed
        if recalculate_price:
            # Extract pincodes from request
            request_data = request.data
            pickup_pincode = None
            delivery_pincode = None
            
            if isinstance(request_data.get('pickup'), dict):
                pickup_pincode = request_data.get('pickup', {}).get('pincode')
            if isinstance(request_data.get('delivery'), dict):
                delivery_pincode = request_data.get('delivery', {}).get('pincode')
            
            # If pincodes are available, use them for distance calculation
            if pickup_pincode and delivery_pincode:
                distance = calculate_distance(pickup_pincode, delivery_pincode)
            else:
                # Fallback: try using the stored addresses (shouldn't happen in normal flow)
                distance = None
            
            if distance:
                delivery.distance = distance
            price = calculate_price(
                delivery.distance or 0,
                delivery.weight or 0,
                delivery.package_type or 'Small'
            )
            delivery.price = price
        
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
        user = User.objects(id=user_id).first()
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
        
        # Send notification to admin
        if user:
            notify_admin_on_delivery_cancelled(user_id, str(delivery.id), user.name)
        
        return Response({
            "message": "Delivery cancelled successfully",
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
        driver = User.objects(id=delivery.driver_id).first() if delivery.driver_id else None
        return Response({
            "tracking_number": delivery.tracking_number,
            "status": delivery.status,
            "driver_id": delivery.driver_id,
            "driver_name": driver.name if driver else None,
            "driver_contact": driver.contact_number if driver else None,
            "pickup_address": delivery.pickup_address,
            "delivery_address": delivery.delivery_address,
            "package_type": delivery.package_type,
            "weight": delivery.weight,
            "distance": delivery.distance,
            "price": delivery.price,
            "pickup_date": delivery.pickup_date,
            "delivery_date": delivery.delivery_date,
            "created_at": delivery.created_at,
            "updated_at": delivery.updated_at
        }, status=status.HTTP_200_OK)


class TrackDeliveryByPhoneView(APIView):
    def get(self, request, phone_number):
        # Find user by phone number
        user = User.objects(contact_number=phone_number).first()
        if not user:
            return Response({
                "error": "No user found with this phone number"
            }, status=status.HTTP_404_NOT_FOUND)

        # Get all deliveries for this user
        deliveries = Delivery.objects(user_id=str(user.id)).order_by('-created_at')
        if not deliveries:
            return Response({
                "error": "No deliveries found for this phone number"
            }, status=status.HTTP_404_NOT_FOUND)

        # Build response with all deliveries
        data = []
        for delivery in deliveries:
            driver = User.objects(id=delivery.driver_id).first() if delivery.driver_id else None
            data.append({
                "tracking_number": delivery.tracking_number,
                "status": delivery.status,
                "driver_id": delivery.driver_id,
                "driver_name": driver.name if driver else None,
                "driver_contact": driver.contact_number if driver else None,
                "pickup_address": delivery.pickup_address,
                "delivery_address": delivery.delivery_address,
                "package_type": delivery.package_type,
                "weight": delivery.weight,
                "distance": delivery.distance,
                "price": delivery.price,
                "pickup_date": delivery.pickup_date,
                "delivery_date": delivery.delivery_date,
                "created_at": delivery.created_at,
                "updated_at": delivery.updated_at
            })
        
        return Response(data, status=status.HTTP_200_OK)


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


class AdminUserDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, user_id):
        user_role = getattr(request.user, 'role', 'user')
        if user_role != 'admin':
            return Response({"error": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)
        
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
    
    def put(self, request, user_id):
        user_role = getattr(request.user, 'role', 'user')
        if user_role != 'admin':
            return Response({"error": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)
        
        user = User.objects(id=user_id).first()
        if not user:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Update user fields
        user.name = request.data.get('name', user.name)
        user.email = request.data.get('email', user.email)
        user.contact_number = request.data.get('contact_number', user.contact_number)
        user.address = request.data.get('address', user.address)
        new_role = request.data.get('role', user.role)
        
        # If changing to support_agent, automatically approve them
        if new_role == 'support_agent':
            user.is_support_agent_approved = 'true'
        
        user.role = new_role
        user.updated_at = datetime.utcnow()
        user.save()
        
        return Response({
            "message": "User updated successfully",
            "user": {
                "id": str(user.id),
                "email": user.email,
                "name": user.name,
                "role": user.role,
                "address": user.address,
                "contact_number": user.contact_number
            }
        }, status=status.HTTP_200_OK)


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
            driver = User.objects(id=d.driver_id).first() if d.driver_id else None
            data.append({
                "id": str(d.id),
                "user_id": d.user_id,
                "user_name": user_name,
                "user_email": user_email,
                "driver_id": d.driver_id,
                "driver_name": driver.name if driver else None,
                "driver_contact": driver.contact_number if driver else None,
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

        old_status = delivery.status
        delivery.status = serializer.validated_data['status']
        delivery.updated_at = datetime.utcnow()
        if delivery.status == 'Delivered' and not delivery.delivery_date:
            delivery.delivery_date = datetime.utcnow()
        delivery.save()
        
        # Get user and driver info for email
        user = User.objects(id=delivery.user_id).first()
        driver = User.objects(id=delivery.driver_id).first() if delivery.driver_id else None
        
        # Send notification to user about status update
        notify_user_on_delivery_updated(delivery.user_id, str(delivery.id), delivery.status)
        
        # Send notification to admin and user if delivered
        if delivery.status == 'Delivered':
            driver_name = driver.name if driver else 'Driver'
            notify_admin_on_delivery_delivered(delivery.user_id, str(delivery.id), driver_name)
            notify_user_on_delivery_delivered(delivery.user_id, str(delivery.id), driver_name)
        
        # Send status update email to user
        if user and user.email:
            try:
                send_status_update_email(
                    user_email=user.email,
                    user_name=user.name,
                    delivery_data={
                        'tracking_number': delivery.tracking_number,
                        'pickup_address': delivery.pickup_address,
                        'delivery_address': delivery.delivery_address,
                        'driver_name': driver.name if driver else None,
                        'driver_contact': driver.contact_number if driver else None
                    },
                    old_status=old_status,
                    new_status=delivery.status
                )
            except Exception as e:
                # Log error but don't fail the request
                print(f"Failed to send status update email: {str(e)}")

        return Response({
            "message": "Delivery status updated successfully",
            "delivery": {
                "id": str(delivery.id),
                "status": delivery.status,
                "tracking_number": delivery.tracking_number,
                "updated_at": delivery.updated_at
            }
        }, status=status.HTTP_200_OK)


class AdminDeliveryAssignDriverView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, delivery_id):
        user_role = getattr(request.user, 'role', 'user')
        if user_role != 'admin':
            return Response({"error": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)

        delivery = Delivery.objects(id=delivery_id).first()
        if not delivery:
            return Response({"error": "Delivery not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = DeliveryDriverAssignSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        driver_id = serializer.validated_data['driver_id']
        driver = User.objects(id=driver_id).first()
        if not driver or driver.role != 'driver':
            return Response({"error": "Invalid driver"}, status=status.HTTP_400_BAD_REQUEST)

        delivery.driver_id = driver_id
        if delivery.status == 'Pending':
            delivery.status = 'Scheduled'
        delivery.updated_at = datetime.utcnow()
        delivery.save()
        
        # Send notifications about driver assignment
        user = User.objects(id=delivery.user_id).first()
        user_name = user.name if user else "User"
        notify_driver_on_assignment(driver_id, str(delivery.id), user_name)
        notify_user_on_driver_assignment(delivery.user_id, str(delivery.id), driver.name)
        
        # Send driver assignment email to user
        if user and user.email:
            try:
                send_driver_assigned_email(
                    user_email=user.email,
                    user_name=user.name,
                    delivery_data={
                        'tracking_number': delivery.tracking_number,
                        'pickup_address': delivery.pickup_address,
                        'delivery_address': delivery.delivery_address,
                        'pickup_date': delivery.pickup_date.strftime('%d %B %Y') if delivery.pickup_date else 'N/A'
                    },
                    driver_name=driver.name,
                    driver_contact=driver.contact_number
                )
            except Exception as e:
                # Log error but don't fail the request
                print(f"Failed to send driver assignment email: {str(e)}")

        return Response({
            "message": "Driver assigned successfully",
            "delivery": {
                "id": str(delivery.id),
                "status": delivery.status,
                "driver_id": delivery.driver_id,
                "driver_name": driver.name,
                "driver_contact": driver.contact_number,
                "tracking_number": delivery.tracking_number,
                "updated_at": delivery.updated_at
            }
        }, status=status.HTTP_200_OK)


# ============ DRIVER VIEWS ============

class DriverDeliveriesView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user_role = getattr(request.user, 'role', 'user')
        user_id = getattr(request.user, 'id', None)
        
        if user_role != 'driver':
            return Response({"error": "Driver access required"}, status=status.HTTP_403_FORBIDDEN)

        # Get deliveries assigned to this driver
        deliveries = Delivery.objects(driver_id=user_id).order_by('-created_at')
        status_filter = request.query_params.get('status')
        if status_filter:
            deliveries = deliveries.filter(status=status_filter)
        
        data = []
        for d in deliveries:
            user = User.objects(id=d.user_id).first()
            user_name = user.name if user else "Unknown"
            user_email = user.email if user else "Unknown"
            user_contact = user.contact_number if user else "Unknown"
            data.append({
                "id": str(d.id),
                "user_id": d.user_id,
                "user_name": user_name,
                "user_email": user_email,
                "user_contact": user_contact,
                "driver_id": d.driver_id,
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


class DriverDeliveryStatusUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    ALLOWED_STATUSES = {'Out for Delivery', 'Delivered', 'Cancelled'}

    def put(self, request, delivery_id):
        user_role = getattr(request.user, 'role', 'user')
        user_id = getattr(request.user, 'id', None)
        if user_role != 'driver':
            return Response({"error": "Driver access required"}, status=status.HTTP_403_FORBIDDEN)

        delivery = Delivery.objects(id=delivery_id, driver_id=user_id).first()
        if not delivery:
            return Response({"error": "Delivery not found or not assigned"}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        if new_status not in self.ALLOWED_STATUSES:
            return Response({"error": "Invalid status for driver"}, status=status.HTTP_400_BAD_REQUEST)

        old_status = delivery.status
        delivery.status = new_status
        if new_status == 'Delivered' and not delivery.delivery_date:
            delivery.delivery_date = datetime.utcnow()
        delivery.updated_at = datetime.utcnow()
        delivery.save()

        # Get user and driver info for email
        user = User.objects(id=delivery.user_id).first()
        driver = User.objects(id=delivery.driver_id).first() if delivery.driver_id else None
        
        # Notify user and admin as needed
        notify_user_on_delivery_updated(delivery.user_id, str(delivery.id), delivery.status)
        if delivery.status == 'Delivered':
            driver_name = driver.name if driver else 'Driver'
            notify_admin_on_delivery_delivered(delivery.user_id, str(delivery.id), driver_name)
            notify_user_on_delivery_delivered(delivery.user_id, str(delivery.id), driver_name)
        
        # Send status update email to user
        if user and user.email:
            try:
                send_status_update_email(
                    user_email=user.email,
                    user_name=user.name,
                    delivery_data={
                        'tracking_number': delivery.tracking_number,
                        'pickup_address': delivery.pickup_address,
                        'delivery_address': delivery.delivery_address,
                        'driver_name': driver.name if driver else None,
                        'driver_contact': driver.contact_number if driver else None
                    },
                    old_status=old_status,
                    new_status=delivery.status
                )
            except Exception as e:
                # Log error but don't fail the request
                print(f"Failed to send status update email: {str(e)}")

        return Response({
            "message": "Delivery status updated successfully",
            "delivery": {
                "id": str(delivery.id),
                "status": delivery.status,
                "tracking_number": delivery.tracking_number,
                "updated_at": delivery.updated_at
            }
        }, status=status.HTTP_200_OK)


# ==================== NOTIFICATION VIEWS ====================

class NotificationsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get all notifications for the current user"""
        user_id = getattr(request.user, 'id', None)
        user = User.objects(id=user_id).first()
        
        if not user:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Get query parameters for filtering
        limit = request.query_params.get('limit', 20)
        unread_only = request.query_params.get('unread_only', 'false')
        
        try:
            limit = int(limit)
        except:
            limit = 20
        
        # Get notifications
        notifications = Notification.objects(recipient_id=user_id).order_by('-created_at')
        
        if unread_only == 'true':
            notifications = notifications.filter(is_read='false')
        
        notifications = notifications.limit(limit)
        
        # Serialize and return
        data = []
        for notif in notifications:
            data.append({
                "id": str(notif.id),
                "recipient_id": notif.recipient_id,
                "recipient_role": notif.recipient_role,
                "title": notif.title,
                "message": notif.message,
                "notification_type": notif.notification_type,
                "related_delivery_id": notif.related_delivery_id,
                "related_user_id": notif.related_user_id,
                "is_read": notif.is_read,
                "action_url": notif.action_url,
                "created_at": notif.created_at,
                "updated_at": notif.updated_at
            })
        
        # Count unread
        unread_count = Notification.objects(recipient_id=user_id, is_read='false').count()
        
        return Response({
            "notifications": data,
            "unread_count": unread_count,
            "total_count": Notification.objects(recipient_id=user_id).count()
        }, status=status.HTTP_200_OK)


class NotificationDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, notification_id):
        """Get a specific notification"""
        user_id = getattr(request.user, 'id', None)
        
        notification = Notification.objects(id=notification_id, recipient_id=user_id).first()
        if not notification:
            return Response({"error": "Notification not found"}, status=status.HTTP_404_NOT_FOUND)
        
        return Response({
            "id": str(notification.id),
            "recipient_id": notification.recipient_id,
            "recipient_role": notification.recipient_role,
            "title": notification.title,
            "message": notification.message,
            "notification_type": notification.notification_type,
            "related_delivery_id": notification.related_delivery_id,
            "related_user_id": notification.related_user_id,
            "is_read": notification.is_read,
            "action_url": notification.action_url,
            "created_at": notification.created_at,
            "updated_at": notification.updated_at
        }, status=status.HTTP_200_OK)


class MarkNotificationAsReadView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, notification_id):
        """Mark a notification as read"""
        user_id = getattr(request.user, 'id', None)
        
        notification = Notification.objects(id=notification_id, recipient_id=user_id).first()
        if not notification:
            return Response({"error": "Notification not found"}, status=status.HTTP_404_NOT_FOUND)
        
        notification.is_read = 'true'
        notification.updated_at = datetime.utcnow()
        notification.save()
        
        return Response({
            "message": "Notification marked as read",
            "notification_id": notification_id
        }, status=status.HTTP_200_OK)


class MarkAllNotificationsAsReadView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Mark all notifications as read for the current user"""
        user_id = getattr(request.user, 'id', None)
        
        notifications = Notification.objects(recipient_id=user_id, is_read='false')
        count = notifications.count()
        
        for notification in notifications:
            notification.is_read = 'true'
            notification.updated_at = datetime.utcnow()
            notification.save()
        
        return Response({
            "message": f"Marked {count} notifications as read"
        }, status=status.HTTP_200_OK)


class DeleteNotificationView(APIView):
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, notification_id):
        """Delete a notification"""
        user_id = getattr(request.user, 'id', None)
        
        notification = Notification.objects(id=notification_id, recipient_id=user_id).first()
        if not notification:
            return Response({"error": "Notification not found"}, status=status.HTTP_404_NOT_FOUND)
        
        notification.delete()
        
        return Response({
            "message": "Notification deleted"
        }, status=status.HTTP_204_NO_CONTENT)


class UnreadNotificationCountView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get unread notification count"""
        user_id = getattr(request.user, 'id', None)
        
        unread_count = Notification.objects(recipient_id=user_id, is_read='false').count()
        
        return Response({
            "unread_count": unread_count
        }, status=status.HTTP_200_OK)

# ==================== CUSTOMER SUPPORT SYSTEM ====================

class SupportAgentRegisterView(APIView):
    """Register a new support agent (requires admin approval)"""
    def post(self, request):
        serializer = SupportAgentRegisterSerializer(data=request.data)
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
            contact_number=data.get('contact_number', ''),
            role='support_agent',
            is_support_agent_approved='false'
        )
        user.save()
        
        # Notify admin about new agent registration
        admins = User.objects(role='admin')
        for admin in admins:
            notification = Notification(
                recipient_id=str(admin.id),
                recipient_role='admin',
                title='New Support Agent Registration',
                message=f'New support agent {user.name} ({user.email}) is waiting for approval',
                notification_type='important',
                related_user_id=str(user.id),
                action_url=f'/admin/support-agents/{str(user.id)}/'
            )
            notification.save()
        
        return Response({
            "message": "Registration successful. Waiting for admin approval.",
            "user": {
                "id": str(user.id),
                "email": user.email,
                "name": user.name,
                "role": user.role
            }
        }, status=status.HTTP_201_CREATED)


class ApproveAgentView(APIView):
    """Admin approves a support agent"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, agent_id):
        # Check if user is admin
        user_id = getattr(request.user, 'id', None)
        admin = User.objects(id=user_id, role='admin').first()
        if not admin:
            return Response({"error": "Only admins can approve agents"}, status=status.HTTP_403_FORBIDDEN)
        
        agent = User.objects(id=agent_id, role='support_agent').first()
        if not agent:
            return Response({"error": "Agent not found"}, status=status.HTTP_404_NOT_FOUND)
        
        agent.is_support_agent_approved = 'true'
        agent.updated_at = datetime.utcnow()
        agent.save()
        
        # Notify agent
        notification = Notification(
            recipient_id=str(agent.id),
            recipient_role='support_agent',
            title='Agent Approval Confirmed',
            message='Your agent account has been approved. You can now access the agent dashboard.',
            notification_type='success'
        )
        notification.save()
        
        return Response({
            "message": "Agent approved successfully"
        }, status=status.HTTP_200_OK)


class CreateSupportTicketView(APIView):
    """Customer creates a support ticket"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = SupportTicketSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        user_id = getattr(request.user, 'id', None)
        data = serializer.validated_data
        
        ticket = SupportTicket(
            customer_id=user_id,
            delivery_id=data.get('delivery_id', ''),
            subject=data['subject'],
            description=data['description'],
            category=data['category'],
            status='Open',
            priority='Medium'
        )
        ticket.save()
        
        # Notify all support agents and admins
        agents = User.objects(role='support_agent', is_support_agent_approved='true')
        admins = User.objects(role='admin')
        
        for agent in agents:
            notification = Notification(
                recipient_id=str(agent.id),
                recipient_role='support_agent',
                title=f'New Support Ticket: {ticket.subject}',
                message=f'A new support ticket has been created.',
                notification_type='important',
                related_user_id=user_id,
                action_url=f'/support/tickets/{str(ticket.id)}/'
            )
            notification.save()
        
        for admin in admins:
            notification = Notification(
                recipient_id=str(admin.id),
                recipient_role='admin',
                title=f'New Support Ticket: {ticket.subject}',
                message=f'A new support ticket has been created by a customer.',
                notification_type='info',
                related_user_id=user_id,
                action_url=f'/support/tickets/{str(ticket.id)}/'
            )
            notification.save()
        
        return Response({
            "message": "Support ticket created successfully",
            "ticket": {
                "id": str(ticket.id),
                "subject": ticket.subject,
                "status": ticket.status,
                "created_at": ticket.created_at
            }
        }, status=status.HTTP_201_CREATED)


class CustomerTicketsView(APIView):
    """Customer views their own support tickets"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user_id = getattr(request.user, 'id', None)
        
        tickets = SupportTicket.objects(customer_id=user_id).order_by('-created_at')
        
        ticket_list = []
        for ticket in tickets:
            ticket_list.append({
                "id": str(ticket.id),
                "subject": ticket.subject,
                "description": ticket.description,
                "category": ticket.category,
                "status": ticket.status,
                "priority": ticket.priority,
                "agent_id": ticket.agent_id,
                "created_at": ticket.created_at,
                "updated_at": ticket.updated_at,
                "resolved_at": ticket.resolved_at
            })
        
        return Response({
            "tickets": ticket_list
        }, status=status.HTTP_200_OK)


class TicketDetailView(APIView):
    """View ticket details and internal notes"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, ticket_id):
        user_id = getattr(request.user, 'id', None)
        
        ticket = SupportTicket.objects(id=ticket_id).first()
        if not ticket:
            return Response({"error": "Ticket not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Check permissions (customer, assigned agent, or admin)
        user = User.objects(id=user_id).first()
        if user.role == 'user' and ticket.customer_id != user_id:
            return Response({"error": "You can only view your own tickets"}, status=status.HTTP_403_FORBIDDEN)
        if user.role == 'support_agent' and ticket.agent_id != user_id:
            return Response({"error": "You can only view assigned tickets"}, status=status.HTTP_403_FORBIDDEN)
        
        # Get internal notes (only for agents and admins)
        internal_notes = []
        if user.role in ['support_agent', 'admin']:
            notes = TicketInternalNote.objects(ticket_id=ticket_id).order_by('created_at')
            for note in notes:
                internal_notes.append({
                    "id": str(note.id),
                    "agent_id": note.agent_id,
                    "note": note.note,
                    "created_at": note.created_at
                })
        
        return Response({
            "ticket": {
                "id": str(ticket.id),
                "subject": ticket.subject,
                "description": ticket.description,
                "category": ticket.category,
                "status": ticket.status,
                "priority": ticket.priority,
                "agent_id": ticket.agent_id,
                "customer_id": ticket.customer_id,
                "created_at": ticket.created_at,
                "updated_at": ticket.updated_at,
                "resolved_at": ticket.resolved_at
            },
            "internal_notes": internal_notes
        }, status=status.HTTP_200_OK)


class AssignToSelfView(APIView):
    """Support agent assigns ticket to themselves"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, ticket_id):
        user_id = getattr(request.user, 'id', None)
        
        # Check if user is a support agent
        user = User.objects(id=user_id, role='support_agent', is_support_agent_approved='true').first()
        if not user:
            return Response({"error": "Only approved support agents can assign tickets"}, status=status.HTTP_403_FORBIDDEN)
        
        ticket = SupportTicket.objects(id=ticket_id).first()
        if not ticket:
            return Response({"error": "Ticket not found"}, status=status.HTTP_404_NOT_FOUND)
        
        if ticket.agent_id:
            return Response({"error": "Ticket is already assigned"}, status=status.HTTP_400_BAD_REQUEST)
        
        ticket.agent_id = user_id
        ticket.status = 'In Progress'
        ticket.updated_at = datetime.utcnow()
        ticket.save()
        
        # Notify customer
        notification = Notification(
            recipient_id=ticket.customer_id,
            recipient_role='user',
            title='Support Ticket Assigned',
            message=f'Your support ticket "{ticket.subject}" has been assigned to an agent.',
            notification_type='info',
            action_url=f'/support/tickets/{str(ticket.id)}/'
        )
        notification.save()
        
        return Response({
            "message": "Ticket assigned to you successfully",
            "ticket": {
                "id": str(ticket.id),
                "status": ticket.status,
                "agent_id": ticket.agent_id
            }
        }, status=status.HTTP_200_OK)


class UpdateTicketStatusView(APIView):
    """Update ticket status and priority"""
    permission_classes = [IsAuthenticated]
    
    def put(self, request, ticket_id):
        user_id = getattr(request.user, 'id', None)
        
        serializer = TicketStatusUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        ticket = SupportTicket.objects(id=ticket_id).first()
        if not ticket:
            return Response({"error": "Ticket not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Check permissions (assigned agent or admin)
        user = User.objects(id=user_id).first()
        if user.role == 'support_agent' and ticket.agent_id != user_id:
            return Response({"error": "You can only update assigned tickets"}, status=status.HTTP_403_FORBIDDEN)
        
        data = serializer.validated_data
        old_status = ticket.status
        ticket.status = data['status']
        
        if 'priority' in data:
            ticket.priority = data['priority']
        
        if data['status'] == 'Resolved':
            ticket.resolved_at = datetime.utcnow()
        
        if data['status'] == 'Closed':
            ticket.closed_at = datetime.utcnow()
        
        ticket.updated_at = datetime.utcnow()
        ticket.save()
        
        # Notify customer about status change
        notification = Notification(
            recipient_id=ticket.customer_id,
            recipient_role='user',
            title='Support Ticket Updated',
            message=f'Your support ticket status changed from {old_status} to {data["status"]}.',
            notification_type='info',
            action_url=f'/support/tickets/{str(ticket.id)}/'
        )
        notification.save()
        
        # Notify admin
        admins = User.objects(role='admin')
        for admin in admins:
            notification = Notification(
                recipient_id=str(admin.id),
                recipient_role='admin',
                title='Support Ticket Updated',
                message=f'Ticket "{ticket.subject}" status changed to {data["status"]}.',
                notification_type='info',
                related_user_id=user_id,
                action_url=f'/support/tickets/{str(ticket.id)}/'
            )
            notification.save()
        
        return Response({
            "message": "Ticket status updated successfully",
            "ticket": {
                "id": str(ticket.id),
                "status": ticket.status,
                "priority": ticket.priority
            }
        }, status=status.HTTP_200_OK)


class ReassignTicketView(APIView):
    """Admin reassigns ticket to another agent"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, ticket_id):
        user_id = getattr(request.user, 'id', None)
        
        # Check if user is admin
        user = User.objects(id=user_id, role='admin').first()
        if not user:
            return Response({"error": "Only admins can reassign tickets"}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = TicketReassignSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        ticket = SupportTicket.objects(id=ticket_id).first()
        if not ticket:
            return Response({"error": "Ticket not found"}, status=status.HTTP_404_NOT_FOUND)
        
        new_agent_id = serializer.validated_data['agent_id']
        agent = User.objects(id=new_agent_id, role='support_agent', is_support_agent_approved='true').first()
        if not agent:
            return Response({"error": "Agent not found or not approved"}, status=status.HTTP_404_NOT_FOUND)
        
        old_agent_id = ticket.agent_id
        ticket.agent_id = new_agent_id
        ticket.updated_at = datetime.utcnow()
        ticket.save()
        
        # Notify new agent
        notification = Notification(
            recipient_id=new_agent_id,
            recipient_role='support_agent',
            title='Ticket Reassigned',
            message=f'Ticket "{ticket.subject}" has been reassigned to you.',
            notification_type='info',
            action_url=f'/support/tickets/{str(ticket.id)}/'
        )
        notification.save()
        
        return Response({
            "message": "Ticket reassigned successfully",
            "ticket": {
                "id": str(ticket.id),
                "agent_id": ticket.agent_id
            }
        }, status=status.HTTP_200_OK)


class AddInternalNoteView(APIView):
    """Support agent adds internal note to ticket"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, ticket_id):
        user_id = getattr(request.user, 'id', None)
        
        # Check if user is support agent
        user = User.objects(id=user_id, role='support_agent').first()
        if not user:
            return Response({"error": "Only support agents can add internal notes"}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = TicketInternalNoteSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        ticket = SupportTicket.objects(id=ticket_id).first()
        if not ticket:
            return Response({"error": "Ticket not found"}, status=status.HTTP_404_NOT_FOUND)
        
        note = TicketInternalNote(
            ticket_id=ticket_id,
            agent_id=user_id,
            note=serializer.validated_data['note']
        )
        note.save()
        
        return Response({
            "message": "Internal note added successfully",
            "note": {
                "id": str(note.id),
                "note": note.note,
                "created_at": note.created_at
            }
        }, status=status.HTTP_201_CREATED)


class SubmitTicketFeedbackView(APIView):
    """Customer submits feedback on resolved ticket"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, ticket_id):
        user_id = getattr(request.user, 'id', None)
        
        serializer = TicketFeedbackSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        ticket = SupportTicket.objects(id=ticket_id).first()
        if not ticket:
            return Response({"error": "Ticket not found"}, status=status.HTTP_404_NOT_FOUND)
        
        if ticket.customer_id != user_id:
            return Response({"error": "You can only submit feedback for your own tickets"}, status=status.HTTP_403_FORBIDDEN)
        
        if ticket.status != 'Resolved':
            return Response({"error": "Feedback can only be submitted for resolved tickets"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if feedback already exists
        existing_feedback = TicketFeedback.objects(ticket_id=ticket_id).first()
        if existing_feedback:
            return Response({"error": "Feedback already submitted for this ticket"}, status=status.HTTP_400_BAD_REQUEST)
        
        feedback = TicketFeedback(
            ticket_id=ticket_id,
            customer_id=user_id,
            agent_id=ticket.agent_id,
            rating=serializer.validated_data['rating'],
            comment=serializer.validated_data.get('comment', '')
        )
        feedback.save()
        
        return Response({
            "message": "Feedback submitted successfully",
            "feedback": {
                "id": str(feedback.id),
                "rating": feedback.rating,
                "created_at": feedback.created_at
            }
        }, status=status.HTTP_201_CREATED)


class SupportFAQListView(APIView):
    """List FAQs by category"""
    
    def get(self, request):
        category = request.query_params.get('category', '')
        
        if category:
            faqs = SupportFAQ.objects(category=category, is_active='true').order_by('-created_at')
        else:
            faqs = SupportFAQ.objects(is_active='true').order_by('-created_at')
        
        faq_list = []
        for faq in faqs:
            faq_list.append({
                "id": str(faq.id),
                "question": faq.question,
                "answer": faq.answer,
                "category": faq.category
            })
        
        return Response({
            "faqs": faq_list
        }, status=status.HTTP_200_OK)


class AdminTicketsView(APIView):
    """Admin views all support tickets"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user_id = getattr(request.user, 'id', None)
        
        # Check if user is admin
        user = User.objects(id=user_id, role='admin').first()
        if not user:
            return Response({"error": "Only admins can view all tickets"}, status=status.HTTP_403_FORBIDDEN)
        
        status_filter = request.query_params.get('status', '')
        
        if status_filter:
            tickets = SupportTicket.objects(status=status_filter).order_by('-created_at')
        else:
            tickets = SupportTicket.objects().order_by('-created_at')
        
        ticket_list = []
        for ticket in tickets:
            customer = User.objects(id=ticket.customer_id).first()
            agent = User.objects(id=ticket.agent_id).first() if ticket.agent_id else None
            
            ticket_list.append({
                "id": str(ticket.id),
                "subject": ticket.subject,
                "category": ticket.category,
                "status": ticket.status,
                "priority": ticket.priority,
                "customer_name": customer.name if customer else "Unknown",
                "agent_name": agent.name if agent else "Unassigned",
                "created_at": ticket.created_at,
                "updated_at": ticket.updated_at
            })
        
        return Response({
            "tickets": ticket_list
        }, status=status.HTTP_200_OK)


class AgentTicketsView(APIView):
    """Support agent views assigned tickets"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user_id = getattr(request.user, 'id', None)
        
        # Check if user is support agent
        user = User.objects(id=user_id, role='support_agent', is_support_agent_approved='true').first()
        if not user:
            return Response({"error": "Only approved support agents can view assigned tickets"}, status=status.HTTP_403_FORBIDDEN)
        
        status_filter = request.query_params.get('status', '')
        
        if status_filter:
            tickets = SupportTicket.objects(agent_id=user_id, status=status_filter).order_by('-created_at')
        else:
            tickets = SupportTicket.objects(agent_id=user_id).order_by('-created_at')
        
        ticket_list = []
        for ticket in tickets:
            customer = User.objects(id=ticket.customer_id).first()
            
            ticket_list.append({
                "id": str(ticket.id),
                "subject": ticket.subject,
                "description": ticket.description,
                "category": ticket.category,
                "status": ticket.status,
                "priority": ticket.priority,
                "customer_name": customer.name if customer else "Unknown",
                "customer_id": ticket.customer_id,
                "created_at": ticket.created_at,
                "updated_at": ticket.updated_at
            })
        
        return Response({
            "tickets": ticket_list
        }, status=status.HTTP_200_OK)


class AdminSupportAgentsView(APIView):
    """Admin gets list of all support agents"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user_id = getattr(request.user, 'id', None)
        
        # Check if user is admin
        user = User.objects(id=user_id, role='admin').first()
        if not user:
            return Response({"error": "Only admins can view support agents"}, status=status.HTTP_403_FORBIDDEN)
        
        # Get all approved support agents
        agents = User.objects(role='support_agent', is_support_agent_approved='true')
        
        agent_list = []
        for agent in agents:
            agent_list.append({
                "id": str(agent.id),
                "name": agent.name,
                "email": agent.email
            })
        
        return Response({
            "agents": agent_list
        }, status=status.HTTP_200_OK)