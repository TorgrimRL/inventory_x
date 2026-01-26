### **GET /api/user/logout/**

Logs out the user and close session.

#### **Request**

- **Auth:** Session Cookie (Required)

#### **Response (200 OK)**

The session cookie is cleared/invalidated.

```json
{
  "detail": "Sesion closed"
}
```
