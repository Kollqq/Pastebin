import secrets
import string

from django.db import models
from django.conf import settings

class Language(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=50, unique=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

def _generate_short_code(length: int = 8) -> str:
    alphabet = string.ascii_letters + string.digits
    while True:
        code = ''.join(secrets.choice(alphabet) for _ in range(length))
        if not Paste.objects.filter(short_code=code).exists():
            return code


class Paste(models.Model):
    class Visibility(models.TextChoices):
        PUBLIC = 'public', 'Public'
        UNLISTED = 'unlisted', 'Unlisted'
        PRIVATE = 'private', 'Private'

    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='pastes')
    short_code = models.CharField(max_length=12, unique=True, editable=False)
    title = models.CharField(max_length=20, blank=True)
    content = models.TextField()
    language = models.ForeignKey(Language, null=True, blank=True, on_delete=models.SET_NULL)
    visibility = models.CharField(max_length=8, choices=Visibility.choices, default=Visibility.PUBLIC)
    expire_at = models.DateTimeField(null=True, blank=True)
    views = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title or f'Paste: #{self.pk}'

    def save(self, *args, **kwargs):
        if not self.short_code:
            self.short_code = _generate_short_code()
        super().save(*args, **kwargs)

class Comment(models.Model):
    paste = models.ForeignKey(Paste, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    text = models.TextField(max_length=2000)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

class Star(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='stars')
    paste = models.ForeignKey(Paste, on_delete=models.CASCADE, related_name='stars')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ('user', 'paste')

class ViewEvent(models.Model):
    paste = models.ForeignKey(Paste, on_delete=models.CASCADE, related_name='view_events')
    viewed_at = models.DateTimeField(auto_now_add=True)
    ip_hash = models.CharField(max_length=64, blank=True)

    class Meta:
        indexes = [models.Index(fields=['viewed_at'])]
        ordering = ['-viewed_at']