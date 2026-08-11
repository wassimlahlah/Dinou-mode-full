
from django.contrib import admin
from .models import *

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "price" , "oldPrice", "category")
    
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    
@admin.register(ProductColorImage)
class ProductColorImageAdmin(admin.ModelAdmin):
    list_display = ("id", "product", "color")

@admin.register(ProductSize)
class ProductSizeAdmin(admin.ModelAdmin):
    list_display = ("id", "productColor", "size", "qte")
    
@admin.register(Orders)
class OrdersAdmin(admin.ModelAdmin):
    list_display = ("id", "productSize", "quantity", "price", )
    
@admin.register(Commend)
class CommendAdmin(admin.ModelAdmin):
    list_display = ("id", "fullName", "phone", "willya", "commend_date", "status")
    
@admin.register(Compte)
class CompteAdmin(admin.ModelAdmin):
    list_display = ("id" , "username" , "role" , "password")