from django.utils import timezone
from django.db.models import Q

from rest_framework import viewsets, mixins, permissions, decorators, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework.response import Response

from .models import Language, Paste, Comment, Star
from .serializers import (
    LanguageSerializer,
    PasteSerializer,
    CommentSerializer,
    StarSerializer,
)
from .permissions import IsOwnerOrReadOnly


@api_view(["GET"])
@permission_classes([AllowAny])
def healthcheck(_request):
    return Response({"status": "ok"})


class LanguageViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Language.objects.all().order_by("name")
    serializer_class = LanguageSerializer
    permission_classes = [AllowAny]


class PasteViewSet(viewsets.ModelViewSet):
    serializer_class = PasteSerializer
    permission_classes = [IsOwnerOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        qs = Paste.objects.select_related("owner", "language").all()

        if self.action == "list":
            if user.is_authenticated:
                return qs.filter(Q(visibility=Paste.Visibility.PUBLIC) | Q(owner=user))
            return qs.filter(visibility=Paste.Visibility.PUBLIC)
        return qs

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        obj = self.get_object()

        if obj.visibility == Paste.Visibility.PRIVATE and obj.owner_id != request.user.id:
            return Response(status=status.HTTP_403_FORBIDDEN)

        obj.views = (obj.views or 0) + 1
        obj.save(update_fields=["views"])

        return super().retrieve(request, *args, **kwargs)

    @decorators.action(detail=False, methods=["GET"], permission_classes=[AllowAny])
    def trending(self, request):
        since = timezone.now() - timezone.timedelta(hours=24)
        qs = (
            Paste.objects.select_related("owner", "language")
            .filter(visibility=Paste.Visibility.PUBLIC, updated_at__gte=since)
            .order_by("-views")[:10]
        )
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)


class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def get_queryset(self):
        return Comment.objects.select_related("paste", "author").all()

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class StarViewSet(viewsets.ModelViewSet):
    serializer_class = StarSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Star.objects.select_related("paste", "user").filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
