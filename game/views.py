from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import HighScore
import json
from django.shortcuts import get_object_or_404, redirect
from django.contrib import messages

def game_view(request):
    return render(request, 'game.html')

@csrf_exempt
def save_score(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        name = data.get('name', 'Аноним')[:50]
        score = int(data.get('score', 0))
        
        HighScore.objects.create(player_name=name, score=score)
        return JsonResponse({'status': 'saved'})
    return JsonResponse({'status': 'error'})

def leaderboard(request):
    scores = HighScore.objects.all()[:10]
    return render(request, 'leaderboard.html', {'scores': scores})

def delete_score(request, pk):
    score = get_object_or_404(HighScore, pk=pk)
    if request.user.is_staff:  # только админ
        score.delete()
        messages.success(request, 'Рекорд удалён!')
    return redirect('leaderboard')