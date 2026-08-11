

from django.db import models

class Color(models.TextChoices):
    RED = "RED", "Red"
    GREEN = "GREEN", "Green"
    BLUE = "BLUE", "Blue"
    YELLOW = "YELLOW", "Yellow"
    BLACK = "BLACK", "Black"
    WHITE = "WHITE", "White"
    
class Size(models.TextChoices):
    XS = "XS", "Extra Small"
    S = "S", "Small"
    M = "M", "Medium"
    L = "L", "Large"
    XL = "XL", "Extra Large"
    XXL = "XXL", "Double Extra Large"
    XXXL = "XXXL", "Triple Extra Large"
    
class OrderStatus(models.TextChoices):
    PENDING = "PENDING", "Pending"
    DELIVERED = "DELIVERED", "Delivered"
    CANCELED = "CANCELED", "Canceled"