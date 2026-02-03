from django.db import models


class InventoryItem(models.Model):
    id: int
    name = models.CharField(max_length=255)
    price = models.IntegerField()
    stock = models.IntegerField(default=0)

    def __str__(self):
        return self.name
