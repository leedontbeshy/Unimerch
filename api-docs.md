# UniMerch API Documentation

## 📋 Table of Contents
- [Authentication Endpoints](#authentication-endpoints)
- [User Management Endpoints](#user-management-endpoints)
- [Common Error Responses](#common-error-responses)

---

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

### POST /api/auth/logout
Đăng xuất tài khoản.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Đăng xuất thành công",
  "data": null
}
```

---

### POST /api/auth/forgot-password
Quên mật khẩu - gửi email reset.

**Request:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Email hướng dẫn reset mật khẩu đã được gửi",
  "data": null
}
```

**Note:** Email sẽ chứa link reset có thời hạn 15 phút.

---

## User Management Endpoints

### 🔐 User Profile APIs (Authentication Required)

#### GET /api/users/profile
Lấy thông tin profile người dùng hiện tại.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Postman Setup:**
- Method: `GET`
- URL: `http://localhost:3000/api/users/profile`

**Response (200):**
```json
{
  "success": true,
  "message": "Lấy thông tin profile thành công",
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "fullName": "Nguyễn Văn John",
    "studentId": "SV2024001",
    "phone": "0987654321",
    "address": "123 Đường ABC, Quận 1, TP.HCM",
    "role": "user",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

#### PUT /api/users/profile
Cập nhật thông tin profile người dùng hiện tại.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Postman Setup:**
- Method: `PUT`
- URL: `http://localhost:3000/api/users/profile`

**Request:**
```json
{
  "fullName": "Nguyễn Văn An",
  "studentId": "SV2024001",
  "phone": "0123456789",
  "address": "123 Đường ABC, Quận 1, TP.HCM"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Cập nhật profile thành công",
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "fullName": "Nguyễn Văn An",
    "studentId": "SV2024001",
    "phone": "0123456789",
    "address": "123 Đường ABC, Quận 1, TP.HCM",
    "role": "user",
    "updatedAt": "2025-01-01T12:00:00.000Z"
  }
}
```

---

#### PUT /api/users/change-password
Đổi mật khẩu người dùng hiện tại.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Postman Setup:**
- Method: `PUT`
- URL: `http://localhost:3000/api/users/change-password`

**Request:**
```json
{
  "currentPassword": "MyOldPassword123",
  "newPassword": "MyNewPassword456",
  "confirmPassword": "MyNewPassword456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Đổi mật khẩu thành công",
  "data": null
}
```

---

### 👨‍💼 Admin APIs (Admin Role Required)

#### GET /api/users
Lấy danh sách tất cả users (Admin only).

**Headers:**
```
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

**Query Parameters:**
- `page` (optional): Số trang, mặc định = 1
- `limit` (optional): Số users per page, mặc định = 20
- `search` (optional): Tìm kiếm theo username, email, hoặc fullName

**Postman Setup:**
- Method: `GET`
- URL: `http://localhost:3000/api/users?page=1&limit=10&search=john`

**Response (200):**
```json
{
  "success": true,
  "message": "Lấy danh sách users thành công",
  "data": {
    "users": [
      {
        "id": 1,
        "username": "john_doe",
        "email": "john@example.com",
        "fullName": "Nguyễn Văn John",
        "studentId": "SV2024001",
        "phone": "0987654321",
        "address": "123 Đường ABC, Quận 1, TP.HCM",
        "role": "user",
        "createdAt": "2025-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalUsers": 50,
      "usersPerPage": 10
    }
  }
}
```

---

#### GET /api/users/:id
Lấy thông tin user theo ID (Admin only).

**Headers:**
```
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

**Postman Setup:**
- Method: `GET`
- URL: `http://localhost:3000/api/users/1`

**Response (200):**
```json
{
  "success": true,
  "message": "Lấy thông tin user thành công",
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "fullName": "Nguyễn Văn John",
    "studentId": "SV2024001",
    "phone": "0987654321",
    "address": "123 Đường ABC, Quận 1, TP.HCM",
    "role": "user",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

#### PUT /api/users/:id
Cập nhật thông tin user theo ID (Admin only).

**Headers:**
```
Authorization: Bearer <ADMIN_JWT_TOKEN>
Content-Type: application/json
```

**Postman Setup:**
- Method: `PUT`
- URL: `http://localhost:3000/api/users/1`

**Request:**
```json
{
  "fullName": "Nguyễn Văn An Updated",
  "studentId": "SV2024001",
  "phone": "0123456789",
  "address": "456 Đường XYZ, Quận 2, TP.HCM",
  "role": "seller"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Cập nhật thông tin user thành công",
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "fullName": "Nguyễn Văn An Updated",
    "studentId": "SV2024001",
    "phone": "0123456789",
    "address": "456 Đường XYZ, Quận 2, TP.HCM",
    "role": "seller",
    "updatedAt": "2025-01-01T12:00:00.000Z"
  }
}
```

---

#### DELETE /api/users/:id
Xóa user theo ID (Admin only).

**Headers:**
```
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

**Postman Setup:**
- Method: `DELETE`
- URL: `http://localhost:3000/api/users/1`

**Response (200):**
```json
{
  "success": true,
  "message": "Xóa user thành công",
  "data": {
    "deletedUserId": 1,
    "deletedUserInfo": {
      "username": "john_doe",
      "email": "john@example.com",
      "fullName": "Nguyễn Văn John"
    }
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Không thể xóa chính tài khoản của bạn"
}
```

---

## Common Error Responses

### 400 - Validation Error
```json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "errors": ["Tên đầy đủ không được để trống", "Email không hợp lệ"]
}
```

### 401 - Authentication Error
```json
{
  "success": false,
  "message": "Token không được cung cấp"
}
```

### 403 - Authorization Error
```json
{
  "success": false,
  "message": "Không có quyền truy cập. Chỉ admin mới có thể thực hiện thao tác này"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Không tìm thấy người dùng"
}
```

### 409 - Conflict
```json
{
  "success": false,
  "message": "Email đã được sử dụng"
}
```

### 500 - Server Error
```json
{
  "success": false,
  "message": "Lỗi server"
}
```

---

## 📝 Notes

- **JWT Token**: Có thời hạn 7 ngày
- **Password Security**: Được mã hóa bằng bcrypt
- **Optional Fields**: `studentId`, `phone`, `address` là optional khi đăng ký
- **Unique Constraints**: Email và username phải unique
- **Testing**: Sử dụng Postman để test tất cả APIs
- **Role System**: 3 roles - `user`, `seller`, `admin`

---

