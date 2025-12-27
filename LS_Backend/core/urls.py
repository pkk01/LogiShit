from django.urls import path
from .views import (
    RegisterView, LoginView, ProfileView,
    DeliveryListCreateView, DeliveryDetailView, DeliveryEditView, DeliveryCancelView,
    AdminUsersView, AdminDeliveriesView, AdminDeliveryUpdateView,
    TrackDeliveryView, ReviewListCreateView, DeliveryReviewsView
)

urlpatterns = [
        # Authentication
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', ProfileView.as_view(), name='profile'),
    
    # Delivery Management
    path('deliveries/', DeliveryListCreateView.as_view(), name='deliveries'),
    path('deliveries/<str:delivery_id>/', DeliveryDetailView.as_view(), name='delivery-detail'),
    path('deliveries/<str:delivery_id>/edit/', DeliveryEditView.as_view(), name='delivery-edit'),
    path('deliveries/<str:delivery_id>/cancel/', DeliveryCancelView.as_view(), name='delivery-cancel'),
    
    # Admin
    path('admin/users/', AdminUsersView.as_view(), name='admin-users'),
    path('admin/deliveries/', AdminDeliveriesView.as_view(), name='admin-deliveries'),
    path('admin/delivery/<str:delivery_id>/', AdminDeliveryUpdateView.as_view(), name='admin-delivery-update'),
    
    # Tracking (Public)
    path('track/<str:tracking_number>/', TrackDeliveryView.as_view(), name='track-delivery'),
    
    # Reviews
    path('reviews/', ReviewListCreateView.as_view(), name='reviews'),
    path('deliveries/<str:delivery_id>/reviews/', DeliveryReviewsView.as_view(), name='delivery-reviews'),
]
