from rest_framework import serializers
from .models import *
from pprint import pprint
from django.db import transaction
from utils.function import price_and_livraison
from collections import defaultdict
from .supabase_upload import *
from django.contrib.auth.hashers import make_password, check_password

from .models import Compte








class SignUpSerializer(serializers.ModelSerializer):

    class Meta:
        model = Compte
        fields = [
            "username",
            "password",
            "role",
        ]

        extra_kwargs = {
            "password": {
                "write_only": True
            }
        }

    def create(self, validated_data):

        password = validated_data.pop("password")

        compte = Compte.objects.create(
            password=make_password(password),
            **validated_data
        )

        return compte


class SignInSerializer(serializers.Serializer):

    username = serializers.CharField()
    password = serializers.CharField(
        write_only=True
    )

    def validate(self, data):

        username = data["username"]
        password = data["password"]

        try:
            compte = Compte.objects.get(
                username=username
            )
        except Compte.DoesNotExist:
            raise serializers.ValidationError(
                "Invalid username or password."
            )

        if not check_password(
            password,
            compte.password
        ):
            raise serializers.ValidationError(
                "Invalid username or password."
            )

        data["compte"] = compte

        return data
    
#CATEGORY SERIALIZER


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"
        
        
class ProductSerializerUpdate(serializers.ModelSerializer):
    

    class Meta:
        model = Product
        fields = (
            "name",
            "price",
            "oldPrice",
            "category",
        )
        
#PRODUCTS SERIALIZERS  

     
class ProductSizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSize
        fields = ("id","size","eqSize", "qte")
      
class ManyProductSizeSerializer(serializers.Serializer):
    info=ProductSizeSerializer(many=True)

class ProductColorImageSerializer(serializers.ModelSerializer):
    sizesQte = ProductSizeSerializer(many=True)
    class Meta:
        model = ProductColorImage
        fields = ("id","color","image", "sizesQte")
        read_only_fields = ("image",)
        

     
class ManyColorImageSerializer(serializers.Serializer):
    info=ProductColorImageSerializer(many=True)
  
    
    
class ProductSerializerPush(serializers.ModelSerializer):
    productsInfo = ProductColorImageSerializer(many=True)

    class Meta:
        model = Product
        fields = (
            "name",
            "price",
            "oldPrice",
            "category",
            "productsInfo",
        )
        
    @transaction.atomic
    
    def create(self, validated_data):
      
      

      colors_data = validated_data.pop("productsInfo")
  
      product = Product.objects.create(**validated_data)
  
      for color_data in colors_data:
  
          sizes_data = color_data.pop("sizesQte")
  
          product_color = ProductColorImage.objects.create(
              product=product,
              **color_data
          )
  
          for size_data in sizes_data:
              
               eq_size = getattr(EqSize, size_data["size"]).value
               ProductSize.objects.create(
                   productColor=product_color,
                   **size_data,
                   eqSize=eq_size )
               
  
      return product
  

class ProductSerializer(serializers.ModelSerializer):
    productsInfo= ProductColorImageSerializer(many=True)

    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            "price",
            "oldPrice",
            "category",
            "productsInfo",
        )

        
        
#ORDERS SERILAIZERS  

      
class OrderSerializer (serializers.ModelSerializer):

    class Meta:
        model = Orders
        fields = (
            "productSize",
            "quantity",
            
        )
       
        
class CommendSerializerPush(serializers.ModelSerializer):

    commend_orders = OrderSerializer(many=True)

    def group_orders(self, orders):

        grouped = defaultdict(int)

        for order in orders:
            grouped[order["productSize"]] += order["quantity"]

        return grouped

    class Meta:

        model = Commend

        fields = (
            "fullName",
            "phone",
            "willya",
            "baladiya",
            "commend_orders",
        )

    def validate(self, data):

        grouped_products = self.group_orders(
            data["commend_orders"]
        )

        for product_size, total_quantity in grouped_products.items():

            if product_size.qte < total_quantity:

                raise serializers.ValidationError(
                    {
                        "commend_orders":
                        f"Product size {product_size.id} has only "
                        f"{product_size.qte} available, "
                        f"but {total_quantity} requested."
                    }
                )

        return data

    @transaction.atomic
    def create(self, validated_data):

        orders_data = validated_data.pop(
            "commend_orders"
        )

        
        
        if validated_data.get("willya") == "Alger":

            commend = Commend.objects.create(
                **validated_data
            )

        else:

            image = self.context.get("image")
            recipte_url=None
            if  image:

                #raise serializers.ValidationError(
                 #   {
                  #      "image":
                   #     "Receipt image is required."
                    #}
                #)

                recipte_url = upload_image(
                image,
                "Reciptes"
                )
            
            commend = Commend.objects.create(
                **validated_data,
                image_url=recipte_url
            )

       

        grouped_orders = self.group_orders(
            orders_data
        )

        orders_to_create = []

        for product_size, quantity in grouped_orders.items():
            
            unit_price = (
                product_size
                .productColor
                .product
                .price
            )
           
            total_price = price_and_livraison(
                commend.willya,
                commend.baladiya,
                unit_price,
                quantity,
            )
    
            orders_to_create.append(
                Orders(
                    commend=commend,
                    productSize=product_size,
                    quantity=quantity,
                    price=total_price,
                )
            )
           
        Orders.objects.bulk_create(
            orders_to_create
        )

        return commend

class ProductSerializerOrder(serializers.ModelSerializer):
    
    
    class Meta:
        model = Product
        fields = ["id", "name"]



class ProductColorSerializerOrder(serializers.ModelSerializer):
    product = ProductSerializerOrder(read_only=True)

    class Meta:
        model = ProductColorImage
        fields = ["id", "color", "product", "image"]
   
class ProductSizeSerializerOrder(serializers.ModelSerializer):
    productColor = ProductColorSerializerOrder(read_only=True)

    class Meta:
        model = ProductSize
        fields = ["id", "size", "productColor"]
        
        
class OrderSerializerOrder (serializers.ModelSerializer):
    productSize = ProductSizeSerializerOrder(read_only=True)
    
    class Meta:
        model = Orders
        fields = ["id", "productSize", "quantity" , "price"]

class CommendSerializer(serializers.ModelSerializer):
    commend_orders = OrderSerializerOrder(many=True, read_only=True)

    class Meta:
        model = Commend
        fields = (
            "id",
            "fullName",
            "phone",
            "willya",
            "commend_date",
            "status",
            "image_url",
            "commend_orders"
        )

        read_only_fields = (
            "id",
            "commend_date",
            "image_url",
        )
        
        
        
class LivrsionPriceSerializer(serializers.ModelSerializer):
    class Meta:
        model = LivrisonPrice
        fields="__all__" 