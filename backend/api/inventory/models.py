from django.db import models


class InventoryItem(models.Model):
    name = models.CharField(max_length=255)
    price = models.IntegerField(default=0)
    stock = models.IntegerField(default=0)

    def __str__(self):
        return self.name
