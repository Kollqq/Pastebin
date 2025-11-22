from django.conf import settings
from rest_framework import serializers
from .models import Language, Paste, Comment, Star


class LanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Language
        fields = ('id', 'name', 'slug')

class PasteSerializer(serializers.ModelSerializer):
    owner_username = serializers.ReadOnlyField(source='owner.username')
    language = LanguageSerializer(read_only=True)
    language_id = serializers.PrimaryKeyRelatedField(
        source='language', queryset=Language.objects.all(),
        write_only=True, required=False, allow_null=True
    )
    is_owner = serializers.SerializerMethodField()
    is_starred = serializers.SerializerMethodField()
    star_id = serializers.SerializerMethodField()

    class Meta:
        model = Paste
        fields = (
            "id", "short_code", "title", "content", "language", "language_id",
            "visibility", "expire_at", "views",
            "owner", "owner_username", "created_at", "updated_at",
            "is_owner", "is_starred", "star_id",
        )
        read_only_fields = (
            "id", "short_code", "views", "owner", "owner_username", "created_at", "updated_at", "language",
            "is_owner", "is_starred", "star_id",
        )

    def validate_title(self, value):
        if value and len(value) > 120:
            raise serializers.ValidationError("Title too long (max 120 chars).")
        return value

    def validate_content(self, value):
        maxb = getattr(settings, "PASTE_MAX_CONTENT_BYTES", 200 * 1024)
        if value and len(value.encode("utf-8")) > maxb:
            raise serializers.ValidationError(f"Content too large (>{maxb} bytes).")
        return value

    def get_is_owner(self, obj):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        return bool(user and user.is_authenticated and obj.owner_id == user.id)

    def _get_user_star(self, obj):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if not (user and user.is_authenticated):
            return None

        stars = getattr(obj, "user_stars", None)
        if stars is not None:
            return stars[0] if stars else None

        return obj.stars.filter(user=user).first()

    def get_is_starred(self, obj):
        return self._get_user_star(obj) is not None

    def get_star_id(self, obj):
        star = self._get_user_star(obj)
        return star.id if star else None

class CommentSerializer(serializers.ModelSerializer):
    author_username = serializers.ReadOnlyField(source='author.username')

    class Meta:
        model = Comment
        fields = ("id", "paste", "author", "author_username", "text", "created_at")
        read_only_fields = ("id", "author", "author_username", "created_at")

class StarSerializer(serializers.ModelSerializer):
    paste_title = serializers.ReadOnlyField(source="paste.title")
    paste_owner_username = serializers.ReadOnlyField(source="paste.owner.username")

    class Meta:
        model = Star
        fields = ("id", "user", "paste", "created_at", "paste_title", "paste_owner_username")
        read_only_fields = ("id", "user", "created_at", "paste_title", "paste_owner_username")