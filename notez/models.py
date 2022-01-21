from django.contrib.auth.models import AbstractUser
from django.db import models



class User(AbstractUser):

    def __str__(self):
        return f"{self.username}"


class Note(models.Model):
    title = models.CharField(max_length=64)
    content = models.CharField(max_length=248)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notes")
    shares_with = models.ManyToManyField(User, related_name="shared", blank=True)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.creator}, write "{self.content[:20]}..." on {self.created}'
        