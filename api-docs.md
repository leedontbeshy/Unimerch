
# UniMerch API Documentation

## Authentication Endpoints

### POST /api/auth/register
Đăng ký tài khoản mới.

**Request:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "MyPassword123",
  "fullName": "Nguyễn Văn John",
  "studentId": "SV2024001",
  "phone": "0987654321",
  "address": "123 Đường ABC, Quận 1, TP.HCM"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Đăng ký thành công",
  "data": {
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "fullName": "Nguyễn Văn John",
      "studentId": "SV2024001",
      "phone": "0987654321",
      "address": "123 Đường ABC, Quận 1, TP.HCM",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### POST /api/auth/login
Đăng nhập tài khoản.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "MyPassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "fullName": "Nguyễn Văn John",
      "studentId": "SV2024001",
      "phone": "0987654321",
      "address": "123 Đường ABC, Quận 1, TP.HCM",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## Common Error Responses

**400 - Validation Error:**
```json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "errors": [...]
}
```

**401 - Authentication Error:**
```json
{
  "success": false,
  "message": "Email hoặc mật khẩu không đúng"
}
```

**409 - Conflict:**
```json
{
  "success": false,
  "message": "Email đã được sử dụng"
}
```

**500 - Server Error:**
```json
{
  "success": false,
  "message": "Lỗi server"
}
```
### POST /api/auth/logout
Đăng xuất tài khoản.

**Response (200):**
```json
{
  "success": true,
  "message": "Đăng xuất thành công",
  "data": null
}
```

---

## Common Error Responses

**400 - Validation Error:**
```json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "errors": [...]
}
```

**401 - Authentication Error:**
```json
{
  "success": false,
  "message": "Token không được cung cấp"
}
```

**409 - Conflict:**
```json
{
  "success": false,
  "message": "Email đã được sử dụng"
}
```

---
---

## Notes
- JWT token có thời hạn 7 ngày
- Mật khẩu được mã hóa bằng bcrypt
- Các trường `studentId`, `phone`, `address` là optional khi đăng ký
- Email và username phải unique
```

## Test endpoint login:

**Request body:**
```json
{
  "email": "john@example.com",
  "password": "MyPassword123"
}
```

Bây giờ bạn có thể test cả register và login! 🚀


