from django.contrib import admin
from .models import User, Note



class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'id')

class NoteAdmin(admin.ModelAdmin):
    list_display = ('creator', 'title','content', 'created', 'updated', 'id')
    filter_horizontal = ('shares_with',)


admin.site.register(User, UserAdmin)
admin.site.register(Note, NoteAdmin)
