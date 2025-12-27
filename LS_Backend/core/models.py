from mongoengine import Document, StringField, DateTimeField
from datetime import datetime

class User(Document):
    email = StringField(required=True, unique=True)
    password_hash = StringField(required=True)
    name = StringField(required=True)
    role = StringField(default='user')  # user/admin
    address = StringField()
    contact_number = StringField()
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    meta = {'collection': 'users'}


class Delivery(Document):
    user_id = StringField(required=True)  # Reference to User
    status = StringField(default='Pending')  # Pending, In Progress, Delivered
    pickup_address = StringField(required=True)
    delivery_address = StringField(required=True)
    weight = StringField()  # e.g., "5kg"
    package_type = StringField()  # Small, Medium, Large
    pickup_date = DateTimeField(required=True)
    delivery_date = DateTimeField()
    tracking_number = StringField(unique=True)
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    meta = {'collection': 'deliveries'}


class Payment(Document):
    user_id = StringField(required=True)  # Reference to User
    delivery_id = StringField(required=True)  # Reference to Delivery
    amount = StringField(required=True)
    payment_status = StringField(default='Pending')  # Paid, Pending, Failed
    payment_date = DateTimeField(default=datetime.utcnow)
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {'collection': 'payments'}


class Review(Document):
    delivery_id = StringField(required=True)  # Reference to Delivery
    user_id = StringField(required=True)  # Reference to User
    rating = StringField(required=True)  # 1-5
    comment = StringField()
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {'collection': 'reviews'}
