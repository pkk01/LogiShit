from rest_framework import serializers
from .models import (User, Delivery, Payment, Review, Notification, 
                     SupportTicket, TicketInternalNote, SupportFAQ, TicketFeedback)

class UserSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    email = serializers.EmailField()
    name = serializers.CharField()
    role = serializers.CharField()
    address = serializers.CharField()
    contact_number = serializers.CharField()


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)
    name = serializers.CharField(required=True)
    address = serializers.CharField(required=False)
    contact_number = serializers.CharField(required=False)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)


class DeliverySerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    user_id = serializers.CharField(read_only=True)
    status = serializers.CharField(read_only=True)
    driver_id = serializers.CharField(read_only=True)
    pickup_address = serializers.CharField(required=True)
    delivery_address = serializers.CharField(required=True)
    weight = serializers.FloatField(required=False)
    package_type = serializers.CharField(required=False)
    pickup_date = serializers.DateTimeField(required=True)
    delivery_date = serializers.DateTimeField(required=False)
    tracking_number = serializers.CharField(read_only=True)
    price = serializers.FloatField(read_only=True)
    distance = serializers.FloatField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)


class DeliveryStatusUpdateSerializer(serializers.Serializer):
    status = serializers.CharField(required=True)


class DeliveryEditSerializer(serializers.Serializer):
    pickup_address = serializers.CharField(required=False)
    delivery_address = serializers.CharField(required=False)
    weight = serializers.FloatField(required=False)
    package_type = serializers.CharField(required=False)
    pickup_date = serializers.DateTimeField(required=False)


class DeliveryCancelSerializer(serializers.Serializer):
    cancellation_reason = serializers.CharField(required=False)


class DeliveryDriverAssignSerializer(serializers.Serializer):
    driver_id = serializers.CharField(required=True)


class PaymentSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    user_id = serializers.CharField(read_only=True)
    delivery_id = serializers.CharField(required=True)
    amount = serializers.CharField(required=True)
    payment_status = serializers.CharField(read_only=True)
    payment_date = serializers.DateTimeField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)


class ReviewSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    delivery_id = serializers.CharField(required=True)
    user_id = serializers.CharField(read_only=True)
    rating = serializers.CharField(required=True)
    comment = serializers.CharField(required=False)
    created_at = serializers.DateTimeField(read_only=True)


class NotificationSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    recipient_id = serializers.CharField(read_only=True)
    recipient_role = serializers.CharField(read_only=True)
    title = serializers.CharField()
    message = serializers.CharField()
    notification_type = serializers.CharField(default='info')
    related_delivery_id = serializers.CharField(required=False, allow_blank=True)
    related_user_id = serializers.CharField(required=False, allow_blank=True)
    is_read = serializers.CharField(read_only=True)
    action_url = serializers.CharField(required=False, allow_blank=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)


class PriceEstimateSerializer(serializers.Serializer):
    pickup_pincode = serializers.CharField(required=True, min_length=1)
    delivery_pincode = serializers.CharField(required=True, min_length=1)
    weight = serializers.FloatField(required=True, min_value=0.1)
    package_type = serializers.CharField(required=True, min_length=1)
    
    # Required city/state (dropdown-driven) for distance calculation
    pickup_city = serializers.CharField(required=True, min_length=1)
    pickup_state = serializers.CharField(required=True, min_length=1)
    delivery_city = serializers.CharField(required=True, min_length=1)
    delivery_state = serializers.CharField(required=True, min_length=1)


# Support Ticket Serializers
class SupportTicketSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    customer_id = serializers.CharField(read_only=True)
    delivery_id = serializers.CharField(required=False, allow_blank=True)
    agent_id = serializers.CharField(read_only=True, required=False, allow_blank=True)
    subject = serializers.CharField(required=True)
    description = serializers.CharField(required=True)
    category = serializers.CharField(required=True)  # Damaged, Lost, Late, Quality, Other
    status = serializers.CharField(read_only=True)
    priority = serializers.CharField(read_only=True)
    resolved_at = serializers.DateTimeField(read_only=True, required=False)
    closed_at = serializers.DateTimeField(read_only=True, required=False)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)


class TicketStatusUpdateSerializer(serializers.Serializer):
    status = serializers.CharField(required=True)  # In Progress, On Hold, Resolved, Closed
    priority = serializers.CharField(required=False)  # Low, Medium, High


class TicketReassignSerializer(serializers.Serializer):
    agent_id = serializers.CharField(required=True)


class TicketInternalNoteSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    ticket_id = serializers.CharField(read_only=True)
    agent_id = serializers.CharField(read_only=True)
    note = serializers.CharField(required=True)
    created_at = serializers.DateTimeField(read_only=True)


class SupportFAQSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    question = serializers.CharField(required=True)
    answer = serializers.CharField(required=True)
    category = serializers.CharField(required=True)
    is_active = serializers.CharField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)


class TicketFeedbackSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    ticket_id = serializers.CharField(read_only=True)
    customer_id = serializers.CharField(read_only=True)
    agent_id = serializers.CharField(read_only=True)
    rating = serializers.CharField(required=True)  # 1-5
    comment = serializers.CharField(required=False, allow_blank=True)
    created_at = serializers.DateTimeField(read_only=True)


class SupportAgentRegisterSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)
    name = serializers.CharField(required=True)
    contact_number = serializers.CharField(required=False)

