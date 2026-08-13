from django.db import models
from .choices import *

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    image_url1 = models.URLField(blank=True,null=True)
   
    

class Product(models.Model):
    name =  models.CharField(max_length=100 , unique=True)
    price = models.DecimalField(max_digits=10, decimal_places=2,null= False, blank=False , default=0.00)
    oldPrice= models.DecimalField(max_digits=10, decimal_places=2, null=False, blank=False, default=0.00)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    
   

class ProductColorImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='productsInfo')
    color = models.CharField( choices=Color.choices, null=True, blank=True) 
    image = models.URLField(  null=True, blank=True )
    
  

class ProductSize(models.Model):
    productColor = models.ForeignKey(ProductColorImage, on_delete=models.CASCADE, related_name='sizesQte')
    size = models.CharField( choices=Size.choices , null=True, blank=True)
    eqSize=models.CharField( choices=EqSize.choices , null=True, blank=True)
    qte=models.PositiveIntegerField(default=0)
    
class Commend(models.Model):   
        fullName = models.CharField(max_length=100)
        phone= models.CharField(max_length=10)
        willya = models.CharField(max_length=100)
        commend_date = models.DateTimeField(auto_now_add=True)
        status = models.CharField(max_length=20, choices=OrderStatus.choices, default=OrderStatus.PENDING)
        image_url=models.URLField(null=True,blank=True)
        
class Orders(models.Model):
    commend = models.ForeignKey(Commend, on_delete=models.CASCADE, related_name='commend_orders')
    productSize = models.ForeignKey(ProductSize, on_delete=models.SET_NULL, related_name='orders', null=True)
    quantity = models.PositiveIntegerField(default=1)
    price= models.DecimalField(max_digits=10, decimal_places=2, null=False, blank=False)
    
class LivrisonPrice(models.Model):
    willya = models.CharField(max_length=100, unique=True)
    price = models.DecimalField(max_digits=10, decimal_places=2,null= False, blank=False , default=0.00)
    





class Compte(models.Model):

    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        CLIENT = "CLIENT", "Client"

    username = models.CharField(
        max_length=150,
        unique=True
    )

    password = models.CharField(
        max_length=255
    )

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.CLIENT
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    