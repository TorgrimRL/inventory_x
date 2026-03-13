from django.urls import reverse
from rest_framework import status

from api.inventory.context import SESSION_ACTIVE_INVENTORY_KEY
from api.inventory.contracts.create_item import CREATE_ITEM_RESPONSES
from api.inventory.contracts.list_inventories import LIST_INVENTORIES_RESPONSES
from api.inventory.contracts.list_items import LIST_ITEMS_RESPONSES
from api.inventory.models import Inventory, InventoryItem, InventoryMembership
from api.tests.base import BaseAPITestCase


class InventoryListViewTests(BaseAPITestCase):
    def setUp(self):
        self.user = self.create_user(
            email="user@test.com",
            password="password123",
        )
        self.client.force_authenticate(self.user)

        # Create an inventory + membership and set it active in session
        self.inventory = Inventory.objects.create(
            name="Ola AS", org_number="123456789"
        )
        InventoryMembership.objects.create(
            user=self.user,
            inventory=self.inventory,
            role=InventoryMembership.Role.OWNER,
        )

        # Make the session select active inventory
        session = self.client.session
        session[SESSION_ACTIVE_INVENTORY_KEY] = str(self.inventory.id)
        session.save()

    def test_inventory_list_view(self):
        InventoryItem.objects.create(
            inventory=self.inventory, name="Monitor", price=200, stock=1
        )

        response = self.client.get("/api/inventory/")
        self.assert_contract(response, LIST_ITEMS_RESPONSES, status.HTTP_200_OK)
        data = response.json()

        self.assertIn("data", data)
        self.assertEqual(data["data"][0]["name"], "Monitor")

    def test_inventory_list_multiple_items(self):
        InventoryItem.objects.create(
            inventory=self.inventory, name="Monitor", price=200, stock=1
        )
        InventoryItem.objects.create(
            inventory=self.inventory, name="Keyboard", price=100, stock=5
        )

        response = self.client.get("/api/inventory/")

        self.assert_contract(response, LIST_ITEMS_RESPONSES, status.HTTP_200_OK)
        data = response.json()

        self.assertIn("data", data)
        self.assertEqual(len(data["data"]), 2)

        # Convert the list to a dictionary
        items_by_name = {item["name"]: item for item in data["data"]}

        self.assertIn("Monitor", items_by_name)
        self.assertIn("Keyboard", items_by_name)

        self.assertEqual(items_by_name["Monitor"]["price"], 200)
        self.assertEqual(items_by_name["Monitor"]["stock"], 1)

        self.assertEqual(items_by_name["Keyboard"]["price"], 100)
        self.assertEqual(items_by_name["Keyboard"]["stock"], 5)

    def test_inventory_list_empty(self):
        response = self.client.get("/api/inventory/")

        self.assert_contract(response, LIST_ITEMS_RESPONSES, status.HTTP_200_OK)
        data = response.json()

        self.assertIn("data", data)
        self.assertEqual(data["data"], [])

    def test_inventory_item_empty_name(self):
        response = self.client.post(
            "/api/inventory/",
            {"name": "", "price": 100, "stock": 5},
            format="json",
        )

        self.assert_contract(
            response, CREATE_ITEM_RESPONSES, status.HTTP_400_BAD_REQUEST
        )

        data = response.json()
        # Ikke anta eksakt format.
        # Vi sjekker bare at feilen gjelder "name".
        self.assertTrue(
            ("name" in data)
            or ("detail" in data and "name" in str(data["detail"]).lower())
        )

    def test_inventory_item_created(self):
        payload = {"name": "Test Item", "price": 100, "stock": 5}

        response = self.client.post("/api/inventory/", payload, format="json")

        self.assert_contract(
            response, CREATE_ITEM_RESPONSES, status.HTTP_201_CREATED
        )
        data = response.json()

        self.assertTrue(
            ("name" in data)
            or (
                "data" in data
                and isinstance(data["data"], dict)
                and "name" in data["data"]
            )
            or ("id" in data)
            or (
                "data" in data
                and isinstance(data["data"], dict)
                and "id" in data["data"]
            )
            or ("detail" in data and "name" in str(data["detail"]).lower())
        )

    def test_inventory_item_negative_stock(self):
        response = self.client.post(
            "/api/inventory/",
            {"name": "Test Item", "price": 100, "stock": -5},
            format="json",
        )

        self.assert_contract(
            response, CREATE_ITEM_RESPONSES, status.HTTP_400_BAD_REQUEST
        )

        data = response.json()
        self.assertTrue(
            ("stock" in data)
            or ("detail" in data and "stock" in str(data["detail"]).lower())
        )

    def test_inventory_item_negative_price(self):
        response = self.client.post(
            "/api/inventory/",
            {"name": "Test Item", "price": -5, "stock": 5},
            format="json",
        )

        self.assert_contract(
            response, CREATE_ITEM_RESPONSES, status.HTTP_400_BAD_REQUEST
        )

        data = response.json()
        self.assertTrue(
            ("price" in data)
            or ("detail" in data and "price" in str(data["detail"]).lower())
        )

    def test_get_409_clears_session_when_not_member(self):
        # Arrange: lag en inventory brukeren IKKE er medlem av
        other_inventory = Inventory.objects.create(
            name="Other Co",
            org_number="999888777",
        )

        # Sett session til inventory user ikke er medlem av
        session = self.client.session
        session[SESSION_ACTIVE_INVENTORY_KEY] = str(other_inventory.id)
        session.save()

        # Act
        res = self.client.get("/api/inventory/")

        # Assert: require_active_membership -> 409
        self.assert_contract(
            res, LIST_ITEMS_RESPONSES, status.HTTP_409_CONFLICT
        )

        body = res.json()
        self.assertIn("detail", body)

        # Assert: session key ble fjernet
        session2 = self.client.session
        self.assertNotIn(SESSION_ACTIVE_INVENTORY_KEY, session2)

    def test_items_are_isolated_per_inventory_when_switching_active_inventory(
        self,
    ):
        # Arrange: make inventory B og membership
        inv_b = Inventory.objects.create(
            name="Jessica Cookies AS", org_number="444555666"
        )
        InventoryMembership.objects.create(
            user=self.user,
            inventory=inv_b,
            role=InventoryMembership.Role.OWNER,
        )

        # Items A (self.inventory) and B
        InventoryItem.objects.create(
            inventory=self.inventory, name="A-Item", price=100, stock=1
        )
        InventoryItem.objects.create(
            inventory=inv_b, name="B-Item", price=200, stock=2
        )

        # Act + Assert: Just A items
        session = self.client.session
        session[SESSION_ACTIVE_INVENTORY_KEY] = str(self.inventory.id)
        session.save()

        res_a = self.client.get("/api/inventory/")
        body_a = self.assert_contract(
            res_a, LIST_ITEMS_RESPONSES, status.HTTP_200_OK
        )
        names_a = [row["name"] for row in body_a["data"]]
        self.assertEqual(names_a, ["A-Item"])

        # Act + Assert: Just B Items
        session = self.client.session
        session[SESSION_ACTIVE_INVENTORY_KEY] = str(inv_b.id)
        session.save()

        res_b = self.client.get("/api/inventory/")
        body_b = self.assert_contract(
            res_b, LIST_ITEMS_RESPONSES, status.HTTP_200_OK
        )
        names_b = [row["name"] for row in body_b["data"]]
        self.assertEqual(names_b, ["B-Item"])


class ListInventoriesViewTests(BaseAPITestCase):
    def setUp(self):
        self.url = reverse("inventories-list")
        self.user = self.create_user(
            email="user@test.com", password="password123"
        )
        self.other_user = self.create_user(
            email="other@test.com", password="password123"
        )

    def test_requires_authentication(self):
        response = self.client.get(self.url)

        # Med BasicAuthentication i DEFAULT_AUTHENTICATION_CLASSES
        # pleier GET uten creds å bli 401.
        self.assert_contract(
            response,
            LIST_INVENTORIES_RESPONSES,
            status.HTTP_403_FORBIDDEN,
        )

    def test_happy_path_lists_two_inventories_with_role_and_orders_by_name(
        self,
    ):
        self.client.force_authenticate(user=self.user)
        inv_b = Inventory.objects.create(name="Beta AS", org_number="987654321")
        inv_a = Inventory.objects.create(name="Acme AS", org_number="123456789")

        InventoryMembership.objects.create(
            user=self.user,
            inventory=inv_a,
            role=InventoryMembership.Role.OWNER,
        )
        InventoryMembership.objects.create(
            user=self.user,
            inventory=inv_b,
            role=InventoryMembership.Role.EMPLOYEE,
        )

        response = self.client.get(self.url)
        self.assert_contract(
            response,
            LIST_INVENTORIES_RESPONSES,
            status.HTTP_200_OK,
        )

        body = response.json()
        self.assertIsInstance(body, list)
        self.assertEqual(len(body), 2)

        for row in body:
            self.assertIn("id", row)
            self.assertIn("name", row)
            self.assertIn("orgNumber", row)
            self.assertIn("role", row)

        self.assertEqual(body[0]["name"], "Acme AS")
        self.assertEqual(body[0]["orgNumber"], "123456789")
        self.assertEqual(body[0]["role"], "owner")

        self.assertEqual(body[1]["name"], "Beta AS")
        self.assertEqual(body[1]["orgNumber"], "987654321")
        self.assertEqual(body[1]["role"], "employee")

    def test_empty_state_returns_empty_list(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.get(self.url)
        data = self.assert_contract(
            response,
            LIST_INVENTORIES_RESPONSES,
            status.HTTP_200_OK,
        )

        self.assertEqual(data, [])

    def test_user_cannot_see_other_users_inventories(self):
        self.client.force_authenticate(user=self.user)

        inv_other = Inventory.objects.create(
            name="Other Co", org_number="111222333"
        )
        InventoryMembership.objects.create(
            user=self.other_user,
            inventory=inv_other,
            role=InventoryMembership.Role.OWNER,
        )

        response = self.client.get(self.url)
        data = self.assert_contract(
            response,
            LIST_INVENTORIES_RESPONSES,
            status.HTTP_200_OK,
        )

        self.assertEqual(data, [])
