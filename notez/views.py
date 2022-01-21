from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import redirect, render
from django.db import IntegrityError
import json

from .models import User, Note



def index(request):
    if not request.user.is_authenticated:
        return render(request, 'notez/login.html')
    
    # Get all notes
    notes = User.objects.get(username=request.user).notes.order_by('-updated').all()
    
    # Creates a new note and add shared note to the user's list if any
    if request.method == 'POST':
        share_with = request.POST['shared'].strip()
        if share_with != '':
            share_with = share_with.split(',')
        if all(user.strip().lower() in User.objects.values_list('username', flat=True) for user in share_with if user.strip().lower() != request.user.username) or share_with == '':
            title = request.POST['title']
            content = request.POST['content']
            new_note = Note.objects.create(title=title, content=content, creator=request.user)
            new_note.save()
            if share_with != '':
                [new_note.shares_with.add(User.objects.get(username=user.strip().lower())) for user in share_with if user.strip().lower() != request.user.username]
            return redirect('index')
        else:
            return render(request, 'notez/index.html', {
            'notes': notes,
            'message': 'User/s does not exist'
            })

    return render(request, 'notez/index.html', {
        'notes': notes,
    })


def shared_notes(request):
    # Root for shared notes
    if not request.user.is_authenticated:
        return render(request, 'notez/login.html')
    notes = User.objects.get(username=request.user).shared.order_by('-updated').all()

    return render(request, 'notez/shared.html', {
        'notes': notes,
    })


@csrf_exempt
@login_required(login_url='login')
def edit_note(request, note_id):
    note = Note.objects.get(id=note_id)
    # Handle note editing
    if request.method == 'POST':
        new_title = json.loads(request.body).get("title").strip()
        new_content = json.loads(request.body).get("content").strip()
        if new_content == '' or new_title == '':
            return JsonResponse({'error': "Title and content are required"}, status=400)
        note.title = new_title
        note.content = new_content
        note.save()
        new_shared = json.loads(request.body).get("shared").strip()
        # Remove all shared users
        note.shares_with.clear()
        if new_shared != '':
            new_shared = new_shared.split(',')
            # Check if all the new users exist
            if all(user.strip().lower() in User.objects.values_list('username', flat=True) for user in new_shared if user != request.user.username):
                # Add shared users
                [note.shares_with.add(User.objects.get(username=user.strip().lower())) for user in new_shared if user != '' and user.strip().lower() != request.user.username]
            else:
                return JsonResponse({'error': "User/s does not exist"}, status=400)
    else:
        return JsonResponse({'error': "Request has to be POST"}, status=400)
    
    return JsonResponse({'message': "Post edited successfully"}, status=201)

@login_required(login_url='login')
def get_shared_usernames(request, note_id):
    note = Note.objects.get(id=note_id)
    return JsonResponse({'sharedWith': [user.username for user in note.shares_with.all()]}, status=200)

@login_required(login_url='login')
def delete_note(request):
    # Delete note
    if request.method == 'POST':
        note_id = request.POST['delete_note']
        Note.objects.get(id=note_id).delete()
        return redirect('index')


def login_view(request):
    # Attempt to sign user in
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return redirect("index")
        else:
            return render(request, "notez/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "notez/login.html")


def register_view(request):
    register_page = "notez/register.html"
    
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]
        
        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, register_page, {
                "message": "Passwords must match."
            })
        
        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, register_page, {
                "message": "Username already taken."
            })
        login(request, user)
        return redirect("index")
    
    else:
        return render(request, register_page)


def logout_view(request):
    logout(request)
    return redirect('index')