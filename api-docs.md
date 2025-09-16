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

#### 1. POST /api/orders
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

#### 2. GET /api/orders
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

#### 3. GET /api/orders/:id
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

#### 4. PUT /api/orders/:id/status
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

#### 5. DELETE /api/orders/:id
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

#### 6. GET /api/orders/:id/items
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

#### 7. GET /api/orders/stats
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

#### 1. GET /api/admin/orders
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

#### 2. GET /api/seller/orders
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

#### 1. POST /api/cart/add
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

#### 2. GET /api/cart
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

#### 3. PUT /api/cart/update/:id
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

#### 4. DELETE /api/cart/remove/:id
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

#### 5. DELETE /api/cart/clear
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

#### 6. GET /api/cart/validate
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

#### 7. GET /api/cart/count
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

#### 8. GET /api/cart/total
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

## 💳 Payment Management APIs

###  **IMPORTANT NOTE - FLOW HOẠT ĐỘNG**

**Từ phiên bản mới:** Order và Payment đã được tách riêng để tránh duplicate!

**Flow chính xác:**
1. **Tạo Order** → Không tự động tạo Payment
2. **Tạo Payment** → Cho order cụ thể
3. **Cập nhật Payment Status** → Auto cập nhật Order Status

---

### 💰 Payment Endpoints

#### 1. POST /api/payments
**Tạo payment cho đơn hàng**

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "order_id": 6,
  "payment_method": "credit_card",
  "transaction_id": "TXN_CC_123456"
}
```

**Supported Payment Methods:**
- `cod` - Cash on Delivery (không cần transaction_id)
- `credit_card` - Credit Card
- `debit_card` - Debit Card  
- `momo` - MoMo Wallet
- `zalopay` - ZaloPay
- `vnpay` - VNPay
- `bank_transfer` - Bank Transfer
- `paypal` - PayPal
- `stripe` - Stripe

**Response (201):**
```json
{
  "success": true,
  "message": "Tạo payment thành công",
  "data": {
    "id": 1,
    "order_id": 6,
    "payment_method": "credit_card",
    "payment_status": "pending",
    "transaction_id": "TXN_CC_123456",
    "amount": "150000.00",
    "created_at": "2025-01-15T10:30:00.000Z"
  }
}
```

**Postman Setup:**
- Method: `POST`
- URL: `https://api.unimerch.space/api/payments`
- Headers: `Authorization: Bearer {{token}}`
- Body: Raw JSON (see above)

---

#### 2. GET /api/payments/:orderId
**Lấy tất cả payments của một đơn hàng**

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Lấy thông tin payments thành công",
  "data": [
    {
      "id": 1,
      "order_id": 6,
      "payment_method": "credit_card",
      "payment_status": "completed",
      "transaction_id": "TXN_CC_123456_CONFIRMED",
      "amount": "150000.00",
      "created_at": "2025-01-15T10:30:00.000Z",
      "updated_at": "2025-01-15T11:00:00.000Z"
    }
  ]
}
```

**Postman Setup:**
- Method: `GET`
- URL: `https://api.unimerch.space/api/payments/6`

---

#### 3. GET /api/payments/detail/:id
**Lấy chi tiết payment theo ID**

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Lấy thông tin payment thành công",
  "data": {
    "id": 1,
    "order_id": 6,
    "payment_method": "credit_card",
    "payment_status": "completed",
    "transaction_id": "TXN_CC_123456_CONFIRMED",
    "amount": "150000.00",
    "user_id": 7,
    "order_total": "150000.00"
  }
}
```

**Postman Setup:**
- Method: `GET`
- URL: `https://api.unimerch.space/api/payments/detail/1`

---

#### 4. PUT /api/payments/:id/status
**Cập nhật trạng thái payment**

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "completed",
  "transaction_id": "TXN_CC_123456_CONFIRMED"
}
```

**Valid Status Transitions:**
- `pending` → `completed` | `failed`
- `failed` → `pending` (retry allowed)
- `completed` → `refunded` (admin only)
- `refunded` → **Final State**

**Auto Order Status Updates:**
- Payment `completed` → Order status: `processing`
- Payment `refunded` → Order status: `cancelled`

**Response (200):**
```json
{
  "success": true,
  "message": "Cập nhật trạng thái payment thành công",
  "data": {
    "id": 1,
    "payment_status": "completed",
    "transaction_id": "TXN_CC_123456_CONFIRMED",
    "updated_at": "2025-01-15T11:00:00.000Z"
  }
}
```

**Postman Setup:**
- Method: `PUT`
- URL: `https://api.unimerch.space/api/payments/1/status`

---

#### 5. GET /api/payments/user
**Lấy tất cả payments của user hiện tại**

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters:**
- `page` (number, optional): Trang hiện tại (default: 1)
- `limit` (number, optional): Số payments mỗi trang (default: 10)
- `status` (string, optional): Lọc theo trạng thái

**Response (200):**
```json
{
  "success": true,
  "message": "Lấy danh sách payments thành công",
  "data": {
    "payments": [...],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_payments": 25,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

**Postman Setup:**
- Method: `GET`
- URL: `https://api.unimerch.space/api/payments/user?page=1&limit=10&status=completed`

---

### 👨‍💼 Admin Payment APIs

#### 6. GET /api/admin/payments
**Lấy tất cả payments (Admin only)**

**Headers:**
```
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

**Query Parameters:**
- `page` (number, optional): Trang hiện tại (default: 1)
- `limit` (number, optional): Số payments mỗi trang (default: 20)
- `status` (string, optional): Lọc theo trạng thái
- `start_date` (string, optional): Lọc từ ngày (YYYY-MM-DD)
- `end_date` (string, optional): Lọc đến ngày (YYYY-MM-DD)

**Response (200):**
```json
{
  "success": true,
  "message": "Lấy danh sách tất cả payments thành công",
  "data": {
    "payments": [
      {
        "id": 1,
        "order_id": 6,
        "payment_method": "credit_card",
        "payment_status": "completed",
        "amount": "150000.00",
        "username": "john_doe",
        "email": "john@example.com"
      }
    ],
    "pagination": {...}
  }
}
```

**Postman Setup:**
- Method: `GET`
- URL: `https://api.unimerch.space/api/admin/payments?page=1&status=completed&start_date=2025-01-01`

---

#### 7. GET /api/payments/stats
**Thống kê payments (Admin only)**

**Headers:**
```
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

**Query Parameters:**
- `start_date` (string, optional): Từ ngày (YYYY-MM-DD)
- `end_date` (string, optional): Đến ngày (YYYY-MM-DD)

**Response (200):**
```json
{
  "success": true,
  "message": "Lấy thống kê payments thành công",
  "data": [
    {
      "payment_status": "completed",
      "payment_method": "credit_card",
      "count": 15,
      "total_amount": "2250000.00"
    },
    {
      "payment_status": "pending",
      "payment_method": "momo",
      "count": 5,
      "total_amount": "750000.00"
    }
  ]
}
```

**Postman Setup:**
- Method: `GET`
- URL: `https://api.unimerch.space/api/payments/stats?start_date=2025-01-01&end_date=2025-01-31`

---

#### 8. GET /api/payments/revenue
**Lấy doanh thu theo thời gian (Admin only)**

**Headers:**
```
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

**Query Parameters:**
- `period` (string, optional): Chu kỳ thời gian - `hour`, `day`, `week`, `month`, `year` (default: day)
- `limit` (number, optional): Số chu kỳ (default: 30)

**Response (200):**
```json
{
  "success": true,
  "message": "Lấy doanh thu thành công",
  "data": {
    "period": "day",
    "data": [
      {
        "period": "2025-01-15",
        "transaction_count": 10,
        "total_revenue": "1500000.00",
        "successful_count": 8,
        "successful_revenue": "1200000.00"
      }
    ],
    "summary": {
      "total_periods": 30,
      "total_revenue": 45000000,
      "total_transactions": 150
    }
  }
}
```

**Postman Setup:**
- Method: `GET`
- URL: `https://api.unimerch.space/api/payments/revenue?period=day&limit=7`

---

#### 9. POST /api/payments/:id/refund
**Hoàn tiền payment (Admin only)**

**Headers:**
```
Authorization: Bearer <ADMIN_JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "reason": "Khách hàng yêu cầu hoàn tiền do sản phẩm lỗi"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Hoàn tiền thành công",
  "data": {
    "id": 1,
    "payment_status": "refunded",
    "refund_reason": "Khách hàng yêu cầu hoàn tiền do sản phẩm lỗi",
    "updated_at": "2025-01-15T15:00:00.000Z"
  }
}
```

**Note:** Khi hoàn tiền, order status sẽ tự động chuyển thành `cancelled`.

**Postman Setup:**
- Method: `POST`
- URL: `https://api.unimerch.space/api/payments/1/refund`

---

## 🧪 Testing Payment Flow với Postman

### **Setup Collection & Environment**

1. **Create Collection:** "Payment APIs"
2. **Environment Variables:**
   ```json
   {
     "base_url": "https://api.unimerch.space",
     "token": "{{YOUR_JWT_TOKEN}}",
     "admin_token": "{{ADMIN_JWT_TOKEN}}",
     "order_id": "{{ORDER_ID}}",
     "payment_id": "{{PAYMENT_ID}}"
   }
   ```

### **Complete Test Scenarios**

#### **Scenario 1: COD Payment Flow**
```json
// 1. Tạo Order trước
POST {{base_url}}/api/orders
{
  "shipping_address": "123 Test Street",
  "payment_method": "cod",
  "from_cart": true
}

// 2. Tạo COD Payment
POST {{base_url}}/api/payments
{
  "order_id": {{order_id}},
  "payment_method": "cod"
}
// Note: Không cần transaction_id cho COD

// 3. Hoàn thành COD khi giao hàng
PUT {{base_url}}/api/payments/{{payment_id}}/status
{
  "status": "completed"
}
```

#### **Scenario 2: Online Payment Flow**
```json
// 1. Tạo Credit Card Payment
POST {{base_url}}/api/payments
{
  "order_id": {{order_id}},
  "payment_method": "credit_card",
  "transaction_id": "CC_TXN_123456"
}

// 2. Mô phỏng payment gateway confirmation
PUT {{base_url}}/api/payments/{{payment_id}}/status
{
  "status": "completed",
  "transaction_id": "CC_TXN_123456_CONFIRMED"
}
```

#### **Scenario 3: Failed Payment Retry**
```json
// 1. Cập nhật thành failed
PUT {{base_url}}/api/payments/{{payment_id}}/status
{
  "status": "failed"
}

// 2. Retry payment
PUT {{base_url}}/api/payments/{{payment_id}}/status
{
  "status": "pending"
}

// 3. Thử lại với transaction mới
PUT {{base_url}}/api/payments/{{payment_id}}/status
{
  "status": "completed",
  "transaction_id": "RETRY_TXN_789012"
}
```

#### **Scenario 4: Admin Refund**
```json
// Admin hoàn tiền
POST {{base_url}}/api/payments/{{payment_id}}/refund
Authorization: Bearer {{admin_token}}
{
  "reason": "Sản phẩm bị lỗi - hoàn tiền theo yêu cầu"
}
```

### **Error Testing Scenarios**

#### **❌ Test Invalid Payment Method**
```json
POST {{base_url}}/api/payments
{
  "order_id": {{order_id}},
  "payment_method": "bitcoin"  // Không hỗ trợ
}
// Expected: 400 - Phương thức thanh toán không hỗ trợ
```

#### **❌ Test Missing Transaction ID**
```json
POST {{base_url}}/api/payments
{
  "order_id": {{order_id}},
  "payment_method": "credit_card"  // Thiếu transaction_id
}
// Expected: 400 - Transaction ID là bắt buộc
```

#### **❌ Test Invalid Status Transition**
```json
PUT {{base_url}}/api/payments/{{payment_id}}/status
{
  "status": "pending"  // Từ completed → pending (không hợp lệ)
}
// Expected: 400 - Không thể chuyển từ 'completed' sang 'pending'
```

#### **❌ Test Duplicate Payment**
```json
// Tạo payment thứ 2 cho order đã có payment completed
POST {{base_url}}/api/payments
{
  "order_id": {{order_id}},
  "payment_method": "momo",
  "transaction_id": "MOMO_DUPLICATE"
}
// Expected: 400 - Đơn hàng đã được thanh toán thành công
```

### **Validation Rules Summary**

| Rule | Description |
|------|-------------|
| Payment Methods | 9 methods supported, normalized to lowercase |
| Transaction ID | Required for all non-COD methods |
| Order Status | Only `pending` or `processing` orders can create payments |
| Status Transitions | Strict validation: pending→completed/failed, failed→pending, completed→refunded |
| Duplicate Prevention | One successful payment per order |
| Auto Order Updates | Payment status changes trigger order status updates |
| Admin Permissions | Only admin can refund payments |

### **Quick Testing Checklist**
- [ ] ✅ Login and get JWT token
- [ ] ✅ Create order (verify no auto payment)
- [ ] ✅ Test all 9 payment methods
- [ ] ✅ Test COD flow (no transaction_id needed)
- [ ] ✅ Test online payment flow (transaction_id required)
- [ ] ✅ Test status transitions
- [ ] ✅ Test failed payment retry
- [ ] ✅ Test admin refund
- [ ] ✅ Test duplicate payment prevention
- [ ] ✅ Test order status auto-updates
- [ ] ✅ Test error scenarios
- [ ] ✅ Test pagination in listing APIs
- [ ] ✅ Test admin statistics & revenue APIs

**🎉 Payment API hoàn chỉnh và ready for production!**

---
