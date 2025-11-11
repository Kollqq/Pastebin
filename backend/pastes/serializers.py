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

    class Meta:
        model = Paste
        fields = (
            "id", "title", "content", "language", "language_id",
            "visibility", "expire_at", "views",
            "owner", "owner_username", "created_at", "updated_at",
        )
        read_only_fields = ("id", "views", "owner", "owner_username", "created_at", "updated_at", "language")

    def validate_title(self, value):
        if value and len(value) > 120:
            raise serializers.ValidationError("Title too long (max 120 chars).")
        return value

    def validate_content(self, value):
        maxb = getattr(settings, "PASTE_MAX_CONTENT_BYTES", 200 * 1024)
        if value and len(value.encode("utf-8")) > maxb:
            raise serializers.ValidationError(f"Content too large (>{maxb} bytes).")
        return value

class CommentSerializer(serializers.ModelSerializer):
    author_username = serializers.ReadOnlyField(source='author.username')

    class Meta:
        model = Comment
        fields = ("id", "paste", "author", "author_username", "text", "created_at")
        read_only_fields = ("id", "author", "author_username", "created_at")

class StarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Star
        fields = ("id", "user", "paste", "created_at")
        read_only_fields = ("id", "user", "created_at")