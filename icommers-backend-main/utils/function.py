from products.consumers import ProductConsumer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.db import transaction
from collections import defaultdict
from products.models import LivrisonPrice



def price_and_livraison(willya, price, quantity):
    #obj = LivrisonPrice.objects.get(
     #   willya=willya
    #)
    
    return price * quantity + 0



def update_qte_ws(product_size_id, new_quantity):
  

    channel_layer = get_channel_layer()
    transaction.on_commit(
        lambda: async_to_sync(channel_layer.group_send)(
            "products",
            {
                "type": "stock_updated",
                "product_size_id": product_size_id,
                "new_quantity": new_quantity,
            }
        )
    )
    