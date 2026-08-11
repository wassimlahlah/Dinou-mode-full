from django.urls import re_path, path
from .consumers import ProductConsumer

websocket_urlpatterns = [
   path("ws/products/", ProductConsumer.as_asgi()),
]