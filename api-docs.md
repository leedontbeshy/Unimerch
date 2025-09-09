
# UniMerch API Documentation

## Authentication Endpoints

### POST /api/auth/register
Đăng ký tài khoản người dùng mới.

#### Request Body
```json
{
  "username": "string (required, 3-50 chars, alphanumeric + underscore)",
  "email": "string (required, valid email format)",
  "password": "string (required, min 6 chars, must contain lowercase, uppercase, number)",
  "fullName": "string (required, 2-100 chars)",
  "studentId": "string (optional, max 20 chars)",
  "phone": "string (optional, Vietnamese phone number format)",
  "address": "string (optional, max 500 chars)"
}
```

#### Example Request
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

#### Success Response (201 Created)
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
      "address": "123 Đường ABC, Quận 1, TP.HCM"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Error Responses

**400 Bad Request - Validation Error**
```json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "errors": [
    {
      "type": "field",
      "msg": "Email không hợp lệ",
      "path": "email",
      "location": "body"
    }
  ]
}
```

**409 Conflict - Duplicate Entry**
```json
{
  "success": false,
  "message": "Email đã được sử dụng"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "message": "Lỗi server"
}
```

#### Validation Rules
- **username**: 3-50 ký tự, chỉ chứa chữ cái, số và dấu gạch dưới
- **email**: Định dạng email hợp lệ
- **password**: Tối thiểu 6 ký tự, phải chứa ít nhất 1 chữ thường, 1 chữ hoa và 1 số
- **fullName**: 2-100 ký tự
- **studentId**: Tùy chọn, tối đa 20 ký tự
- **phone**: Tùy chọn, định dạng số điện thoại Việt Nam
- **address**: Tùy chọn, tối đa 500 ký tự

#### Notes
- Token JWT có thời hạn 7 ngày (có thể cấu hình qua biến môi trường)
- Mật khẩu được mã hóa bằng bcrypt với salt rounds = 12
- Email và username phải unique trong hệ thống
- Các trường studentId, phone, address là tùy chọn


