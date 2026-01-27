from .models import InventoryItem

def get_all_items():
    """
    Fetches all inventory items from the database.
    Returns them as a list of dictionaries.
    """
    try:
        queryset = InventoryItem.objects.all()
        items = queryset.values("id", "name", "price", "stock")
        return list(items)
    except Exception as e:
        raise Exception(f"Failed to fetch items: {str(e)}")

def create_item(name, price, stock):
    """
    Creates a new inventory item.
    Returns the created item as a dictionary.
    """
    try:
        if InventoryItem.objects.filter(name=name).exists():
            raise ValueError(f"Item with name '{name}' already exists.")
        
        # Create the item and return the details as a dictionary
        item = InventoryItem.objects.create(name=name, price=price, stock=stock)
        return {"id": item.id, "name": item.name, "price": item.price, "stock": item.stock}
    except ValueError as ve:
        raise ve  # Propagate the business validation error
    except Exception as e:
        raise Exception(f"Error creating inventory item: {str(e)}")
