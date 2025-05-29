import hashlib

def calculate_file_hash(file_obj, chunk_size=8192):
    sha = hashlib.sha256()
    file_obj.seek(0)
    for chunk in iter(lambda: file_obj.read(chunk_size), b''):
        sha.update(chunk)
    file_obj.seek(0)
    return sha.hexdigest()