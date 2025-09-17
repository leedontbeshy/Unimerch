# 🛒 UniMerch API

*[English](#english) | [Tiếng Việt](#tiếng-việt)*

---

## English

### 🌟 Overview

**UniMerch API** is a comprehensive e-commerce backend platform specifically designed for university merchandise trading. Built with pure Node.js (no frameworks like Express), this API provides a robust, scalable foundation for online marketplace applications targeting university students and communities.

🌐 **Live API:** https://api.unimerch.space

### ✨ Key Features

#### 🔐 **Authentication & Authorization**
- JWT-based authentication with token blacklisting
- Role-based access control (User, Seller, Admin)
- Secure password reset with email verification
- Session management and logout functionality

#### 👥 **User Management**
- User registration and profile management
- Student ID verification system
- Role-based permissions and access levels
- Admin user management capabilities

#### 🛍️ **Product Catalog**
- Comprehensive product management
- Category-based organization
- Multi-seller support with seller profiles
- Product search and filtering
- Inventory management with stock tracking
- Featured products showcase

#### 🛒 **Shopping Cart**
- Real-time cart management
- Cart validation and inventory checking
- Persistent cart across sessions
- Cart summary and calculations

#### 📦 **Order Processing**
- Multi-step order workflow
- Order tracking and status management
- Order history and analytics
- Admin and seller order management
- Order cancellation and refund support

#### 💳 **Payment System**
- Multiple payment methods support (COD, Credit/Debit Cards, E-wallets)
- Payment status tracking
- Revenue analytics and reporting
- Refund processing system

#### 📊 **Analytics & Reporting**
- Sales analytics and revenue tracking
- Order statistics and trends
- Payment method analysis
- User behavior insights

### 🛠️ Technology Stack

#### **Core Technologies**
- **Backend:** Pure Node.js (No Express.js framework)
- **Database:** PostgreSQL with Supabase hosting
- **Authentication:** JSON Web Tokens (JWT)
- **Password Security:** bcryptjs hashing
- **Email Service:** Resend API integration

#### **Architecture Highlights**
- **Custom HTTP Server:** Built from scratch using Node.js core modules
- **Custom Router:** Handcrafted routing system without external dependencies
- **Middleware System:** Custom middleware pipeline for authentication, validation, and error handling
- **Response Helpers:** Standardized API response formatting

#### **Database Design**
- **Tables:** 10+ normalized tables with proper relationships
- **Indexing:** Optimized database indexes for performance
- **Triggers:** Automatic timestamp updates and data consistency
- **Security:** Prepared statements preventing SQL injection

### 🚀 Quick Setup

#### **1. Clone Repository**
```bash
git clone https://github.com/leedontbeshy/Unimerch.git
cd WebDevFinal
```

#### **2. Install Dependencies**
```bash
npm install
```

#### **3. Environment Configuration**
Create `.env` file in root directory:
```env
# Database Configuration (PostgreSQL/Supabase)
DB_HOST=db.xxx.supabase.co
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_NAME=postgres
DB_PORT=5432

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3000
NODE_ENV=development

# Email Service (Optional - for password reset)
RESEND_API_KEY=your_resend_api_key_here
```

#### **4. Database Setup**
```bash
# Test database connection
node -e "require('./config/database').testConnection()"
```

#### **5. Start Development Server**
```bash
npm start
# or
npm run dev
```

### 📚 API Documentation

Comprehensive API documentation is available at: **[API Documentation](api-docs.md)**

**Quick API Overview:**
- **Authentication:** `/api/auth/*` - Registration, login, logout, password reset
- **Users:** `/api/users/*` - Profile management, admin user operations
- **Products:** `/api/products/*` - Product catalog, CRUD operations
- **Cart:** `/api/cart/*` - Shopping cart management
- **Orders:** `/api/orders/*` - Order creation, tracking, management
- **Payments:** `/api/payments/*` - Payment processing, refunds
- **Admin:** `/api/admin/*` - Admin-only operations
- **Seller:** `/api/seller/*` - Seller-specific operations

### 🧪 Testing

#### **Postman Testing**
1. Import API collection from `api-docs.md`
2. Set environment variables:
   ```
   baseURL: http://localhost:3000
   token: (JWT token after login)
   adminToken: (Admin JWT token)
   ```
3. Run authentication flow first
4. Test all endpoints systematically

#### **Test Sequence:**
```
Authentication → User Profile → Products → Cart → Orders → Payments
```

### 📁 Project Structure

```
WebDevFinal/
├── 📂 src/
│   ├── 📂 core/              # Core system components
│   │   ├── server.js         # Custom HTTP server
│   │   ├── router.js         # Custom routing system
│   │   ├── request.js        # Request handling
│   │   ├── response.js       # Response formatting
│   │   └── middleware.js     # Middleware pipeline
│   ├── 📂 controllers/       # API endpoint handlers
│   ├── 📂 models/           # Database models
│   ├── 📂 middleware/       # Custom middleware functions
│   └── 📂 utils/            # Utility functions
├── 📂 config/               # Configuration files
├── 📂 test/                # Test files
├── 📄 db.txt               # Database schema
├── 📄 api-docs.md          # API documentation
└── 📄 server.js            # Application entry point
```

### 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Follow Node.js pure architecture patterns
4. Add comprehensive tests
5. Update documentation
6. Submit pull request


### 🔗 Links

- **Live API:** https://api.unimerch.space
- **Documentation:** [API Docs](api-docs.md)
- **Frontend Repository:** [Contact for access]

---

## Tiếng Việt

### 🌟 Tổng Quan

**UniMerch API** là một nền tảng backend thương mại điện tử toàn diện được thiết kế đặc biệt cho việc mua bán đồ dùng sinh viên trong các trường đại học. Được xây dựng bằng Node.js thuần (không sử dụng framework như Express), API này cung cấp một nền tảng mạnh mẽ, có thể mở rộng cho các ứng dụng thương mại điện tử nhắm đến sinh viên và cộng đồng đại học.

🌐 **API Trực Tuyến:** https://api.unimerch.space

### ✨ Tính Năng Chính

#### 🔐 **Xác Thực & Phân Quyền**
- Xác thực dựa trên JWT với blacklist token
- Kiểm soát truy cập theo vai trò (User, Seller, Admin)
- Reset mật khẩu an toàn với xác minh email
- Quản lý phiên đăng nhập và đăng xuất

#### 👥 **Quản Lý Người Dùng**
- Đăng ký và quản lý hồ sơ người dùng
- Hệ thống xác minh mã số sinh viên
- Phân quyền theo vai trò và cấp độ truy cập
- Khả năng quản lý người dùng cho Admin

#### 🛍️ **Danh Mục Sản Phẩm**
- Quản lý sản phẩm toàn diện
- Tổ chức theo danh mục
- Hỗ trợ đa người bán với hồ sơ seller
- Tìm kiếm và lọc sản phẩm
- Quản lý tồn kho với theo dõi số lượng
- Showcase sản phẩm nổi bật

#### 🛒 **Giỏ Hàng**
- Quản lý giỏ hàng thời gian thực
- Xác thực giỏ hàng và kiểm tra tồn kho
- Giỏ hàng liên tục qua các phiên
- Tóm tắt và tính toán giỏ hàng

#### 📦 **Xử Lý Đơn Hàng**
- Quy trình đơn hàng nhiều bước
- Theo dõi đơn hàng và quản lý trạng thái
- Lịch sử đơn hàng và phân tích
- Quản lý đơn hàng cho Admin và Seller
- Hỗ trợ hủy đơn và hoàn tiền

#### 💳 **Hệ Thống Thanh Toán**
- Hỗ trợ nhiều phương thức thanh toán (COD, Thẻ tín dụng/ghi nợ, Ví điện tử)
- Theo dõi trạng thái thanh toán
- Phân tích doanh thu và báo cáo
- Hệ thống xử lý hoàn tiền

#### 📊 **Phân Tích & Báo Cáo**
- Phân tích bán hàng và theo dõi doanh thu
- Thống kê đơn hàng và xu hướng
- Phân tích phương thức thanh toán
- Thông tin chi tiết về hành vi người dùng

### 🛠️ Công Nghệ Sử Dụng

#### **Công Nghệ Cốt Lõi**
- **Backend:** Node.js thuần (Không sử dụng framework Express.js)
- **Cơ Sở Dữ Liệu:** PostgreSQL với hosting Supabase
- **Xác Thực:** JSON Web Tokens (JWT)
- **Bảo Mật Mật Khẩu:** Mã hóa bcryptjs
- **Dịch Vụ Email:** Tích hợp Resend API

#### **Điểm Nổi Bật Kiến Trúc**
- **HTTP Server Tùy Chỉnh:** Xây dựng từ đầu bằng các module core Node.js
- **Router Tùy Chỉnh:** Hệ thống định tuyến thủ công không phụ thuộc bên ngoài
- **Hệ Thống Middleware:** Pipeline middleware tùy chỉnh cho xác thực, validation và xử lý lỗi
- **Response Helpers:** Chuẩn hóa định dạng phản hồi API

#### **Thiết Kế Cơ Sở Dữ Liệu**
- **Bảng:** 10+ bảng được chuẩn hóa với mối quan hệ phù hợp
- **Chỉ Mục:** Tối ưu hóa chỉ mục cơ sở dữ liệu để hiệu suất
- **Triggers:** Tự động cập nhật timestamp và tính nhất quán dữ liệu
- **Bảo Mật:** Prepared statements ngăn chặn SQL injection

### 🚀 Cài Đặt Nhanh

#### **1. Clone Repository**
```bash
git clone https://github.com/leedontbeshy/Unimerch.git
cd WebDevFinal
```

#### **2. Cài Đặt Dependencies**
```bash
npm install
```

#### **3. Cấu Hình Environment**
Tạo file `.env` trong thư mục gốc:
```env
# Cấu hình Database (PostgreSQL/Supabase)
DB_HOST=db.xxx.supabase.co
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_NAME=postgres
DB_PORT=5432

# Cấu hình JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Cấu hình Server
PORT=3000
NODE_ENV=development

# Dịch vụ Email (Tùy chọn - cho reset password)
RESEND_API_KEY=your_resend_api_key_here
```

#### **4. Thiết Lập Database**
```bash
# Test kết nối database
node -e "require('./config/database').testConnection()"
```

#### **5. Khởi Động Development Server**
```bash
npm start
# hoặc
npm run dev
```

### 📚 Tài Liệu API

Tài liệu API toàn diện có sẵn tại: **[Tài Liệu API](api-docs.md)**

**Tổng Quan API Nhanh:**
- **Xác thực:** `/api/auth/*` - Đăng ký, đăng nhập, đăng xuất, reset password
- **Người dùng:** `/api/users/*` - Quản lý hồ sơ, thao tác admin
- **Sản phẩm:** `/api/products/*` - Danh mục sản phẩm, thao tác CRUD
- **Giỏ hàng:** `/api/cart/*` - Quản lý giỏ hàng
- **Đơn hàng:** `/api/orders/*` - Tạo đơn, theo dõi, quản lý
- **Thanh toán:** `/api/payments/*` - Xử lý thanh toán, hoàn tiền
- **Admin:** `/api/admin/*` - Thao tác chỉ dành cho admin
- **Seller:** `/api/seller/*` - Thao tác đặc thù cho seller

### 🧪 Testing

#### **Testing với Postman**
1. Import API collection từ `api-docs.md`
2. Thiết lập biến môi trường:
   ```
   baseURL: http://localhost:3000
   token: (JWT token sau khi đăng nhập)
   adminToken: (Admin JWT token)
   ```
3. Chạy authentication flow trước
4. Test tất cả endpoint một cách có hệ thống

#### **Trình Tự Test:**
```
Authentication → User Profile → Products → Cart → Orders → Payments
```

### 📁 Cấu Trúc Project

```
WebDevFinal/
├── 📂 src/
│   ├── 📂 core/              # Thành phần hệ thống cốt lõi
│   │   ├── server.js         # HTTP server tùy chỉnh
│   │   ├── router.js         # Hệ thống routing tùy chỉnh
│   │   ├── request.js        # Xử lý request
│   │   ├── response.js       # Định dạng response
│   │   └── middleware.js     # Pipeline middleware
│   ├── 📂 controllers/       # Xử lý API endpoint
│   ├── 📂 models/           # Database models
│   ├── 📂 middleware/       # Hàm middleware tùy chỉnh
│   └── 📂 utils/            # Hàm tiện ích
├── 📂 config/               # File cấu hình
├── 📂 test/                # File test
├── 📄 db.txt               # Schema database
├── 📄 api-docs.md          # Tài liệu API
└── 📄 server.js            # Entry point ứng dụng
```

### 🤝 Đóng Góp

1. Fork repository
2. Tạo feature branch: `git checkout -b feature/new-feature`
3. Tuân theo các pattern kiến trúc Node.js thuần
4. Thêm các test toàn diện
5. Cập nhật tài liệu
6. Submit pull request


### 🔗 Liên Kết

- **API Trực Tuyến:** https://api.unimerch.space
- **Tài Liệu:** [API Docs](api-docs.md)
- **Frontend Repository:** [Liên hệ để truy cập]

---

## 🚀 Getting Started / Bắt Đầu Sử Dụng

### Prerequisites / Yêu Cầu Hệ Thống
- Node.js 16.x or higher
- PostgreSQL database (or Supabase account)
- npm or yarn package manager

### Installation / Cài Đặt
```bash
# Clone the repository
git clone https://github.com/leedontbeshy/Unimerch.git
cd WebDevFinal

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Test database connection
npm run test:db

# Start development server
npm run dev
```

### API Testing with Postman / Test API với Postman

1. **Import Collection** / **Import Collection**
   - Import the API collection from `api-docs.md`
   - Set up environment variables

2. **Authentication Flow** / **Luồng Xác Thực**
   ```
   POST /api/auth/register
   POST /api/auth/login (save token)
   ```

3. **Test Core Features** / **Test Tính Năng Cốt Lõi**
   ```
   GET /api/products
   POST /api/cart/add
   POST /api/orders
   POST /api/payments
   ```

4. **Admin Operations** / **Thao Tác Admin**
   ```
   GET /api/admin/users
   GET /api/admin/orders
   GET /api/payments/stats
   ```

### Support / Hỗ Trợ
- 📧 Email: [Your Email]
- 📖 Documentation: [api-docs.md](api-docs.md)
- 🌐 Live API: https://api.unimerch.space

---

*Made with ❤️*
