from rest_framework.permissions import BasePermission
from .models import Compte


class IsAdmin(BasePermission):

    message = "Only administrators can access this resource."

    def has_permission(self, request, view):

        if request.user is None:
            return False

        return request.user.role == Compte.Role.ADMIN