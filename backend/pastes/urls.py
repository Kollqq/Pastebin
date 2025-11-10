from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    healthcheck, LanguageViewSet, PasteViewSet, CommentViewSet, StarViewSet,
    MonthlyStatsView,
)

router = DefaultRouter()
router.register(r"languages", LanguageViewSet, basename="language")
router.register(r"pastes", PasteViewSet, basename="paste")
router.register(r"comments", CommentViewSet, basename="comment")
router.register(r"stars", StarViewSet, basename="star")

urlpatterns = [
    path("health/", healthcheck, name="healthcheck"),
    path("stats/monthly/", MonthlyStatsView.as_view(), name="stats-monthly"),
    path("", include(router.urls)),
]