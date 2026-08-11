from django.urls import path
from .views import *
urlpatterns = [
    path('category_method/<int:category_id>/', Category_method),
    path("products_method/<int:category_id>/<int:product_id>/", products_method),
    path("get_offers/", get_offers),
    path("commends_orders_method/<str:status>/<int:order_id>/", commend_order_method),
    path("update_commend_status_or_delete/<int:commend_id>/<str:new_status>/", update_commend_status_or_delete),
    path("update_qte/<int:product_size_id>/<int:new_quantity>/", update_qte),
    path("update_coor_image/<int:productColorImage_id>/<str:new_color>/",update_color_image),
    path("livrison_method/<int:livrison_price_id>/",livrison_price_method),
    path("signin/", signin),   
    path("signup/<str:new_username>/<str:new_password>/", create_admin)
    
]
