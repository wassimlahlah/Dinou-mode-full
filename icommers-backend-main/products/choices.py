

from django.db import models

class Color(models.TextChoices):
    RED = "RED", "Red"
    BLUE = "BLUE", "Blue"
    GREEN = "GREEN", "Green"
    BLACK = "BLACK", "Black"
    WHITE = "WHITE", "White"
    YELLOW = "YELLOW", "Yellow"
    PINK = "PINK", "Pink"
    PURPLE = "PURPLE", "Purple"
    ORANGE = "ORANGE", "Orange"
    GRAY = "GRAY", "Gray"
    BROWN = "BROWN", "Brown"
    BEIGE = "BEIGE", "Beige"
    NAVY = "NAVY", "Navy"
    BURGUNDY = "BURGUNDY", "Burgundy"
    TEAL = "TEAL", "Teal"
    CREAM = "CREAM", "Cream"
    GOLD = "GOLD", "Gold"
    SILVER = "SILVER", "Silver"
    KHAKI = "KHAKI", "Khaki"
    OLIVE = "OLIVE", "Olive"
    
class Size(models.TextChoices):
    XS = "XS", "Extra Small"
    S = "S", "Small"
    M = "M", "Medium"
    L = "L", "Large"
    XL = "XL", "Extra Large"
    XXL = "XXL", "Double Extra Large"
    XXXL = "XXXL", "Triple Extra Large"
    XXXXL = "XXXXL", "4X Large"
    XXXXXL = "XXXXXL", "5X Large"
    
class EqSize(models.TextChoices):
    XS = "34", "XS"
    S = "36", "S"
    M = "38", "M"
    L = "40", "L"
    XL = "42", "XL"
    XXL = "44", "XXL"
    XXXL = "46", "XXXL"
    XXXXL = "48", "XXXXL"
    XXXXXL = "50", "XXXXXL"
    
class OrderStatus(models.TextChoices):
    PENDING = "PENDING", "Pending"
    DELIVERED = "DELIVERED", "Delivered"
    CANCELED = "CANCELED", "Canceled"