from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed

from .models import Compte


class CompteJWTAuthentication(JWTAuthentication):

    def get_user(self, validated_token):
        
        compte_id = validated_token.get("compte_id")

        if not compte_id:
            raise AuthenticationFailed(
                "Token does not contain compte_id."
            )

        try:
            
            
            return Compte.objects.get(
                id=compte_id
            )
            
        except Compte.DoesNotExist:
            raise AuthenticationFailed(
                "Compte not found."
            )