from django.contrib import admin
from .models import Language, Paste, Comment, Star, ViewEvent

@admin.register(Language)
class LanguageAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'slug')
    search_fields = ('name', 'slug')
    prepopulated_fields = {"slug": ("name",)}

@admin.register(Paste)
class PasteAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'owner', 'visibility', 'language', 'views', 'created_at')
    list_filter = ('visibility', 'language')
    search_fields = ('title', 'content', 'owner__username')

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('id', 'paste', 'author', 'created_at')
    search_fields = ('text', 'author__username')

@admin.register(Star)
class StarAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'paste', 'created_at')
    search_fields = ('user__username', 'paste__title')

@admin.register(ViewEvent)
class ViewEventAdmin(admin.ModelAdmin):
    list_display = ('id', 'paste', 'viewed_at', 'ip_hash')
    list_filter = ('viewed_at',)
