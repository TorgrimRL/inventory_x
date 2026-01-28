### **GET /api/user/verify/**

Checks the validity of the current user session and retrieves basic user info.

#### **Request**

- **Method:** `GET`
- **Auth:** Session Cookie (Required)

#### **Response (200 OK)**

```json
{
  "detail": "Session is valid",
  "username": "johndoe@example.com"
}
```

#### **Response (403 Forbidden)**

Returned if the session is invalid or expired.

```json
{
  "detail": "Authentication credentials were not provided."
}
```

---

### **Developer Note: Accessing User ID**

To access the logged-in user's ID or username (via `request.user`),
you **must** enforce authentication on your view.

Add `IsAuthenticated` to your `permission_classes`.
This ensures Django processes the session cookie and
populates the `request.user` object.

```python
from typing import ClassVar
from rest_framework.permissions import IsAuthenticated

class MyProtectedView(views.APIView):
    # REQUIRED: Populates request.user via session
    permission_classes: ClassVar = [IsAuthenticated]

    def get(self, request):
        print(request.user.id) # Now accessible
        return Response(...)

```
