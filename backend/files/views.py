from django.core.exceptions import ValidationError
from django.db import models
from rest_framework import viewsets, status, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from .models import File
from .serializers import FileSerializer
from .utils import calculate_file_hash
from .filters import FileFilter


class FileViewSet(viewsets.ModelViewSet):
    queryset = File.objects.all()
    serializer_class = FileSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = FileFilter
    search_fields = ['original_filename'] 
    pagination_class = PageNumberPagination

    def create(self, request, *args, **kwargs):
        try:
            file_obj = request.FILES['file']

            if file_obj.size > 10 * 1024 * 1024:
                raise ValidationError("File size exceeds 10MB limit")

            file_hash = calculate_file_hash(file_obj)

            existing_file, created = File.objects.get_or_create(
                checksum=file_hash,
                defaults={
                    'file': file_obj,
                    'original_filename': file_obj.name,
                    'file_type': file_obj.content_type,
                    'size': file_obj.size
                }
            )
            
            if not created:
                existing_file.reference_count += 1
                existing_file.save()

            serializer = FileSerializer(existing_file)
            status_code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
            response_data = {
                'status': 'success' if created else 'duplicate',
                'message': 'File uploaded successfully' if created else 'Duplicate found',
                'file': serializer.data,
                'saved_bytes': 0 if created else file_obj.size
            }

            return Response(response_data, status=status_code)

        except KeyError:
            return Response(
                {'status': 'error', 'message': 'No file provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except ValidationError as e:
            return Response(
                {'status': 'error', 'message': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'status': 'error', 'message': f'Server error: {str(e)}'},
                status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['GET'])
    def storage_stats(self, request):
        total_used = File.objects.aggregate(models.Sum('size'))['size__sum'] or 0
        unique_files = File.objects.count()
        saved_space = File.objects.aggregate(
            saved=models.Sum('size') - models.Sum('size')/models.F('reference_count')
        )['saved'] or 0
        
        return Response({
            'total_used': total_used,
            'unique_files': unique_files,
            'saved_space': saved_space
        })
