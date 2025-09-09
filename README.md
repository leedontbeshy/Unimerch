## 🗄️ Database
- **Database**: PostgreSQL
- **Hosting**: Supabase
- **ORM**: Raw SQL với pg driver

## 🚀 Quick Setup

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd WebDevFinal
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Tạo file `.env` trong root directory:
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

### 4. Test Connection
```bash
# Test database connection
node -e "require('./config/database').testConnection()"
```

### 5. Start Development Server
```bash
npm start
# hoặc
npm run dev
```