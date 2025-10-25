from django.db import models
from django.contrib.auth.models import User

class HighScore(models.Model):
    player_name = models.CharField(max_length=50, default="Аноним")
    score = models.IntegerField()
    played_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-score']

    def __str__(self):
        return f"{self.player_name} — {self.score}"