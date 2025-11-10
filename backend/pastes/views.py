from django.utils import timezone
from datetime import datetime
from django.db.models import Q, Count
from django.db.models.functions import TruncMonth
from django_filters import rest_framework as filters

from rest_framework import viewsets, mixins, permissions, decorators, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Language, Paste, Comment, Star, ViewEvent
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


class PasteFilter(filters.FilterSet):
    created_at = filters.DateFromToRangeFilter()

    class Meta:
        model = Paste
        fields = {
            "language": ["exact"],
            "visibility": ["exact"],
        }

class PasteViewSet(viewsets.ModelViewSet):
    serializer_class = PasteSerializer
    permission_classes = [IsOwnerOrReadOnly]

    filterset_class = PasteFilter
    search_fields = ["title", "content", "owner__username"]
    ordering_fields = ["created_at", "updated_at", "views"]
    ordering = ["-created_at"]

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


def _parse_yyyy_mm(s: str):
    return datetime.strptime(s, "%Y-%m")

def _first_day_next_month(dt: datetime) -> datetime:
    year, month = dt.year, dt.month
    if month == 12:
        return datetime(year + 1, 1, 1)
    return datetime(year, month + 1, 1)

class MonthlyStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        start_str = request.query_params.get("start")
        end_str = request.query_params.get("end")

        start_dt_naive = _parse_yyyy_mm(start_str) if start_str else None
        end_dt_naive = _parse_yyyy_mm(end_str) if end_str else None

        start_dt = timezone.make_aware(start_dt_naive) if start_dt_naive else None
        end_exclusive = None
        if end_dt_naive:
            end_exclusive = timezone.make_aware(_first_day_next_month(end_dt_naive))

        paste_qs = Paste.objects.filter(owner=user)
        view_qs = ViewEvent.objects.filter(paste__owner=user)

        if start_dt:
            paste_qs = paste_qs.filter(created_at__gte=start_dt)
            view_qs = view_qs.filter(viewed_at__gte=start_dt)
        if end_exclusive:
            paste_qs = paste_qs.filter(created_at__lt=end_exclusive)
            view_qs = view_qs.filter(viewed_at__lt=end_exclusive)

        created = (
            paste_qs
            .annotate(month=TruncMonth("created_at"))
            .values("month")
            .annotate(pastes=Count("id"))
            .order_by("month")
        )

        viewed = (
            view_qs
            .annotate(month=TruncMonth("viewed_at"))
            .values("month")
            .annotate(views=Count("id"))
            .order_by("month")
        )

        index = {}

        for row in created:
            key = row["month"].strftime("%Y-%m")
            index.setdefault(key, {"month": key, "pastes": 0, "views": 0})
            index[key]["pastes"] = row["pastes"]

        for row in viewed:
            key = row["month"].strftime("%Y-%m")
            index.setdefault(key, {"month": key, "pastes": 0, "views": 0})
            index[key]["views"] = row["views"]

        data = [index[k] for k in sorted(index.keys())]
        return Response(data)