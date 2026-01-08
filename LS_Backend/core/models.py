from mongoengine import Document, StringField, DateTimeField, FloatField
from datetime import datetime

class User(Document):
    email = StringField(required=True, unique=True)
    password_hash = StringField(required=True)
    name = StringField(required=True)
    role = StringField(default='user')  # user/admin/support_agent
    address = StringField()
    contact_number = StringField()
    is_support_agent_approved = StringField(default='false')  # For support agent approval
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    meta = {'collection': 'users'}


class Delivery(Document):
    user_id = StringField(required=True)  # Reference to User
    status = StringField(default='Pending')  # Pending, In Progress, Delivered
    driver_id = StringField()  # Reference to User with role=driver
    pickup_address = StringField(required=True)
    delivery_address = StringField(required=True)
    weight = FloatField()  # Weight in kg
    package_type = StringField()  # Small, Medium, Large, Fragile, Electronics
    pickup_date = DateTimeField(required=True)
    delivery_date = DateTimeField()
    tracking_number = StringField(unique=True)
    price = FloatField()  # Calculated price in INR
    distance = FloatField()  # Distance in km
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


class Notification(Document):
    recipient_id = StringField(required=True)  # User receiving the notification
    recipient_role = StringField(required=True)  # admin/user/driver
    title = StringField(required=True)
    message = StringField(required=True)
    notification_type = StringField(default='info')  # info/warning/important/success
    related_delivery_id = StringField()  # Reference to Delivery (if applicable)
    related_user_id = StringField()  # Reference to User who triggered the notification
    is_read = StringField(default='false')
    action_url = StringField()  # URL to navigate to on click
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    meta = {'collection': 'notifications', 'indexes': ['recipient_id', 'is_read', 'created_at']}

class SupportTicket(Document):
    customer_id = StringField(required=True)  # Reference to User
    delivery_id = StringField()  # Reference to Delivery (optional, but linked after delivery)
    agent_id = StringField()  # Reference to User with role=support_agent
    subject = StringField(required=True)
    description = StringField(required=True)
    category = StringField(required=True)  # Damaged, Lost, Late, Quality, Other
    status = StringField(default='Open')  # Open, In Progress, On Hold, Resolved, Closed
    priority = StringField(default='Medium')  # Low, Medium, High
    resolved_at = DateTimeField()
    closed_at = DateTimeField()
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    meta = {'collection': 'support_tickets', 'indexes': ['customer_id', 'agent_id', 'status', 'created_at']}


class TicketInternalNote(Document):
    ticket_id = StringField(required=True)  # Reference to SupportTicket
    agent_id = StringField(required=True)  # Reference to User
    note = StringField(required=True)
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {'collection': 'ticket_internal_notes'}


class SupportFAQ(Document):
    question = StringField(required=True)
    answer = StringField(required=True)
    category = StringField(required=True)  # Damaged, Lost, Late, Quality, Other
    is_active = StringField(default='true')
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    meta = {'collection': 'support_faq', 'indexes': ['category', 'is_active']}


class TicketFeedback(Document):
    ticket_id = StringField(required=True, unique=True)  # Reference to SupportTicket
    customer_id = StringField(required=True)  # Reference to User
    agent_id = StringField(required=True)  # Reference to User (agent who handled it)
    rating = StringField(required=True)  # 1-5
    comment = StringField()
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {'collection': 'ticket_feedback'}