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

## Product Management Endpoints

### GET /api/products
Lấy danh sách sản phẩm.
### GET /api/products/featured
Lấy sản phẩm nổi bật.
### GET /api/products/seller/:seller_id
Lấy sản phẩm của seller.
### GET /api/products/:id
Lấy thông tin chi tiết sản phẩm.
### POST /api/products
Tạo sản phẩm mới.
### PUT /api/products/:id
Cập nhật sản phẩm.
### DELETE /api/products/:id
Xóa sản phẩm.


## Endpoints

### 1. GET /api/products
**Lấy danh sách sản phẩm**

**Query Parameters:**
- `page` (number, optional): Trang hiện tại (default: 1)
- `limit` (number, optional): Số sản phẩm mỗi trang (default: 20)
- `category_id` (number, optional): Lọc theo danh mục
- `status` (string, optional): Lọc theo trạng thái (available, out_of_stock, discontinued)
- `search` (string, optional): Tìm kiếm theo tên hoặc mô tả
- `min_price` (number, optional): Giá tối thiểu
- `max_price` (number, optional): Giá tối đa
- `seller_id` (number, optional): Lọc theo seller

**Response:**
```json
{
  "success": true,
  "message": "Lấy danh sách sản phẩm thành công",
  "data": {
    "products": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

### 2. GET /api/products/:id
**Lấy thông tin chi tiết sản phẩm**

**Response:**
```json
{
  "success": true,
  "message": "Lấy thông tin sản phẩm thành công",
  "data": {
    "id": 1,
    "name": "iPhone 15",
    "description": "Điện thoại iPhone 15 mới nhất",
    "price": 25000000,
    "discount_price": 23000000,
    "quantity": 10,
    "image_url": "https://example.com/iphone15.jpg",
    "status": "available",
    "category_name": "Điện thoại",
    "seller_name": "seller1",
    "seller_full_name": "Nguyễn Văn A"
  }
}
```

### 3. POST /api/products (Auth Required - Seller/Admin)
**Tạo sản phẩm mới**

**Request Body:**
```json
{
  "name": "iPhone 15",
  "description": "Điện thoại iPhone 15 mới nhất",
  "price": 25000000,
  "discount_price": 23000000,
  "quantity": 10,
  "image_url": "https://example.com/iphone15.jpg",
  "category_id": 1
}
```

### 4. PUT /api/products/:id (Auth Required - Seller/Admin)
**Cập nhật sản phẩm**

**Request Body:** (tương tự POST, có thêm status)
```json
{
  "name": "iPhone 15 Pro",
  "description": "Điện thoại iPhone 15 Pro",
  "price": 30000000,
  "discount_price": 28000000,
  "quantity": 5,
  "image_url": "https://example.com/iphone15pro.jpg",
  "category_id": 1,
  "status": "available"
}
```

### 5. DELETE /api/products/:id (Auth Required - Seller/Admin)
**Xóa sản phẩm**

**Response:**
```json
{
  "success": true,
  "message": "Xóa sản phẩm thành công",
  "data": null
}
```

### 6. GET /api/products/seller/:seller_id
**Lấy sản phẩm của seller**

**Query Parameters:**
- `page` (number, optional): Trang hiện tại
- `limit` (number, optional): Số sản phẩm mỗi trang
- `status` (string, optional): Lọc theo trạng thái

### 7. GET /api/products/featured
**Lấy sản phẩm nổi bật**

**Query Parameters:**
- `limit` (number, optional): Số lượng sản phẩm (default: 10)

## Test với Postman

### Setup Environment
1. Tạo environment với variable `baseURL` = `http://localhost:3000`
2. Tạo variable `token` để lưu JWT token

### Test Cases

1. **Test GET all products:**
   - Method: GET
   - URL: `{{baseURL}}/api/products`
   - Query: `?page=1&limit=10&status=available`

2. **Test GET product by ID:**
   - Method: GET
   - URL: `{{baseURL}}/api/products/1`

3. **Test CREATE product (cần login trước):**
   - Method: POST
   - URL: `{{baseURL}}/api/products`
   - Headers: `Authorization: Bearer {{token}}`
   - Body (JSON): Xem example ở trên

4. **Test UPDATE product:**
   - Method: PUT
   - URL: `{{baseURL}}/api/products/1`
   - Headers: `Authorization: Bearer {{token}}`
   - Body (JSON): Xem example ở trên

5. **Test DELETE product:**
   - Method: DELETE
   - URL: `{{baseURL}}/api/products/1`
   - Headers: `Authorization: Bearer {{token}}`

6. **Test GET products by seller:**
   - Method: GET
   - URL: `{{baseURL}}/api/products/seller/1`

7. **Test GET featured products:**
   - Method: GET
   - URL: `{{baseURL}}/api/products/featured?limit=5`


## 📝 Notes

- **JWT Token**: Có thời hạn 7 ngày
- **Password Security**: Được mã hóa bằng bcrypt
- **Optional Fields**: `studentId`, `phone`, `address` là optional khi đăng ký
- **Unique Constraints**: Email và username phải unique
- **Testing**: Sử dụng Postman để test tất cả APIs
- **Role System**: 3 roles - `user`, `seller`, `admin`

---

## 📦 Order Management APIs

### 🛍️ Order Endpoints

#### POST /api/orders
**Tạo đơn hàng mới**

**Headers:**
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json


**Request Body (từ giỏ hàng):**
```json
{
  "shipping_address": "123 Đường ABC, Quận 1, TP.HCM",
  "payment_method": "cod",
  "from_cart": true
}
```

**Request Body (trực tiếp):**
```json
{
  "items": [
    {
      "product_id": 1,
      "quantity": 2
    },
    {
      "product_id": 2,
      "quantity": 1
    }
  ],
  "shipping_address": "123 Đường ABC, Quận 1, TP.HCM",
  "payment_method": "banking",
  "from_cart": false
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Tạo đơn hàng thành công",
  "data": {
    "id": 1,
    "user_id": 1,
    "total_amount": 500000,
    "shipping_address": "123 Đường ABC, Quận 1, TP.HCM",
    "payment_method": "cod",
    "status": "pending",
    "items": [...],
    "payment": {...}
  }
}
```

---

#### GET /api/orders
**Lấy danh sách đơn hàng của user**

**Headers:**
Authorization: Bearer <JWT_TOKEN>

**Query Parameters:**
- `page` (number, optional): Trang hiện tại (default: 1)
- `limit` (number, optional): Số đơn hàng mỗi trang (default: 10)
- `status` (string, optional): Lọc theo trạng thái

**Response (200):**
```json
{
  "success": true,
  "message": "Lấy danh sách đơn hàng thành công",
  "data": {
    "orders": [...],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_orders": 50,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

---

#### GET /api/orders/:id
**Lấy chi tiết đơn hàng**

**Headers:**
Authorization: Bearer <JWT_TOKEN>

**Response (200):**
```json
{
  "success": true,
  "message": "Lấy chi tiết đơn hàng thành công",
  "data": {
    "id": 1,
    "user_id": 1,
    "total_amount": 500000,
    "shipping_address": "123 Đường ABC, Quận 1, TP.HCM",
    "payment_method": "cod",
    "status": "pending",
    "created_at": "2025-01-01T00:00:00.000Z",
    "items": [...],
    "payments": [...]
  }
}
```

---

#### PUT /api/orders/:id/status
**Cập nhật trạng thái đơn hàng**

**Headers:**
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json


**Request Body:**
```json
{
  "status": "processing"
}
```

**Valid Statuses:** `pending`, `processing`, `shipped`, `delivered`, `cancelled`

**Response (200):**
```json
{
  "success": true,
  "message": "Cập nhật trạng thái đơn hàng thành công",
  "data": {
    "id": 1,
    "status": "processing",
    "updated_at": "2025-01-01T12:00:00.000Z"
  }
}
```

---

#### DELETE /api/orders/:id
**Hủy đơn hàng**

**Headers:**
Authorization: Bearer <JWT_TOKEN>


**Response (200):**
```json
{
  "success": true,
  "message": "Hủy đơn hàng thành công",
  "data": {
    "id": 1,
    "status": "cancelled"
  }
}
```

---

#### GET /api/orders/:id/items
**Lấy danh sách items trong đơn hàng**

**Headers:**
Authorization: Bearer <JWT_TOKEN>


**Response (200):**
```json
{
  "success": true,
  "message": "Lấy danh sách items thành công",
  "data": [
    {
      "id": 1,
      "order_id": 1,
      "product_id": 1,
      "quantity": 2,
      "price": 250000,
      "product_name": "iPhone 15"
    }
  ]
}
```

---

#### GET /api/orders/stats
**Lấy thống kê đơn hàng**

**Headers:**
Authorization: Bearer <JWT_TOKEN>

**Response (200):**
```json
{
  "success": true,
  "message": "Lấy thống kê đơn hàng thành công",
  "data": [
    {
      "status": "pending",
      "count": 5,
      "total_amount": 1500000
    },
    {
      "status": "completed",
      "count": 10,
      "total_amount": 5000000
    }
  ]
}
```

---

### 👨‍💼 Admin Order APIs

#### GET /api/admin/orders
**Lấy tất cả đơn hàng (Admin only)**

**Headers:**
Authorization: Bearer <ADMIN_JWT_TOKEN>

**Query Parameters:**
- `page` (number, optional): Trang hiện tại (default: 1)
- `limit` (number, optional): Số đơn hàng mỗi trang (default: 20)
- `status` (string, optional): Lọc theo trạng thái
- `user_id` (number, optional): Lọc theo user

---

### 🏪 Seller Order APIs

#### GET /api/seller/orders
**Lấy đơn hàng của seller**

**Headers:**
Authorization: Bearer <SELLER_JWT_TOKEN>

**Query Parameters:**
- `page` (number, optional): Trang hiện tại (default: 1)
- `limit` (number, optional): Số đơn hàng mỗi trang (default: 20)
- `status` (string, optional): Lọc theo trạng thái

---

## 🛒 Shopping Cart APIs

### 🛍️ Cart Endpoints

#### POST /api/cart/add
**Thêm sản phẩm vào giỏ hàng**

**Headers:**
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json


**Request Body:**
```json
{
  "product_id": 1,
  "quantity": 2
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Thêm sản phẩm vào giỏ hàng thành công",
  "data": {
    "id": 1,
    "user_id": 1,
    "product_id": 1,
    "quantity": 2,
    "product_name": "iPhone 15",
    "product_price": 25000000,
    "product_discount_price": 23000000
  }
}
```

---

#### GET /api/cart
**Lấy danh sách sản phẩm trong giỏ hàng**

**Headers:**
Authorization: Bearer <JWT_TOKEN>

**Response (200):**
```json
{
  "success": true,
  "message": "Lấy giỏ hàng thành công",
  "data": {
    "items": [...],
    "summary": {
      "total_items": 5,
      "total_amount": 1150000,
      "item_count": 3
    }
  }
}
```

---

#### PUT /api/cart/update/:id
**Cập nhật số lượng sản phẩm trong giỏ**

**Headers:**
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

**Request Body:**
```json
{
  "quantity": 3
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Cập nhật số lượng thành công",
  "data": {
    "id": 1,
    "quantity": 3,
    "updated_at": "2025-01-01T12:00:00.000Z"
  }
}
```

---

#### DELETE /api/cart/remove/:id
**Xóa sản phẩm khỏi giỏ hàng**

**Headers:**

Authorization: Bearer <JWT_TOKEN>

**Response (200):**
```json
{
  "success": true,
  "message": "Xóa sản phẩm khỏi giỏ hàng thành công",
  "data": {
    "removed_item_id": 1
  }
}
```

---

#### DELETE /api/cart/clear
**Xóa toàn bộ giỏ hàng**

**Headers:**
Authorization: Bearer <JWT_TOKEN>

**Response (200):**
```json
{
  "success": true,
  "message": "Đã xóa 3 sản phẩm khỏi giỏ hàng",
  "data": {
    "removed_items": 3
  }
}
```

---

#### GET /api/cart/validate
**Kiểm tra tính khả dụng của giỏ hàng**

**Headers:**
Authorization: Bearer <JWT_TOKEN>
**Response (200):**
```json
{
  "success": true,
  "message": "Kiểm tra giỏ hàng thành công",
  "data": {
    "valid_items": [...],
    "invalid_items": [...],
    "is_valid": true,
    "summary": {
      "total_items": 3,
      "valid_count": 3,
      "invalid_count": 0
    }
  }
}
```

---

#### GET /api/cart/count
**Lấy số lượng items trong giỏ hàng**

**Headers:**
Authorization: Bearer <JWT_TOKEN>

**Response (200):**
```json
{
  "success": true,
  "message": "Lấy số lượng items thành công",
  "data": {
    "total_items": 5,
    "unique_products": 3
  }
}
```

---

#### GET /api/cart/total
**Lấy tổng tiền giỏ hàng**

**Headers:**
Authorization: Bearer <JWT_TOKEN>

**Response (200):**
```json
{
  "success": true,
  "message": "Lấy tổng tiền giỏ hàng thành công",
  "data": {
    "total_amount": 1150000,
    "currency": "VND"
  }
}
```

---

