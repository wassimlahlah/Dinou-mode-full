
import os
import uuid
from urllib.parse import urlparse

from django.conf import settings

from .supabase_client import supabase


def upload_image(file, folder):
    

    if not file:
        return None

    extension = os.path.splitext(file.name)[1].lower()

    filename = f"{uuid.uuid4()}{extension}"

    path = f"{folder}/{filename}"

    file.seek(0)

    supabase.storage.from_(
        settings.SUPABASE_BUCKET
    ).upload(
        path=path,
        file=file.read(),
        file_options={
            "content-type": file.content_type,
            "upsert": False,
        }
    )

    public_url = supabase.storage.from_(
        settings.SUPABASE_BUCKET
    ).get_public_url(path)

    return public_url


def get_storage_path_from_url(image_url):
    

    if not image_url:
        return None

    bucket = settings.SUPABASE_BUCKET

    marker = f"/storage/v1/object/public/{bucket}/"

    if marker not in image_url:
        return None

    path = image_url.split(marker, 1)[1]

    return path


def delete_image(image_url):
    

    if not image_url:
        return False

    path = get_storage_path_from_url(image_url)

    if not path:
        return False

    supabase.storage.from_(
        settings.SUPABASE_BUCKET
    ).remove([
        path
    ])

    return True










"""import os
import uuid
from django.conf import settings
from supabase import create_client

supabase = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_SERVICE_ROLE_KEY,
)


def upload_image(file, folder):
    extension = os.path.splitext(file.name)[1]
    path = f"{folder}/{uuid.uuid4()}{extension}"

    file.seek(0)
    print("+++++++++++++++=======+++++++")
    supabase.storage.from_(settings.SUPABASE_BUCKET).upload(
        path,
        file.read(),
        {
            "content-type": file.content_type,
            "upsert": False,
        },
    )
    print("+++++problem+++++++")

    return supabase.storage.from_(settings.SUPABASE_BUCKET).get_public_url(path)"""