from django_filters import rest_framework as django_filters
from .models import File

class FileFilter(django_filters.FilterSet):
    # Search by filename
    filename = django_filters.CharFilter(field_name='original_filename', lookup_expr='icontains')
    
    # Filter by file typ
    file_type = django_filters.CharFilter(field_name='file_type', lookup_expr='exact')
    
    # Filter by size range (min/max in bytes)
    size_min = django_filters.NumberFilter(field_name='size', lookup_expr='gte')
    size_max = django_filters.NumberFilter(field_name='size', lookup_expr='lte')
    
    # Filter by upload date range
    uploaded_after = django_filters.DateTimeFilter(field_name='uploaded_at', lookup_expr='gte')
    uploaded_before = django_filters.DateTimeFilter(field_name='uploaded_at', lookup_expr='lte')

    class Meta:
        model = File
        fields = []
