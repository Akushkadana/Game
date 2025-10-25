from django.contrib import admin
from .models import HighScore

@admin.register(HighScore)
class HighScoreAdmin(admin.ModelAdmin):
    list_display = ('player_name', 'score', 'played_at')
    list_editable = ('score',)  # ← редактируем только score
    list_display_links = ('player_name',)  # ← player_name — ссылка на деталь