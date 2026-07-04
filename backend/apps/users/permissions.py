from rest_framework.permissions import BasePermission

class IsAdminRole(BasePermission):
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == "ADMIN"
    
class IsClientRole(BasePermission):
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == "CLIENT"

class IsOwnerOrAdmin(BasePermission):
    """Permission : propriétaire de l'objet ou admin."""
    
    def has_object_permission(self, request, view, obj):
        if request.user.role == "ADMIN":
            return True
        # obj peut être un User ou avoir un attribut user
        owner = obj if hasattr(obj, "email") else getattr(obj, "user", None)
        return owner == request.user