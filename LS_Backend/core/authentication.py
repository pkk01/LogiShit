from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.authentication import JWTAuthentication


class MongoAuthUser(AnonymousUser):
    def __init__(self, user_id: str, email: str, role: str):
        super().__init__()
        self.id = user_id
        self.email = email
        self.role = role
        self._is_authenticated = True

    @property
    def is_authenticated(self):
        return self._is_authenticated


class MongoJWTAuthentication(JWTAuthentication):
    """
    JWT auth that trusts token claims and does not load Django User.
    Expects claims: user_id, email, role.
    """
    def get_user(self, validated_token):
        user_id = validated_token.get('user_id')
        email = validated_token.get('email', '')
        role = validated_token.get('role', 'user')
        if not user_id:
            # Fallback to anonymous (unauthenticated)
            return AnonymousUser()
        return MongoAuthUser(str(user_id), email, role)