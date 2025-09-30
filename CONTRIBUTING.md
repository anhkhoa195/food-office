# Contributing to OfficeFood

Thank you for your interest in contributing to OfficeFood! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm 8+
- Docker and Docker Compose
- Git

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/officefood.git
   cd officefood
   ```

2. **Quick Setup (Windows)**
   ```bash
   scripts\setup.bat
   ```

3. **Quick Setup (Linux/Mac)**
   ```bash
   chmod +x scripts/setup.sh
   ./scripts/setup.sh
   ```

4. **Manual Setup**
   ```bash
   # Copy environment file
   cp env.example .env
   
   # Start database
   docker-compose -f docker-compose.dev.yml up -d
   
   # Backend setup
   cd backend
   npm install
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   
   # Frontend setup
   cd ../frontend
   npm install
   ```

## 🏗 Development Workflow

### Starting Development

**Windows:**
```bash
scripts\start-dev.bat
```

**Linux/Mac:**
```bash
chmod +x scripts/start-dev.sh
./scripts/start-dev.sh
```

**Manual:**
```bash
# Terminal 1 - Backend
cd backend && npm run start:dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### Code Style

- **Backend**: Follow NestJS conventions and TypeScript best practices
- **Frontend**: Use Prettier formatting (double quotes, semicolons)
- **Database**: Follow Prisma schema conventions
- **Commits**: Use conventional commit messages

### Testing

```bash
# Backend tests
cd backend
npm run test
npm run test:e2e

# Frontend tests (when implemented)
cd frontend
npm run test
```

## 📁 Project Structure

```
officefood/
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── modules/        # Feature modules
│   │   ├── common/         # Shared utilities
│   │   └── main.ts         # Application entry
│   ├── prisma/             # Database schema & migrations
│   └── test/               # Test files
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── store/          # State management
│   │   └── utils/          # Utility functions
│   └── public/             # Static assets
├── scripts/                # Setup and utility scripts
└── docker-compose.yml      # Production deployment
```

## 🔧 Key Technologies

### Backend
- **NestJS**: Progressive Node.js framework
- **Prisma**: Database ORM
- **PostgreSQL**: Database
- **JWT**: Authentication
- **Swagger**: API documentation

### Frontend
- **React 18**: UI library
- **TypeScript**: Type safety
- **TailwindCSS**: Styling
- **Zustand**: State management
- **React Router**: Routing
- **React Hook Form**: Form handling

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Environment**: OS, Node.js version, Docker version
2. **Steps to Reproduce**: Clear, numbered steps
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Screenshots**: If applicable
6. **Logs**: Relevant error messages

## ✨ Feature Requests

For new features:

1. **Check Existing Issues**: Search for similar requests
2. **Describe the Feature**: Clear description and use case
3. **Consider Implementation**: Think about complexity and impact
4. **Mockups**: Visual examples if applicable

## 🔄 Pull Request Process

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### PR Guidelines

- **Clear Title**: Describe what the PR does
- **Description**: Explain the changes and why
- **Testing**: Include test results
- **Screenshots**: For UI changes
- **Breaking Changes**: Clearly mark any breaking changes

## 📋 Development Guidelines

### Backend Development

- Follow NestJS module structure
- Use DTOs for request/response validation
- Implement proper error handling
- Add Swagger documentation
- Write unit and e2e tests

### Frontend Development

- Use TypeScript for all components
- Follow React best practices
- Implement responsive design
- Use TailwindCSS for styling
- Handle loading and error states

### Database Changes

- Use Prisma migrations for schema changes
- Update seed data when needed
- Consider backward compatibility
- Document breaking changes

## 🧪 Testing Guidelines

### Backend Testing

```typescript
// Unit test example
describe('AuthService', () => {
  it('should verify OTP correctly', async () => {
    // Test implementation
  });
});

// E2E test example
describe('Auth (e2e)', () => {
  it('/auth/send-otp (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/send-otp')
      .send({ phone: '+1234567890' })
      .expect(200);
  });
});
```

### Frontend Testing

```typescript
// Component test example
describe('LoginPage', () => {
  it('should render login form', () => {
    render(<LoginPage />);
    expect(screen.getByText('Enter your phone number')).toBeInTheDocument();
  });
});
```

## 🔒 Security Considerations

- Never commit sensitive data (API keys, passwords)
- Use environment variables for configuration
- Validate all user inputs
- Implement proper authentication and authorization
- Follow OWASP security guidelines

## 📚 Documentation

- Update README.md for significant changes
- Document new API endpoints
- Add JSDoc comments for complex functions
- Update setup instructions if needed

## 🎯 Areas for Contribution

- **New Features**: Order management, payment integration, notifications
- **UI/UX Improvements**: Better mobile experience, accessibility
- **Performance**: Database optimization, caching, lazy loading
- **Testing**: Increase test coverage, add integration tests
- **Documentation**: Improve guides, add tutorials
- **DevOps**: CI/CD pipelines, monitoring, logging

## 💬 Community

- **Issues**: Use GitHub Issues for bugs and feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas
- **Code Review**: Help review pull requests
- **Documentation**: Improve existing documentation

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to OfficeFood! 🎉

