# 🛒 UniMerch API

*[English](#english) | [Tiếng Việt](#tiếng-việt)*

---

## English

### 🌟 Overview

**UniMerch API** is a comprehensive e-commerce backend platform specifically designed for university merchandise trading. Built with pure Node.js, this API provides a robust, scalable foundation for online marketplace applications targeting university students and communities.

🌐 **Live API:** https://api.unimerch.space

📮 **Postman Collection:** [Import Collection](https://www.postman.com/leduyphuc-8968207/unimerch/collection/43636674-82906095-a87a-458d-887f-0dafb7096684)

### ✨ Key Features

#### 🔐 **Authentication & Authorization**
- JWT-based authentication with token blacklisting
- Role-based access control (User, Seller, Admin)
- Secure password reset with email verification
- Session management and logout functionality

#### 👥 **User Management**
- User registration and profile management
- Role-based permissions and access levels
- Admin user management capabilities

#### 🛍️ **Product Catalog**
- Comprehensive product management
- Category-based organization
- Multi-seller support with seller profiles
- Advanced search system with filters and autocomplete
- Real-time product search across multiple criteria
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

#### � **Order Confirmation**
- Simple order confirmation flow
- Order status tracking
- Email notifications for order updates
- Order cancellation system

#### 🔍 **Advanced Search System**
- Global search across products, categories, users, orders, and reviews
- Intelligent autocomplete and suggestions
- Multi-criteria filtering and sorting
- Search history and analytics
- Real-time search results with pagination
- Category-specific search optimization

#### 📊 **Analytics & Reporting**
- Sales analytics and revenue tracking
- Order statistics and trends
- Payment method analysis
- User behavior insights

#### ⭐ **Review System**
- Product reviews and ratings
- Review validation for verified purchases
- Rating analytics and statistics
- Top-rated products showcase

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
- **Search:** `/api/search/*` - Advanced search, filters, autocomplete
- **Cart:** `/api/cart/*` - Shopping cart management
- **Orders:** `/api/orders/*` - Order creation, confirmation, tracking, management
- **Reviews:** `/api/reviews/*` - Product reviews and ratings
- **Admin:** `/api/admin/*` - Admin-only operations
- **Seller:** `/api/seller/*` - Seller-specific operations

### 🧪 Testing with Postman

#### **Import Collection**
1. **Quick Import:** Click the button below to import directly to Postman
   
   [![Run in Postman](https://run.pstmn.io/button.svg)](https://www.postman.com/leduyphuc-8968207/unimerch/collection/43636674-82906095-a87a-458d-887f-0dafb7096684)

2. **Manual Import:** 
   - Open Postman
   - Click "Import" button
   - Paste the collection link or use the JSON file
   - Collection Link: `https://www.postman.com/leduyphuc-8968207/unimerch/collection/43636674-82906095-a87a-458d-887f-0dafb7096684`

#### **Setup Environment Variables**
Create a new environment in Postman with these variables:
```
unimerch: https://api.unimerch.space
token_test_16_09: (Will be set after login)
user_token_16_09: (Will be set after user login)
bao_token: (Will be set after specific user login)
```

#### **Test Sequence**
Follow this order for systematic testing:

1. **Authentication Flow**
   ```
   POST /api/auth/register → Create account
   POST /api/auth/login → Get JWT token (save to environment)
   GET /api/users/profile → Verify authentication
   ```

2. **Product Management**
   ```
   GET /api/products → Browse products
   GET /api/products/1 → View product details
   GET /api/products/featured → Get featured products
   POST /api/products → Create product (admin/seller)
   ```

3. **Shopping Cart**
   ```
   POST /api/cart/add → Add items to cart
   GET /api/cart → View cart
   PUT /api/cart/update/:id → Update quantity
   GET /api/cart/validate → Validate cart before checkout
   ```

4. **Order Processing**
   ```
   POST /api/orders → Create order from cart
   GET /api/orders → View user orders
   GET /api/orders/:id → View order details
   PUT /api/orders/:id/status → Update order status
   ```

5. **Order Confirmation**
   ```
   POST /api/orders/confirm → Confirm order
   GET /api/orders/:id/status → Check order status
   PUT /api/orders/:id/cancel → Cancel order
   ```

6. **Reviews & Ratings**
   ```
   POST /api/reviews → Create review
   GET /api/reviews/product/:id → Get product reviews
   GET /api/reviews/product/:id/stats → Get rating statistics
   PUT /api/reviews/:id → Update review
   ```

#### **Available Collections**

The Postman collection includes:

- **Auth APIs** (6 endpoints)
  - Register, Login, Logout
  - Password Reset & Recovery
  
- **User Management APIs** (4 endpoints)
  - Profile management
  - Password change
  - Admin user operations

- **Product APIs** (8 endpoints)
  - CRUD operations
  - Search and filters
  - Featured products

- **Category APIs** (2 endpoints)
  - Category management
  - Category updates

- **Cart APIs** (7 endpoints)
  - Cart management
  - Item operations
  - Cart validation

- **Order APIs** (12 endpoints)
  - Order creation (cart & direct)
  - Order confirmation
  - Order tracking
  - Status management
  - Order cancellation
  - Admin & seller views

- **Review APIs** (11 endpoints)
  - Review CRUD operations
  - Rating statistics
  - Top products
  - User reviews

### 📁 Project Structure

```
WebDevFinal/
├── 📄 server.js                    # Main entry point
├── 📄 package.json                 # Dependencies & scripts
├── 📄 README.md                    # Project documentation
├── 📄 api-docs.md                  # Detailed API documentation
├── 📄 db.txt                       # Database schema
│
├── 📂 config/                      # System configuration
│   ├── config.js                   # General config
│   └── database.js                 # Database config
│
├── 📂 src/                         # Main source code
│   ├── 📄 app.js                   # Application setup
│   │
│   ├── 📂 core/                    # Core system (Custom Framework)
│   │   ├── server.js               # Custom HTTP server
│   │   ├── router.js               # Routing system
│   │   ├── request.js              # Request handling
│   │   ├── response.js             # Response formatting
│   │   └── middleware.js           # Middleware pipeline
│   │
│   ├── 📂 controllers/             # API Controllers
│   │   ├── authController.js       # Authentication
│   │   ├── userController.js       # User management
│   │   ├── productController.js    # Product management
│   │   ├── searchController.js     # Advanced search
│   │   ├── cartController.js       # Shopping cart
│   │   ├── orderController.js      # Orders
│   │   ├── categoryController.js   # Categories
│   │   ├── reviewController.js     # Reviews
│   │   ├── statsController.js      # Statistics
│   │   └── uploadController.js     # File upload
│   │
│   ├── 📂 models/                  # Database Models
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   ├── OrderItem.js
│   │   ├── Category.js
│   │   ├── Review.js
│   │   ├── ShoppingCart.js
│   │   ├── BlacklistedToken.js
│   │   ├── ResetToken.js
│   │   └── 📂 search/              # Search Models
│   │       ├── CategorySearchModel.js
│   │       ├── OrderSearchModel.js
│   │       ├── ProductSearchModel.js
│   │       ├── ReviewSearchModel.js
│   │       └── UserSearchModel.js
│   │
│   ├── 📂 services/                # Business Logic Layer
│   │   ├── authService.js
│   │   ├── userService.js
│   │   ├── productService.js
│   │   ├── cartService.js
│   │   ├── orderService.js
│   │   ├── categoryService.js
│   │   ├── reviewService.js
│   │   ├── 📂 search/              # Search Services
│   │   │   ├── GlobalSearchService.js
│   │   │   ├── ProductSearchService.js
│   │   │   ├── CategorySearchService.js
│   │   │   ├── OrderSearchService.js
│   │   │   ├── ReviewSearchService.js
│   │   │   ├── UserSearchService.js
│   │   │   └── SearchHelperService.js
│   │   └── 📂 order/               # Order Helpers
│   │       └── orderHelper.js
│   │
│   ├── 📂 middleware/              # Custom Middleware
│   │   ├── auth.js                 # Authentication middleware
│   │   ├── role.js                 # Role-based access
│   │   ├── upload.js               # File upload
│   │   └── validation.js           # Input validation
│   │
│   ├── 📂 validation/              # Validation Schemas
│   │   ├── authValidation.js
│   │   ├── userValidation.js
│   │   ├── productValidation.js
│   │   ├── cartValidation.js
│   │   ├── orderValidation.js
│   │   ├── categoryValidation.js
│   │   ├── reviewValidation.js
│   │   └── searchValidation.js
│   │
│   └── 📂 utils/                   # Utility Functions
│       ├── bcrypt.js               # Password hashing
│       ├── jwt.js                  # JWT handling
│       ├── email.js                # Email service
│       ├── response.js             # Response helpers
│       ├── validator.js            # Validation helpers
│       ├── constants.js            # App constants
│       └── SearchQueryBuilder.js   # Advanced search utilities
│
└── 📂 test/                        # Test Files
    ├── supabase_test_connection.js
    └── test-user-model.js
```

### 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Follow Node.js pure architecture patterns
4. Add comprehensive tests
5. Update documentation
6. Submit pull request

### 📝 License

This project is licensed under the MIT License.

### 🔗 Links

- **Live API:** https://api.unimerch.space
- **Documentation:** [API Docs](api-docs.md)
- **Postman Collection:** [Import Here](https://www.postman.com/leduyphuc-8968207/unimerch/collection/43636674-82906095-a87a-458d-887f-0dafb7096684)
- **GitHub Repository:** https://github.com/leedontbeshy/Unimerch

---

## Tiếng Việt

### 🌟 Tổng Quan

**UniMerch API** là một nền tảng backend thương mại điện tử toàn diện được thiết kế đặc biệt cho việc mua bán đồ dùng sinh viên trong các trường đại học. Được xây dựng bằng Node.js thuần, API này cung cấp một nền tảng mạnh mẽ, có thể mở rộng cho các ứng dụng thương mại điện tử nhắm đến sinh viên và cộng đồng đại học.

🌐 **API Trực Tuyến:** https://api.unimerch.space

📮 **Collection Postman:** [Import Collection](https://www.postman.com/leduyphuc-8968207/unimerch/collection/43636674-82906095-a87a-458d-887f-0dafb7096684)

### ✨ Tính Năng Chính

#### 🔐 **Xác Thực & Phân Quyền**
- Xác thực dựa trên JWT với blacklist token
- Kiểm soát truy cập theo vai trò (User, Seller, Admin)
- Reset mật khẩu an toàn với xác minh email
- Quản lý phiên đăng nhập và đăng xuất

#### 👥 **Quản Lý Người Dùng**
- Đăng ký và quản lý hồ sơ người dùng
- Phân quyền theo vai trò và cấp độ truy cập
- Khả năng quản lý người dùng cho Admin

#### 🛍️ **Danh Mục Sản Phẩm**
- Quản lý sản phẩm toàn diện
- Tổ chức theo danh mục
- Hỗ trợ đa người bán với hồ sơ seller
- Hệ thống tìm kiếm nâng cao với filter và autocomplete
- Tìm kiếm sản phẩm thời gian thực theo nhiều tiêu chí
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

#### � **Xác Nhận Đơn Hàng**
- Quy trình xác nhận đơn hàng đơn giản
- Theo dõi trạng thái đơn hàng
- Thông báo email cho cập nhật đơn hàng
- Hệ thống hủy đơn hàng

#### 🔍 **Hệ Thống Tìm Kiếm Nâng Cao**
- Tìm kiếm toàn cục sản phẩm, danh mục, người dùng, đơn hàng và đánh giá
- Tự động hoàn thành và gợi ý thông minh
- Lọc và sắp xếp đa tiêu chí
- Lịch sử tìm kiếm và phân tích
- Kết quả tìm kiếm thời gian thực với phân trang
- Tối ưu hóa tìm kiếm theo danh mục cụ thể

#### 📊 **Phân Tích & Báo Cáo**
- Phân tích bán hàng và theo dõi doanh thu
- Thống kê đơn hàng và xu hướng
- Phân tích phương thức thanh toán
- Thông tin chi tiết về hành vi người dùng

#### ⭐ **Hệ Thống Đánh Giá**
- Đánh giá và xếp hạng sản phẩm
- Xác thực đánh giá cho đơn hàng đã mua
- Phân tích và thống kê xếp hạng
- Showcase sản phẩm đánh giá cao nhất

### 🛠️ Công Nghệ Sử Dụng

#### **Công Nghệ Cốt Lõi**
- **Backend:** Node.js thuần
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
- **Tìm kiếm:** `/api/search/*` - Tìm kiếm nâng cao, filter, autocomplete
- **Giỏ hàng:** `/api/cart/*` - Quản lý giỏ hàng
- **Đơn hàng:** `/api/orders/*` - Tạo đơn, theo dõi, quản lý
- **Đánh giá:** `/api/reviews/*` - Đánh giá và xếp hạng sản phẩm
- **Admin:** `/api/admin/*` - Thao tác chỉ dành cho admin
- **Seller:** `/api/seller/*` - Thao tác đặc thù cho seller

### 🧪 Testing với Postman

#### **Import Collection**
1. **Import Nhanh:** Click nút dưới đây để import trực tiếp vào Postman
   
   [![Run in Postman](https://run.pstmn.io/button.svg)](https://www.postman.com/leduyphuc-8968207/unimerch/collection/43636674-82906095-a87a-458d-887f-0dafb7096684)

2. **Import Thủ Công:**
   - Mở Postman
   - Click nút "Import"
   - Dán link collection hoặc sử dụng file JSON
   - Link Collection: `https://www.postman.com/leduyphuc-8968207/unimerch/collection/43636674-82906095-a87a-458d-887f-0dafb7096684`

#### **Thiết Lập Biến Môi Trường**
Tạo môi trường mới trong Postman với các biến sau:
```
unimerch: https://api.unimerch.space
token_test_16_09: (Sẽ được set sau khi login)
user_token_16_09: (Sẽ được set sau khi user login)
bao_token: (Sẽ được set sau khi user cụ thể login)
```

#### **Trình Tự Test**
Theo dõi thứ tự này để test có hệ thống:

1. **Luồng Xác Thực**
   ```
   POST /api/auth/register → Tạo tài khoản
   POST /api/auth/login → Lấy JWT token (lưu vào environment)
   GET /api/users/profile → Xác thực authentication
   ```

2. **Quản Lý Sản Phẩm**
   ```
   GET /api/products → Duyệt sản phẩm
   GET /api/products/1 → Xem chi tiết sản phẩm
   GET /api/products/featured → Lấy sản phẩm nổi bật
   POST /api/products → Tạo sản phẩm (admin/seller)
   ```

3. **Giỏ Hàng**
   ```
   POST /api/cart/add → Thêm items vào giỏ
   GET /api/cart → Xem giỏ hàng
   PUT /api/cart/update/:id → Cập nhật số lượng
   GET /api/cart/validate → Xác thực giỏ trước checkout
   ```

4. **Xử Lý Đơn Hàng**
   ```
   POST /api/orders → Tạo đơn từ giỏ hàng
   GET /api/orders → Xem đơn hàng của user
   GET /api/orders/:id → Xem chi tiết đơn hàng
   PUT /api/orders/:id/status → Cập nhật trạng thái đơn
   ```

5. **Xác Nhận Đơn Hàng**
   ```
   POST /api/orders/confirm → Xác nhận đơn hàng
   GET /api/orders/:id/status → Kiểm tra trạng thái đơn hàng
   PUT /api/orders/:id/cancel → Hủy đơn hàng
   ```

6. **Đánh Giá & Xếp Hạng**
   ```
   POST /api/reviews → Tạo đánh giá
   GET /api/reviews/product/:id → Lấy đánh giá sản phẩm
   GET /api/reviews/product/:id/stats → Lấy thống kê xếp hạng
   PUT /api/reviews/:id → Cập nhật đánh giá
   ```

#### **Bộ Sưu Tập Có Sẵn**

Bộ sưu tập Postman bao gồm:

- **Auth APIs** (6 endpoints)
  - Đăng ký, Đăng nhập, Đăng xuất
  - Reset & Khôi phục mật khẩu
  
- **User Management APIs** (4 endpoints)
  - Quản lý hồ sơ
  - Đổi mật khẩu
  - Thao tác admin user

- **Product APIs** (8 endpoints)
  - Thao tác CRUD
  - Tìm kiếm và lọc
  - Sản phẩm nổi bật

- **Category APIs** (2 endpoints)
  - Quản lý danh mục
  - Cập nhật danh mục

- **Cart APIs** (7 endpoints)
  - Quản lý giỏ hàng
  - Thao tác items
  - Xác thực giỏ hàng

- **Order APIs** (10 endpoints)
  - Tạo đơn (giỏ hàng & trực tiếp)
  - Theo dõi đơn hàng
  - Quản lý trạng thái
  - Views admin & seller


- **Review APIs** (11 endpoints)
  - Thao tác CRUD đánh giá
  - Thống kê xếp hạng
  - Sản phẩm top
  - Đánh giá của user

### 📁 Cấu Trúc Project

```
WebDevFinal/
├── 📄 server.js                    # Entry point chính
├── 📄 package.json                 # Dependencies và scripts
├── 📄 README.md                    # Tài liệu project
├── 📄 api-docs.md                  # Tài liệu API chi tiết
├── 📄 db.txt                       # Database schema
│
├── 📂 config/                      # Cấu hình hệ thống
│   ├── config.js                   # Cấu hình chung
│   └── database.js                 # Cấu hình database
│
├── 📂 src/                         # Source code chính
│   ├── 📄 app.js                   # Application setup
│   │
│   ├── 📂 core/                    # Hệ thống cốt lõi (Custom Framework)
│   │   ├── server.js               # HTTP server tùy chỉnh
│   │   ├── router.js               # Routing system
│   │   ├── request.js              # Request handling
│   │   ├── response.js             # Response formatting
│   │   └── middleware.js           # Middleware pipeline
│   │
│   ├── 📂 controllers/             # API Controllers
│   │   ├── authController.js       # Xác thực
│   │   ├── userController.js       # Quản lý user
│   │   ├── productController.js    # Quản lý sản phẩm
│   │   ├── searchController.js     # Tìm kiếm nâng cao
│   │   ├── cartController.js       # Giỏ hàng
│   │   ├── orderController.js      # Đơn hàng
│   │   ├── categoryController.js   # Danh mục
│   │   ├── reviewController.js     # Đánh giá
│   │   ├── statsController.js      # Thống kê
│   │   └── uploadController.js     # Upload file
│   │
│   ├── 📂 models/                  # Database Models
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   ├── OrderItem.js
│   │   ├── Category.js
│   │   ├── Review.js
│   │   ├── ShoppingCart.js
│   │   ├── BlacklistedToken.js
│   │   ├── ResetToken.js
│   │   └── 📂 search/              # Search Models
│   │       ├── CategorySearchModel.js
│   │       ├── OrderSearchModel.js
│   │       ├── ProductSearchModel.js
│   │       ├── ReviewSearchModel.js
│   │       └── UserSearchModel.js
│   │
│   ├── 📂 services/                # Business Logic Layer
│   │   ├── authService.js
│   │   ├── userService.js
│   │   ├── productService.js
│   │   ├── cartService.js
│   │   ├── orderService.js
│   │   ├── categoryService.js
│   │   ├── reviewService.js
│   │   ├── 📂 search/              # Search Services
│   │   │   ├── GlobalSearchService.js
│   │   │   ├── ProductSearchService.js
│   │   │   ├── CategorySearchService.js
│   │   │   ├── OrderSearchService.js
│   │   │   ├── ReviewSearchService.js
│   │   │   ├── UserSearchService.js
│   │   │   └── SearchHelperService.js
│   │   └── 📂 order/               # Order Helpers
│   │       └── orderHelper.js
│   │
│   ├── 📂 middleware/              # Custom Middleware
│   │   ├── auth.js                 # Authentication middleware
│   │   ├── role.js                 # Role-based access
│   │   ├── upload.js               # File upload
│   │   └── validation.js           # Input validation
│   │
│   ├── 📂 validation/              # Validation Schemas
│   │   ├── authValidation.js
│   │   ├── userValidation.js
│   │   ├── productValidation.js
│   │   ├── cartValidation.js
│   │   ├── orderValidation.js
│   │   ├── categoryValidation.js
│   │   ├── reviewValidation.js
│   │   └── searchValidation.js
│   │
│   └── 📂 utils/                   # Utility Functions
│       ├── bcrypt.js               # Password hashing
│       ├── jwt.js                  # JWT handling
│       ├── email.js                # Email service
│       ├── response.js             # Response helpers
│       ├── validator.js            # Validation helpers
│       ├── constants.js            # App constants
│       └── SearchQueryBuilder.js   # Advanced search utilities
│
└── 📂 test/                        # Test Files
    ├── supabase_test_connection.js
    └── test-user-model.js
```

### 🤝 Đóng Góp

1. Fork repository
2. Tạo feature branch: `git checkout -b feature/new-feature`
3. Tuân theo các pattern kiến trúc Node.js thuần
4. Thêm các test toàn diện
5. Cập nhật tài liệu
6. Submit pull request

### 📝 Giấy Phép

Dự án này được cấp phép theo giấy phép MIT.

### 🔗 Liên Kết

- **API Trực Tuyến:** https://api.unimerch.space
- **Tài Liệu:** [API Docs](api-docs.md)
- **Bộ Sưu Tập Postman:** [Import Tại Đây](https://www.postman.com/leduyphuc-8968207/unimerch/collection/43636674-82906095-a87a-458d-887f-0dafb7096684)
- **GitHub Repository:** https://github.com/leedontbeshy/Unimerch

---

## 🚀 Getting Started / Bắt Đầu Sử Dụng

### Prerequisites / Yêu Cầu Hệ Thống
- Node.js 16.x or higher
- PostgreSQL database (or Supabase account)
- npm or yarn package manager
- Postman (for API testing)

### Installation Steps / Các Bước Cài Đặt

1. **Clone Repository**
   ```bash
   git clone https://github.com/leedontbeshy/Unimerch.git
   cd WebDevFinal
   ```

2. **Install Dependencies / Cài Đặt Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup / Thiết Lập Môi Trường**
   
   Create `.env` file / Tạo file `.env`:
   ```env
   DB_HOST=db.xxx.supabase.co
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_NAME=postgres
   DB_PORT=5432
   
   JWT_SECRET=your-secret-key
   JWT_EXPIRES_IN=7d
   
   PORT=3000
   NODE_ENV=development
   
   RESEND_API_KEY=your_resend_api_key
   ```

4. **Database Connection Test / Kiểm Tra Kết Nối Database**
   ```bash
   node -e "require('./config/database').testConnection()"
   ```

5. **Start Server / Khởi Động Server**
   ```bash
   npm start
   # or for development / hoặc cho development
   npm run dev
   ```

6. **Import Postman Collection / Import Bộ Sưu Tập Postman**
   
   Click to import: [![Run in Postman](https://run.pstmn.io/button.svg)](https://www.postman.com/leduyphuc-8968207/unimerch/collection/43636674-82906095-a87a-458d-887f-0dafb7096684)

### Quick Test Flow / Luồng Test Nhanh

```bash
# 1. Register a new user / Đăng ký user mới
POST /api/auth/register

# 2. Login / Đăng nhập
POST /api/auth/login
# Save the token from response / Lưu token từ response

# 3. View profile / Xem hồ sơ
GET /api/users/profile
# Use token in Authorization header / Dùng token trong Authorization header

# 4. Browse products / Duyệt sản phẩm
GET /api/products

# 5. Add to cart / Thêm vào giỏ
POST /api/cart/add

# 6. Create order / Tạo đơn hàng
POST /api/orders

# 7. Confirm order / Xác nhận đơn hàng
POST /api/orders/confirm
```

### API Response Format / Định Dạng Response API

All API responses follow this structure / Tất cả API responses theo cấu trúc này:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE"
}
```

### Common Status Codes / Mã Trạng Thái Thường Gặp

- `200` - Success / Thành công
- `201` - Created / Đã tạo
- `400` - Bad Request / Yêu cầu sai
- `401` - Unauthorized / Chưa xác thực
- `403` - Forbidden / Bị cấm
- `404` - Not Found / Không tìm thấy
- `500` - Server Error / Lỗi server

### Authentication / Xác Thực

All protected endpoints require JWT token / Tất cả endpoints được bảo vệ cần JWT token:

```
Authorization: Bearer <your_jwt_token>
```

### Rate Limiting / Giới Hạn Tốc Độ

- Standard endpoints: 100 requests/minute
- Authentication endpoints: 10 requests/minute

### Support & Contact / Hỗ Trợ & Liên Hệ

- 📧 Email: support@unimerch.space
- 📖 Documentation: [Full API Docs](api-docs.md)
- 🐛 Issues: [GitHub Issues](https://github.com/leedontbeshy/Unimerch/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/leedontbeshy/Unimerch/discussions)

### Development Team / Đội Ngũ Phát Triển

- **Backend Lead:** Le Duy Phuc
- **Contributors:** Open for contributions

### Roadmap / Lộ Trình

- [x] Core API Development
- [x] Authentication System
- [x] Product Management
- [x] Shopping Cart
- [x] Order Processing
- [x] Review System
- [ ] Real-time Notifications
- [ ] Advanced Analytics Dashboard
- [ ] Mobile App Integration
- [ ] Multi-language Support

---

**⭐ If you find this project useful, please give it a star on GitHub!**

**⭐ Nếu bạn thấy dự án này hữu ích, hãy cho nó một star trên GitHub!**

*Made with ❤️ by UniMerch Team*
