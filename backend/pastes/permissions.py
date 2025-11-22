from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsOwnerOrReadOnly(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        if getattr(request.user, "is_staff", False):
            return True
        return getattr(obj, 'owner_id', None) == getattr(request.user, 'id', None)