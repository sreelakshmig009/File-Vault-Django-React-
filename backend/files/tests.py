from django.test import TestCase, Client
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from .models import File
from datetime import datetime, timezone

class FileAPITestCase(TestCase):
    def setUp(self):
        self.client = Client()
        self.list_url = reverse('file-list')
        self.upload_url = reverse('file-upload')
        
        File.objects.all().delete()
        
        self.sample_file = File.objects.create(
            id="00000000-0000-0000-0000-000000000000",
            original_filename="sample.jpg",
            file_type="image/jpeg",
            size=1000,
            file="uploads/sample.jpg",
            checksum="samplechecksum123",
            uploaded_at=datetime.now(timezone.utc),
            reference_count=1
        )

    def test_file_list_endpoint(self):
        """Test GET /files/ returns expected data"""
        response = self.client.get(self.list_url)
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()['results']), 1)
        
        file_data = response.json()['results'][0]
        self.assertEqual(file_data["original_filename"], "sample.jpg")
        self.assertEqual(file_data["file_type"], "image/jpeg")

    def test_file_upload_creates_entry(self):
        """Test POST /files/upload/ creates new entry"""
        test_file = SimpleUploadedFile(
            "test.jpg",
            b"file_content",
            content_type="image/jpeg"
        )
        
        response = self.client.post(
            self.upload_url,
            {'file': test_file},
            format='multipart'
        )
        
        self.assertEqual(response.status_code, 201)
        self.assertEqual(File.objects.count(), 2)

    def test_duplicate_file_handling(self):
        """Test duplicate file detection"""
        test_file = SimpleUploadedFile(
            "duplicate.jpg",
            b"content",
            content_type="image/jpeg"
        )
        
        self.client.post(self.upload_url, {'file': test_file}, format='multipart')
        
        test_file.seek(0)
        response = self.client.post(
            self.upload_url,
            {'file': test_file},
            format='multipart'
        )
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(File.objects.count(), 2)

    def test_file_deletion(self):
        """Test DELETE /files/<id>/ removes entry"""
        delete_url = reverse('file-detail', 
            kwargs={'pk': "00000000-0000-0000-0000-000000000000"})
        
        response = self.client.delete(delete_url)
        
        self.assertEqual(response.status_code, 204)
        self.assertEqual(File.objects.count(), 0)

    def test_file_size_validation(self):
        """Test 10MB file size limit"""
        large_file = SimpleUploadedFile(
            "large.jpg",
            b"0" * (11 * 1024 * 1024), 
            content_type="image/jpeg"
        )
        
        response = self.client.post(
            self.upload_url,
            {'file': large_file},
            format='multipart'
        )
        
        self.assertEqual(response.status_code, 400)
        self.assertIn("File size exceeds 10MB", response.json()['message'])
