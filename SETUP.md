# Hướng dẫn cài đặt và chạy dự án Score Tracking API

## Yêu cầu hệ thống

- Node.js (phiên bản 18.0.0 trở lên)
- MongoDB (phiên bản 4.0 trở lên)
- npm hoặc yarn

## Các bước cài đặt

### 1. Clone dự án

```bash
git clone <repository-url>
cd score-tracking-api
```

### 2. Cài đặt các dependencies

```bash
npm install
# hoặc
yarn install
```

### 3. Cấu hình môi trường

Tạo file `.env` từ file `.env.example` (hoặc sử dụng file `.env` đã có):

```bash
cp .env.example .env  # Nếu bạn có file .env.example
```

Chỉnh sửa file `.env` để phù hợp với môi trường của bạn:

```
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/score-tracker

# JWT Configuration
JWT_SECRET=your_super_secret_key_change_in_production
JWT_EXPIRES_IN=24h

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX=100  # 100 requests per window
```

### 4. Khởi động MongoDB

Đảm bảo MongoDB đang chạy trên máy của bạn. Nếu bạn chưa cài đặt MongoDB, bạn có thể tải và cài đặt từ [trang chủ MongoDB](https://www.mongodb.com/try/download/community).

Hoặc sử dụng Docker:

```bash
docker run -d -p 27017:27017 --name mongodb mongo
```

### 5. Chạy ứng dụng

#### Chế độ phát triển (với nodemon - tự động khởi động lại khi có thay đổi)

```bash
npm run dev
# hoặc
yarn dev
```

#### Chế độ sản xuất

```bash
npm start
# hoặc
yarn start
```

Ứng dụng sẽ chạy tại `http://localhost:3000` (hoặc cổng được cấu hình trong file `.env`).

## Sử dụng ứng dụng

### Giao diện người dùng

Truy cập `http://localhost:3000` để mở giao diện người dùng đơn giản để kiểm tra API.

### API Endpoints

#### Xác thực

- **POST /api/auth/register** - Đăng ký người dùng mới
- **POST /api/auth/login** - Đăng nhập và nhận JWT token
- **GET /api/auth/me** - Lấy thông tin người dùng hiện tại (yêu cầu xác thực)

#### Điểm số

- **GET /api/scores/leaderboard** - Lấy top 10 điểm cao nhất
- **POST /api/scores/update** - Cập nhật điểm số người dùng (yêu cầu xác thực)
- **GET /api/scores/user/:userId** - Lấy điểm số của người dùng cụ thể

### Sử dụng WebSocket

Ứng dụng sử dụng Socket.IO để cập nhật bảng điểm theo thời gian thực. Khi có người dùng cập nhật điểm số, tất cả các client đang kết nối sẽ nhận được bảng điểm mới.

## Cấu trúc dự án

```
score-tracking-api/
├── models/             # Mongoose models
│   └── User.js         # User model
├── routes/             # API routes
│   ├── auth.js         # Authentication routes
│   └── scores.js       # Score management routes
├── middleware/         # Middleware functions
│   └── auth.js         # JWT authentication middleware
├── public/             # Static files
│   └── index.html      # Simple UI for testing
├── .env                # Environment variables
├── .gitignore          # Git ignore file
├── package.json        # Project dependencies
├── README.md           # Project documentation
└── server.js           # Main application file
```

## Triển khai với Docker

Dự án đã bao gồm Dockerfile để dễ dàng triển khai. Để sử dụng Docker:

```bash
# Build Docker image
docker build -t score-tracking-api .

# Chạy container
docker run -p 3000:3000 --env-file .env score-tracking-api
```

Hoặc sử dụng Docker Compose (nếu bạn đã tạo file docker-compose.yml):

```bash
docker-compose up
``` 