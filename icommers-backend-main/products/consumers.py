from channels.generic.websocket import AsyncJsonWebsocketConsumer


class ProductConsumer(AsyncJsonWebsocketConsumer):

    async def connect(self):
        await self.channel_layer.group_add(
            "products",
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            "products",
            self.channel_name
        )

    async def stock_updated(self, event):

        await self.send_json({
            "type": "stock_updated",
            "product_size_id": event["product_size_id"],
            "new_quantity": event["new_quantity"],
        })