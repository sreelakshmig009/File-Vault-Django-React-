from django.db import models
import uuid
import os

def file_upload_path(instance, filename):
    """Generate deterministic file path using checksum"""
    ext = filename.split('.')[-1].lower()
    return os.path.join('uploads', f"{instance.checksum}.{ext}")

class File(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    file = models.FileField(upload_to=file_upload_path)
    original_filename = models.CharField(max_length=255, db_index=True)
    file_type = models.CharField(max_length=100, db_index=True)
    size = models.BigIntegerField(db_index=True)
    uploaded_at = models.DateTimeField(auto_now_add=True,db_index=True)
    checksum = models.CharField(max_length=64, unique=True, null=True) 
    reference_count = models.PositiveIntegerField(default=1)
    
    class Meta:
        ordering = ['-uploaded_at']
        indexes = [
            models.Index(fields=['checksum'], name='checksum_idx')
        ]
    
    def __str__(self):
        return str(self.original_filename)

    def delete(self, *args, **kwargs):
        if self.file and hasattr(self.file, 'delete'):
            self.file.delete(save=False)
        super().delete(*args, **kwargs)


