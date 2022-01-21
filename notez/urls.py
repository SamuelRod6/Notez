from django.urls import path
from . import views



urlpatterns = [
    path('', views.index, name='index'),
    path('login', views.login_view, name='login'),
    path('register', views.register_view, name='register'),
    path('logout', views.logout_view, name='logout'),
    path('shared', views.shared_notes, name='shared'),
    path('delete', views.delete_note, name='delete'),

    #APIs
    path('edit/<int:note_id>', views.edit_note, name='edit'),
    path('get_shared_with/<int:note_id>', views.get_shared_usernames, name='shared_usernames'),
]