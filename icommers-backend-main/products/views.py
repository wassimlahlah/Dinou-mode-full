from django.shortcuts import render
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import api_view , permission_classes
from rest_framework.response import Response 
from .models import *
from utils.response import api_response
from .serializers import *
from .choices import *
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.db import transaction
from utils.function import update_qte_ws
from django.db.models import F
from .supabase_upload import *
import json
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .permissions import IsAdmin




def get_tokens_for_compte(compte):

    refresh = RefreshToken()

    refresh["compte_id"] = compte.id
    refresh["username"] = compte.username
    refresh["role"] = compte.role

    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }



@api_view(["POST"])
def create_admin(request,new_password,new_username):

    if Compte.objects.filter(
        role=Compte.Role.ADMIN
    ).exists():

        return api_response(
            "error",
            "An ADMIN account already exists.",
            None,
            http_status=400
        )

    

    if not new_username or not new_password:

        return api_response(
            "error",
            "Username and password are required.",
            None,
            http_status=400
        )

    if Compte.objects.filter(
        username=new_username
    ).exists():

        return api_response(
            "error",
            "Username already exists.",
            None,
            http_status=400
        )

    compte = Compte.objects.create(
        username=new_username,
        password=make_password(new_password),
        role=Compte.Role.ADMIN
    )

    return api_response(
        "success",
        "ADMIN created successfully.",
        {
            "id": compte.id,
            "username": compte.username,
            "role": compte.role
        },
        http_status=201
    )

@api_view(["POST"])
def signin(request):

    serializer = SignInSerializer(
        data=request.data
    )
    
    if not serializer.is_valid():

        return api_response(
            status="error",
            message="Login failed",
            data=None,
            error=serializer.errors,
            http_status=status.HTTP_401_UNAUTHORIZED
        )

    compte = serializer.validated_data["compte"]

    tokens = get_tokens_for_compte(compte)

    return api_response(
        status="success",
        message="Login successful",
        data={
            "id": compte.id,
            "username": compte.username,
            "role": compte.role,
            "tokens": tokens
        },
        error=None,
        http_status=status.HTTP_200_OK
    )

#========CATEGORY VIEWS========

@api_view(["POST", "GET", "DELETE", "PUT"])
def Category_method(request, category_id=None):

    try:
        
        if request.method == "GET":
        
                    categories = Category.objects.all()
        
                    serializer = CategorySerializer(
                        categories,
                        many=True
                    )
        
                    return api_response(
                        "success",
                        "Categories retrieved successfully",
                        serializer.data,
                        http_status=200
                    )
        
        permission = IsAdmin()

        if not permission.has_permission(request, None):
            return Response(
                {
                    "status": "error",
                    "message": "Only admin can perform this action",
                    "data": None,
                    "error": None
                },
                status=403
            )

        

        if request.method == "POST":

            json_data = request.data.get("json")

            if not json_data:
                return api_response(
                    "error",
                    "JSON data is required",
                    None,
                    http_status=400
                )

            try:
                data = json.loads(json_data)

            except json.JSONDecodeError:
                return api_response(
                    "error",
                    "Invalid JSON data",
                    None,
                    http_status=400
                )

           
            image = request.FILES.get("image")

            if not image:
                return api_response(
                    "error",
                    "Image is required",
                    None,
                    http_status=400
                )

          
            serializer = CategorySerializer(data=data)

            if not serializer.is_valid():

                return api_response(
                    status="error",
                    message="Validation failed",
                    error=serializer.errors,
                    http_status=400
                )

           
            image_url = upload_image(
                image,
                "categorys"
            )

           
            category = Category.objects.create(
                name=serializer.validated_data["name"],
                image_url1=image_url
            )

            serializer1 = CategorySerializer(category)

            return api_response(
                "success",
                "Category added successfully",
                serializer1.data,
                http_status=201
            )

       
        
  
        if request.method == "DELETE":

            with transaction.atomic():

                category = (
                    Category.objects
                    .select_for_update()
                    .get(id=category_id)
                )

    
                old_image_url = category.image_url1

                
                category.delete()

                 
                if old_image_url:

                    delete_image(
                        old_image_url
                    )

            return api_response(
                "success",
                "Category and image deleted successfully.",
                None,
                http_status=200
            )

        

        if request.method == "PUT":

            with transaction.atomic():

                category = (
                    Category.objects
                    .select_for_update()
                    .get(pk=category_id)
                )

               

                old_image_url = category.image_url1

              
                new_image = request.FILES.get("image")

               

                json_data = request.data.get("json")

                if json_data:

                    try:
                        data = json.loads(json_data)

                    except json.JSONDecodeError:

                        return api_response(
                            "error",
                            "Invalid JSON data",
                            None,
                            http_status=400
                        )

                else:

                    data = {}

                    if request.data.get("name") is not None:
                        data["name"] = request.data.get("name")

               
                serializer = CategorySerializer(
                    category,
                    data=data,
                    partial=True
                )

                serializer.is_valid(
                    raise_exception=True
                )

              

                category.name = serializer.validated_data.get(
                    "name",
                    category.name
                )

               

                if new_image:

                    
                    new_image_url = upload_image(
                        new_image,
                        "categorys"
                    )

                
                    category.image_url1 = new_image_url

                category.save()

               

                if new_image and old_image_url:

                    delete_image(
                        old_image_url
                    )

                

                serializer1 = CategorySerializer(
                    category
                )

                return api_response(
                    "success",
                    "Category updated successfully.",
                    serializer1.data,
                    http_status=200
                )

    

    except Category.DoesNotExist:

        return api_response(
            "error",
            "Category not found",
            "Category with the given ID does not exist.",
            http_status=404
        )

    

    except Exception as e:

        return api_response(
            "error",
            "An error occurred while processing the category",
            str(e),
            http_status=400
        )





#========PRODUCTS VIEWS========
                
@api_view(['GET','POST',"DELETE","PUT"])
def products_method(request, category_id, product_id):
    try:
          
        if request.method == "GET":
                     if category_id == 0 :
                         products = Product.objects.filter(productsInfo__sizesQte__qte__gt=0).prefetch_related( "productsInfo", "productsInfo__sizesQte" ).distinct()
                         serializer = ProductSerializer(products, many=True)
                         return api_response("success", "Products retrieved successfully", serializer.data, http_status=200)
                     
                     category = Category.objects.get(id=category_id)
                     products = Product.objects.filter(category=category, productsInfo__sizesQte__qte__gt=0).prefetch_related( "productsInfo", "productsInfo__sizesQte" ).distinct()
                     serializer = ProductSerializer(products, many=True)
                     return api_response("success", "Products retrieved successfully", serializer.data, http_status=200)  
        
        
        permission = IsAdmin()

        if not permission.has_permission(request, None):
            return Response(
                {
                    "status": "error",
                    "message": "Only admin can perform this action",
                    "data": None,
                    "error": None
                },
                status=403
            )

        if request.method == "POST":

            json_data = request.data.get("json")

            if not json_data:

                return api_response(
                    "error",
                    "JSON data is required",
                    None,
                    http_status=400
                )

            try:

                data = json.loads(json_data)

            except json.JSONDecodeError:

                return api_response(
                    "error",
                    "Invalid JSON data",
                    None,
                    http_status=400
                )

            

            serializer = ProductSerializerPush(
                data=data
            )

            if not serializer.is_valid():

                return api_response(
                    "error",
                    "Validation failed",
                    serializer.errors,
                    http_status=400
                )

           

            with transaction.atomic():

                product = serializer.save()

                

                product_colors = ProductColorImage.objects.filter(
                    product=product
                )

               

                for product_color in product_colors:

                    color = product_color.color
                    
                    if not color:
                        continue

                    
                    

                    
                    image = request.FILES.get(
                        color
                    )

                    if image:

                        image_url = upload_image(
                            image,
                            "products"
                        )

                        product_color.image = image_url

                        product_color.save(
                            update_fields=["image"]
                        )

            

            serializer_response = ProductSerializer(
                product
            )

            return api_response(
                "success",
                "Product added successfully",
                serializer_response.data,
                http_status=201
            )
        
       
         
         
          
        if request.method == "DELETE":

            with transaction.atomic():

                product = (
                    Product.objects
                    .select_for_update()
                    .get(id=product_id)
                )

              

                product_colors = (
                    ProductColorImage.objects
                    .filter(product=product)
                )


                image_urls = [
                    item.image
                    for item in product_colors
                    if item.image
                ]

               

                product.delete()

                

                for image_url in image_urls:

                    delete_image(
                        image_url
                    )

            return api_response(
                "success",
                "Product and images deleted successfully.",
                None,
                http_status=200
            )
            
            
            
        if request.method == "PUT":
            product = Product.objects.get(pk=product_id)
            
            serializer = ProductSerializerUpdate(
                product,
                data=request.data,
                partial=True,
            )
    
            serializer.is_valid(raise_exception=True)
            serializer.save()
    
            return api_response(
                "success",
                "Product updated successfully.",
                serializer.data,
                http_status=200,
            )
        
    except Category.DoesNotExist:
        return api_response("error", "Category not found", error="Category with the given ID does not exist.", http_status=404)
    except Product.DoesNotExist:
        return api_response("error", "Product not found", error="Product with the given ID does not exist.", http_status=404)
    except Exception as e:
        return api_response("error", "An error occurred while retrieving products", str(e), http_status=400)



@api_view(['GET'])
def get_offers(request):
    try:
        
        products = Product.objects.filter(oldPrice__gt=0)
        serializer = ProductSerializer(products, many=True)
        return api_response("success", "Offers retrieved successfully", serializer.data, http_status=200)
     
    except Exception as e:
        return api_response("error", "An error occurred while retrieving offers", str(e), http_status=400)
    
    
#==========COMMENDS_ORDERS=========

@api_view(["POST", "GET", "DELETE", "PUT"])
@transaction.atomic
def commend_order_method(
    request,
    status,
    order_id
):

    try:

      

        if request.method == "POST":

            json_data = request.data.get("json")

            if not json_data:

                return api_response(
                    "error",
                    "JSON data is required",
                    None,
                    http_status=400
                )

            try:

                data = json.loads(json_data)

            except json.JSONDecodeError:

                return api_response(
                    "error",
                    "Invalid JSON data",
                    None,
                    http_status=400
                )

            

            new_image = request.FILES.get(
                "recipte"
            )

            serializer = CommendSerializerPush(
                data=data,
                context={
                    "image": new_image
                }
            )

            if not serializer.is_valid():

                return api_response(
                    "error",
                    "Validation failed",
                    serializer.errors,
                    http_status=400
                )

            willya = serializer.validated_data.get(
                "willya"
            )

           

            """" if willya != "Alger" and not new_image:

                return api_response(
                    "error",
                    "Validation failed",
                    "Please pay a 1,000 DZD deposit in advance "
                    "to confirm your order and ensure delivery. "
                    "Thank you for your understanding.",
                    http_status=400
                )"""

            

            commend = serializer.save()

            return api_response(
                "success",
                "Order placed successfully",
                CommendSerializer(commend).data,
                http_status=201
            )

        permission = IsAdmin()

        if not permission.has_permission(request, None):
            return Response(
                {
                    "status": "error",
                    "message": "Only admin can perform this action",
                    "data": None,
                    "error": None
                },
                status=403
            )

        if request.method == "GET":

            valid_status = [
                OrderStatus.PENDING,
                OrderStatus.DELIVERED,
                OrderStatus.CANCELED,
            ]

            if status not in valid_status:

                return api_response(
                    "error",
                    "Invalid status parameter.",
                    error="Invalid status parameter.",
                    http_status=400
                )

            commends = (
                Commend.objects
                .filter(status=status)
                .prefetch_related(
                    "commend_orders"
                )
            )

            serializer = CommendSerializer(
                commends,
                many=True
            )

            return api_response(
                "success",
                "Commends retrieved successfully",
                serializer.data,
                http_status=200
            )

      

        if request.method == "PUT":

            order = (
                Orders.objects
                .select_related("commend")
                .get(pk=order_id)
            )

            if order.commend.status != OrderStatus.PENDING:

                return api_response(
                    "error",
                    "Order cannot be updated.",
                    error=(
                        "Only orders belonging to "
                        "pending commend can be updated."
                    ),
                    http_status=400,
                )

           

            serializer = OrderSerializer(
                order,
                data=request.data,
                partial=True,
            )

            serializer.is_valid(
                raise_exception=True
            )

            serializer.save()

            return api_response(
                "success",
                "Order updated successfully.",
                serializer.data,
                http_status=200,
            )

       

        if request.method == "DELETE":

            order = (
                Orders.objects
                .select_related("commend")
                .select_for_update()
                .get(
                    id=order_id
                )
            )

            commend = order.commend

           

            image_url = commend.image_url


            order.delete()

            

            if not commend.commend_orders.exists():

                commend.delete()

                if image_url:

                    delete_image(
                        image_url
                    )

            return api_response(
                "success",
                "Order deleted successfully.",
                None,
                http_status=200,
            )

    except Orders.DoesNotExist:

        return api_response(
            "error",
            "Order not found.",
            error=(
                "Order with the given ID "
                "does not exist."
            ),
            http_status=404,
        )

    except Exception as e:

        return api_response(
            "error",
            "An error occurred while processing the order.",
            str(e),
            http_status=400
        )

@api_view(["PUT","DELETE"])
@permission_classes([IsAdmin])
@transaction.atomic
def update_commend_status_or_delete(request, commend_id, new_status):

    

    try:
        
      
            
            
        if request.method=="PUT":
            
                  valid_status = {
                          OrderStatus.PENDING,
                          OrderStatus.DELIVERED,
                          OrderStatus.CANCELED,
                      }
                  
                  if new_status not in valid_status:
                          return api_response(
                              "error",
                              "Invalid status parameter.",
                              error="Invalid status parameter.",
                              http_status=400,
                          )

                  commend = (
                      Commend.objects
                      .select_for_update()
                      .prefetch_related("commend_orders")
                      .get(id=commend_id)
                  )
          
                  orders = list(commend.commend_orders.all())
                  
                  product_sizes = ProductSize.objects.select_for_update().in_bulk(
                      [order.productSize_id for order in orders]
                  )
          
                  
          
                  if (
                      commend.status in [OrderStatus.PENDING, OrderStatus.CANCELED]
                      and new_status == OrderStatus.DELIVERED
                  ):
          
                        
                      for order in orders:
          
                          product_size = product_sizes[order.productSize_id]
          
                          if product_size.qte < order.quantity:
                              return api_response(
                                  "error",
                                  "Insufficient quantity available.",
                                  error=f"ProductSize {product_size.id} has only {product_size.qte} available.",
                                  http_status=400,
                              )
          
                     
                      for order in orders:
          
                          product_size = product_sizes[order.productSize_id]
          
                          product_size.qte = F("qte") - order.quantity
                          product_size.save(update_fields=["qte"])
                          product_size.refresh_from_db()
                          
                          update_qte_ws(
                              product_size.id,
                              product_size.qte,
                          )
          
                 
          
                  elif (
                      commend.status == OrderStatus.DELIVERED
                      and new_status in [OrderStatus.PENDING, OrderStatus.CANCELED]
                  ):
          
                      for order in orders:
          
                          product_size = product_sizes[order.productSize_id]
          
                          product_size.qte = F("qte") + order.quantity
                          product_size.save(update_fields=["qte"])
                          product_size.refresh_from_db()
          
                          update_qte_ws(
                              product_size.id,
                              product_size.qte,
                          )
          
                  
                  commend.status = new_status
                  commend.save(update_fields=["status"])
          
                  serializer = CommendSerializer(commend)
          
                  return api_response(
                      "success",
                      "Order status updated successfully.",
                      serializer.data,
                      http_status=200,
                  )
        if request.method == "DELETE":

             commend = (
                 Commend.objects
                 .select_for_update()
                 .get(id=commend_id)
             )
         
             image_url = commend.image_url
         
             commend.delete()
         
             
             if image_url:
                 delete_image(image_url)
         
             return api_response(
                 "success",
                 "Commend deleted successfully.",
                 None,
                 http_status=200,
             )
      
    except Commend.DoesNotExist:

        return api_response(
            "error",
            "Order not found.",
            error="Order with the given ID does not exist.",
            http_status=404,
        )

    except Exception as e:

        return api_response(
            "error",
            "An error occurred while updating the order status.",
            error=str(e),
            http_status=400,
        )
        
@api_view(["PUT","DELETE","POST"])
@permission_classes([IsAdmin])
@transaction.atomic
def pr_size_method(request, product_size_id,productColor_id):
    
    try:
        
        if request.method == "POST":
      
          serializer = ManyProductSizeSerializer(data=request.data)
      
          if not serializer.is_valid():
              return api_response(
                  "error",
                  "Validation failed",
                  serializer.errors,
                  http_status=400
              )
      
          
          try:
              product_color = ProductColorImage.objects.get(
                  id=productColor_id
              )
          except ProductColorImage.DoesNotExist:
              return api_response(
                  "error",
                  "Product color not found",
                  None,
                  http_status=404
              )
      
          sizes_data = serializer.validated_data["info"]
      
          created_sizes = []
      
          for size_data in sizes_data:
              eq_size = getattr(EqSize, size_data["size"]).value

              product_size = ProductSize.objects.create(
                  productColor=product_color,
                  size=size_data["size"],
                  eqSize=eq_size,
                  qte=size_data["qte"]
              )
              
              
      
              created_sizes.append(product_size)
              update_qte_ws(
                              product_size.id,
                              product_size.qte,
                          )
          
          response_serializer = ProductSizeSerializer(
              created_sizes,
              many=True
          )
      
          return api_response(
              "success",
              "Product sizes added successfully",
              response_serializer.data,
              http_status=201
          )
            
            
        
        if request.method=="PUT":
            
            product_size = ProductSize.objects.get(
                    id=product_size_id
                )
            
        
            serializer = ProductSizeSerializer(
                product_size,
                data=request.data,
                partial=True
            )
        
            if not serializer.is_valid():
                return api_response(
                    "error",
                    "Validation failed",
                    serializer.errors,
                    http_status=400,
                )
        
            product_size = serializer.save( eqSize = getattr(EqSize, serializer.validated_data["size"]).value)
        
            update_qte_ws(
                product_size.id,
                product_size.qte,
            )
        
            serializer = ProductSizeSerializer(
                product_size
            )
        
            return api_response(
                "success",
                "Product size quantity updated successfully.",
                serializer.data,
                http_status=200,
            )
            
        if request.method=="DELETE":
            ProductSize.objects.filter(id=product_size_id).delete()
            return api_response(
            "success",
            "Product size deleted successfully.",
            None,
            http_status=200,
        )

    except ProductSize.DoesNotExist:
        return api_response(
            "error",
            "Product size not found.",
            error="ProductSize with the given ID does not exist.",
            http_status=404,
        )

    except Exception as e:
        return api_response(
            "error",
            "An error occurred while updating the product size quantity.",
            error=str(e),
            http_status=400,
        )
        
        
@api_view(["PUT","POST","DELETE"])
@permission_classes([IsAdmin])
@transaction.atomic
def pr_colorImage_method(  request, productColorImage_id,  new_color ,product_id):

    try:

        if request.method=="PUT":

            pr_color_image = (
                ProductColorImage.objects
                .select_for_update()
                .get(id=productColorImage_id)
            )
    
            
    
            valid_colors = [
                choice[0]
                for choice in Color.choices
            ]
    
            if new_color not in valid_colors:
    
                return api_response(
                    "error",
                    "Invalid color",
                    f"Color '{new_color}' is not valid.",
                    http_status=400
                )
    
           
    
            product_colors = (
                pr_color_image
                .product
                .productsInfo
                .all()
            )
    
            for product_color in product_colors:
    
                if (
                    product_color.id != pr_color_image.id
                    and product_color.color == new_color
                ):
    
                    return api_response(
                        "error",
                        "Color already exists",
                        f"Color '{new_color}' already exists for this product.",
                        http_status=400
                    )
    
    
            pr_color_image.color = new_color
    
           
    
            new_image = request.FILES.get("image")
    
            old_image = pr_color_image.image
    
            new_image_url = None
    
            if new_image:
    
               
    
                new_image_url = upload_image(
                    new_image,
                    "products"
                )
    
                pr_color_image.image = new_image_url
    
           
    
            pr_color_image.save(
                update_fields=[
                    "color",
                    "image"
                ]
            )
            
           
    
            if new_image and old_image:
    
                delete_image(old_image)
    
           
    
            pr_color_image.refresh_from_db()
    
            return api_response(
                "success",
                "Product color and image updated successfully.",
                {
                    "id": pr_color_image.id,
                    "color": pr_color_image.color,
                    "image": pr_color_image.image
                },
                http_status=200
            )
            
            
         

        
        if request.method == "DELETE":
            
            pr_color_image = ProductColorImage.objects.get(id=productColorImage_id)
            image_url=pr_color_image.image
            delete_image(image_url)
            pr_color_image.delete()
            return api_response(
            "success",
            "Color image deleted successfully",
            None,
            http_status=200
    )
            
            
        if request.method == "POST":
        
            json_data = request.data.get("json")
        
            if not json_data:
                return api_response(
                    "error",
                    "JSON data is required",
                    None,
                    http_status=400
                )
        
            try:
                data = json.loads(json_data)
        
            except json.JSONDecodeError:
                return api_response(
                    "error",
                    "Invalid JSON data",
                    None,
                    http_status=400
                )
        
            serializer = ManyColorImageSerializer(data=data)
        
            if not serializer.is_valid():
                return api_response(
                    "error",
                    "Validation failed",
                    serializer.errors,
                    http_status=400
                )
        
            try:
                product = Product.objects.get(id=product_id)
        
            except Product.DoesNotExist:
                return api_response(
                    "error",
                    "Product not found",
                    "Product with the given ID does not exist.",
                    http_status=404
                )
        
            pr_info = serializer.validated_data["info"]
        
            for pr in pr_info:
        
                color = pr["color"]
        
                
                if ProductColorImage.objects.filter(
                    product=product,
                    color=color
                ).exists():
        
                    return api_response(
                        "error",
                        "Color already exists",
                        f"The color '{color}' already exists for this product.",
                        http_status=400
                    )
        
              
                image = request.FILES.get(color)
        
                if not image:
                    return api_response(
                        "error",
                        "Image is required",
                        f"Image for color '{color}' is required.",
                        http_status=400
                    )
        
                
                image_url = upload_image(
                    image,
                    "products"
                )
        
              
                new_pr = ProductColorImage.objects.create(
                    product=product,
                    image=image_url,
                    color=color
                )
        
               
                pr_sizeQte = pr["sizesQte"]
        
                for size_data in pr_sizeQte:
        
                    eq_size = getattr(
                        EqSize,
                        size_data["size"]
                    ).value
        
                    ProductSize.objects.create(
                        productColor=new_pr,
                        size=size_data["size"],
                        qte=size_data["qte"],
                        eqSize=eq_size
                    )
        
            
            serializer = ProductSerializer(product)
        
            return api_response(
                "success",
                "Product color images added successfully",
                serializer.data,
                http_status=201
            )
        
    except ProductColorImage.DoesNotExist:

        return api_response(
            "error",
            "Product color not found",
            "ProductColorImage with the given ID does not exist.",
            http_status=404
        )

    except Exception as e:

        return api_response(
            "error",
            "An error occurred while updating the product color image.",
            error=str(e),
            http_status=400
        )
        
        

@api_view(["GET", "POST", "PUT", "DELETE"])
@transaction.atomic
def livrison_price_method(request, livrison_price_id):

    try:

      
        if request.method == "GET":

           
            if livrison_price_id == 0:

                livrison_prices = (
                    LivrisonPrice.objects.all()
                )

                serializer = LivrsionPriceSerializer(
                    livrison_prices,
                    many=True
                )

                return api_response(
                    "success",
                    "Delivery prices retrieved successfully.",
                    serializer.data,
                    http_status=200
                )

            
            livrison_price = (
                LivrisonPrice.objects.get(
                    id=livrison_price_id
                )
            )

            serializer = LivrsionPriceSerializer(
                livrison_price
            )

            return api_response(
                "success",
                "Delivery price retrieved successfully.",
                serializer.data,
                http_status=200
            )

        permission = IsAdmin()

        if not permission.has_permission(request, None):
            return Response(
                {
                    "status": "error",
                    "message": "Only admin can perform this action",
                    "data": None,
                    "error": None
                },
                status=403
            )

        if request.method == "POST":

            serializer = LivrsionPriceSerializer(
                data=request.data
            )

            if serializer.is_valid():

                serializer.save()

                return api_response(
                    "success",
                    "Delivery price added successfully.",
                    serializer.data,
                    http_status=201
                )

            return api_response(
                "error",
                "Validation failed.",
                error=serializer.errors,
                http_status=400
            )

       

        if request.method == "PUT":

            livrison_price = (
                LivrisonPrice.objects
                .select_for_update()
                .get(
                    id=livrison_price_id
                )
            )

            serializer = LivrsionPriceSerializer(
                livrison_price,
                data=request.data,
                partial=True
            )

            if serializer.is_valid():

                serializer.save()

                return api_response(
                    "success",
                    "Delivery price updated successfully.",
                    serializer.data,
                    http_status=200
                )

            return api_response(
                "error",
                "Validation failed.",
                error=serializer.errors,
                http_status=400
            )

       

        if request.method == "DELETE":

            livrison_price = (
                LivrisonPrice.objects
                .select_for_update()
                .get(
                    id=livrison_price_id
                )
            )

            livrison_price.delete()

            return api_response(
                "success",
                "Delivery price deleted successfully.",
                None,
                http_status=200
            )

    except LivrisonPrice.DoesNotExist:

        return api_response(
            "error",
            "Delivery price not found.",
            "The delivery price with the given ID does not exist.",
            http_status=404
        )

    except Exception as e:

        return api_response(
            "error",
            "An error occurred while processing the delivery price.",
            error=str(e),
            http_status=400
        )

        
        

        
        
        
