from django.urls import path
from .views import FileViewSet

urlpatterns = [
    path('files/', FileViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name='file-list'),
    
    path('files/upload/', FileViewSet.as_view({
        'post': 'create'
    }), name='file-upload'),
    
    path('files/<uuid:pk>/', FileViewSet.as_view({
        'get': 'retrieve',
        'delete': 'destroy'
    }), name='file-detail'),
    
    path('files/storage_stats/', FileViewSet.as_view({
        'get': 'storage_stats'
    }), name='file-storage-stats'),
]