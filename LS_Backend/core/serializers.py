from rest_framework import serializers
from .models import User, Delivery, Payment, Review

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
    pickup_address = serializers.CharField(required=True)
    delivery_address = serializers.CharField(required=True)
    weight = serializers.CharField(required=False)
    package_type = serializers.CharField(required=False)
    pickup_date = serializers.DateTimeField(required=True)
    delivery_date = serializers.DateTimeField(required=False)
    tracking_number = serializers.CharField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)


class DeliveryStatusUpdateSerializer(serializers.Serializer):
    status = serializers.CharField(required=True)


class DeliveryEditSerializer(serializers.Serializer):
    pickup_address = serializers.CharField(required=False)
    delivery_address = serializers.CharField(required=False)
    weight = serializers.CharField(required=False)
    package_type = serializers.CharField(required=False)
    pickup_date = serializers.DateTimeField(required=False)


class DeliveryCancelSerializer(serializers.Serializer):
    cancellation_reason = serializers.CharField(required=False)


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
