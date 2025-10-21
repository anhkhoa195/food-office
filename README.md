# OfficeFood - Group Food Orders SaaS New version

A comprehensive SaaS application for managing group food orders in office teams. Built with modern technologies and designed for scalability.

## 🚀 Features

- **Phone-based Authentication**: Secure OTP-based login system
- **Group Order Management**: Create and manage order sessions for teams
- **Menu Management**: Add, edit, and organize menu items by categories
- **Order Tracking**: Real-time order status and tracking
- **Billing & Reports**: Generate weekly/monthly reports with PDF/Excel export
- **Multi-tenant Architecture**: Company-based user isolation
- **Responsive Design**: Modern UI that works on all devices

## 🛠 Tech Stack

### Backend
- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe development
- **PostgreSQL** - Robust relational database
- **Prisma** - Modern database ORM
- **JWT** - Secure authentication
- **Swagger** - API documentation

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool
- **TailwindCSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Zustand** - Lightweight state management
- **React Hook Form** - Form handling
- **Zod** - Schema validation

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Web server and reverse proxy

## 📋 Prerequisites

- Node.js 18+ and npm 8+
- Docker and Docker Compose
- Git

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd officefood
```

### 2. Environment Setup

```bash
# Copy environment template
cp env.example .env

# Edit the .env file with your configuration
nano .env
```

### 3. Start with Docker (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Documentation: http://localhost:3001/api/docs
- PGAdmin: http://localhost:5050 (admin@officefood.com / admin123)

### 4. Manual Setup (Development)

#### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Seed the database
npx prisma db seed

# Start development server
npm run start:dev
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://officefood:password@localhost:5432/officefood_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# OTP Service (Mock for development)
OTP_EXPIRES_IN="300"
MOCK_OTP_CODE="123456"

# API Configuration
PORT=3001
NODE_ENV="development"

# Frontend
VITE_API_URL="http://localhost:3001/api/v1"
```

### Database Configuration

The application uses PostgreSQL with Prisma ORM. The database schema includes:

- **Users**: User accounts with phone-based authentication
- **Companies**: Multi-tenant organization structure
- **Menu Items**: Food items with categories and pricing
- **Order Sessions**: Time-bound group ordering periods
- **Orders**: Individual user orders within sessions
- **Order Items**: Detailed order line items
- **OTP Codes**: Temporary authentication codes

## 📱 Usage

### Authentication

1. Enter your phone number in international format (+1234567890)
2. Receive OTP code (use `123456` in development)
3. Enter the code to complete login

### Creating Order Sessions

1. Navigate to "Order Sessions"
2. Click "New Session"
3. Set title, description, start/end times
4. Share the session with your team

### Managing Menu

1. Go to "Menu" section
2. Add new items with categories and pricing
3. Set availability status
4. Organize by categories

### Placing Orders

1. Join an active order session
2. Browse available menu items
3. Add items to your order
4. Submit your order

### Viewing Reports

1. Access "Reports" section
2. View billing summaries
3. Export weekly/monthly reports
4. Download as PDF or Excel

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Frontend Tests

```bash
cd frontend

# Run tests (when implemented)
npm run test
```

## 📊 API Documentation

Once the backend is running, visit http://localhost:3001/api/docs for interactive API documentation powered by Swagger.

### Key Endpoints

- `POST /api/v1/auth/send-otp` - Send OTP to phone
- `POST /api/v1/auth/verify-otp` - Verify OTP and login
- `GET /api/v1/menu` - Get menu items
- `POST /api/v1/orders/sessions` - Create order session
- `POST /api/v1/orders` - Place order
- `GET /api/v1/billing/reports/weekly` - Get weekly report
- `GET /api/v1/billing/export/monthly` - Export monthly report

## 🚀 Deployment

### Production Build

```bash
# Build backend
cd backend && npm run build

# Build frontend
cd frontend && npm run build
```

### Docker Production

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables for Production

Ensure to set proper environment variables for production:

- Use a strong `JWT_SECRET`
- Set `NODE_ENV=production`
- Configure proper database credentials
- Set up email service for OTP delivery
- Configure file upload limits

## 🔒 Security Considerations

- JWT tokens with expiration
- Input validation and sanitization
- Rate limiting on API endpoints
- CORS configuration
- Helmet for security headers
- Environment variable protection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the API documentation at `/api/docs`
- Review the logs with `docker-compose logs`

## 🗺 Roadmap

- [ ] Real SMS integration for OTP
- [ ] Push notifications
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Payment integration
- [ ] Multi-language support
- [ ] Advanced reporting features
- [ ] Integration with food delivery services

---

Built with ❤️ for office teams who love good food together!
