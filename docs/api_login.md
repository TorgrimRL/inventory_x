### **POST /api/user/login/**

Authenticates a user and sets the session cookie.

#### **Request**

- **Content-Type:** `application/json`
- **Body:**

```json
{
  "email": "info@inventoryx.no",
  "password": "yourpassword"
}
```

#### **Response (200 OK)**

The `sessionid` cookie, is included automaticly by django.

```json
{
  "token": "abc123xyz...",
  "detail": "Login successful"
}
```

#### **Response (401 Unauthorized)**

```json
{
  "detail": "Invalid credentials"
}
```
