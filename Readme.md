# KoolBX API - Logistics Management System

A comprehensive RESTful API for managing logistics operations, package tracking, user management, and payment processing. Built with Node.js, TypeScript, Express, and Prisma with MongoDB.

## 🚀 Features

- **User Management**: Registration, authentication, profile management with role-based access control
- **Package Management**: Track packages, manage pre-alerts, consolidation services
- **Order Processing**: Complete order lifecycle management from creation to delivery
- **Payment Integration**: Stripe and Bold payment gateway integration
- **Multi-language Support**: English and Spanish content support
- **Warehouse Management**: Multi-location warehouse and agent management
- **Analytics Dashboard**: Comprehensive dashboard for business insights
- **Email Notifications**: Automated email system for order updates
- **File Upload**: AWS S3/DigitalOcean Spaces integration for file management
- **Referral System**: User referral program with balance tracking

## 🛠️ Tech Stack

- **Backend**: Node.js, TypeScript, Express.js
- **Database**: MongoDB with Prisma ORM
- **Authentication**: JWT tokens with bcrypt password hashing
- **Payments**: Stripe, Bold Payment Gateway
- **File Storage**: AWS S3 / DigitalOcean Spaces
- **Email**: Nodemailer
- **Validation**: Custom middleware with error handling
- **Scheduling**: Node-cron for automated tasks

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB instance
- Stripe account (for payments)
- DigitalOcean Spaces or AWS S3 (for file storage)
- Email service credentials

## ⚡ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sifat2626/estebanpachonkb.git
   cd estebanpachonkb
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="your_mongodb_connection_string"
   
   # Server
   NODE_ENV=development
   PORT=5000
   
   # JWT
   JWT_ACCESS_SECRET=your_jwt_access_secret
   JWT_ACCESS_EXPIRES_IN=1d
   JWT_REFRESH_SECRET=your_jwt_refresh_secret
   JWT_REFRESH_EXPIRES_IN=30d
   
   # Admin Credentials
   SUPER_ADMIN_PASSWORD=your_super_admin_password
   SUPER_ADMIN_PHONE=your_super_admin_phone
   
   # Encryption
   BCRYPT_SALT_ROUNDS=12
   
   # DigitalOcean Spaces / AWS S3
   DO_SPACE_ENDPOINT=your_spaces_endpoint
   DO_SPACE_ACCESS_KEY=your_access_key
   DO_SPACE_SECRET_KEY=your_secret_key
   DO_SPACE_BUCKET=your_bucket_name
   
   # Payment Gateways
   STRIPE_SECRET_KEY=your_stripe_secret_key
   BOLD_API_URL=your_bold_api_url
   BOLD_API_KEY=your_bold_api_key
   
   # Email Configuration
   SENDER_EMAIL=your_email@example.com
   SENDER_PASS=your_email_password
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run pg
   
   # Run database migrations
   npm run pm
   ```

5. **Build the project**
   ```bash
   npm run build
   ```

6. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📚 API Documentation

Base URL: `http://localhost:5000/api/v1`

### Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/Auth/register` | User registration |
| POST | `/Auth/login` | User login |
| POST | `/Auth/refresh-token` | Refresh access token |
| POST | `/Auth/forgot-password` | Initiate password reset |
| POST | `/Auth/reset-password` | Reset password with OTP |

### User Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/profile` | Get user profile |
| PUT | `/users/profile` | Update user profile |
| GET | `/users` | Get all users (Admin only) |
| PATCH | `/users/:id/status` | Update user status |

### Package Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/packages` | Create package alert |
| GET | `/packages` | Get user packages |
| GET | `/packages/:id` | Get package details |
| PUT | `/packages/:id` | Update package |
| DELETE | `/packages/:id` | Delete package |

### Order Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/order` | Create new order |
| GET | `/order` | Get user orders |
| GET | `/order/:id` | Get order details |
| PATCH | `/order/:id/status` | Update order status |

### Payment Processing
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payments/create-intent` | Create payment intent |
| POST | `/payments/confirm` | Confirm payment |
| GET | `/payments/history` | Get payment history |

### Warehouse & Agents
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/warehouses` | Get all warehouses |
| POST | `/warehouses` | Create warehouse |
| GET | `/agents` | Get agents by warehouse |

### Content Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/blog` | Get all blog posts |
| GET | `/faq` | Get FAQ items |
| GET | `/about` | Get about us content |
| GET | `/partners` | Get partner information |
| GET | `/service` | Get available services |

### Dashboard & Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/stats` | Get dashboard statistics |
| GET | `/dashboard/orders` | Get order analytics |

## 🔐 Authentication

The API uses JWT-based authentication. Include the access token in the Authorization header:

```
Authorization: Bearer <your_access_token>
```

## 📝 Request/Response Examples

### User Registration
```javascript
// POST /api/v1/Auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "phone": "+1234567890"
}

// Response
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "USER"
    },
    "accessToken": "jwt_token_here"
  }
}
```

### Create Package Alert
```javascript
// POST /api/v1/packages
{
  "trackingNumber": "1Z999AA1234567890",
  "vendorName": "Amazon",
  "packageDetails": "Electronics - Laptop",
  "invoice": "invoice_url_or_file"
}

// Response
{
  "success": true,
  "message": "Package alert created successfully",
  "data": {
    "id": "package_id",
    "trackingNumber": "1Z999AA1234567890",
    "status": "ALERTED",
    "createdAt": "2025-10-01T12:00:00Z"
  }
}
```

## 🏗️ Project Structure

```
src/
├── app/
│   ├── DB/                 # Database configuration
│   ├── errors/             # Custom error classes
│   ├── interface/          # TypeScript interfaces
│   ├── middlewares/        # Express middlewares
│   ├── modules/            # Feature modules
│   │   ├── Auth/          # Authentication logic
│   │   ├── User/          # User management
│   │   ├── Package/       # Package tracking
│   │   ├── Order/         # Order processing
│   │   ├── Payment/       # Payment handling
│   │   └── ...            # Other modules
│   ├── routes/            # Route definitions
│   └── utils/             # Utility functions
├── config/                # Configuration files
├── app.ts                 # Express app setup
└── server.ts              # Server entry point
```

## 🎯 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run pg` - Generate Prisma client
- `npm run pm` - Run Prisma migrations
- `npm run generate-module` - Generate new module template
- `npm run lint:check` - Check code linting
- `npm run lint:fix` - Fix linting issues
- `npm run prettier:check` - Check code formatting
- `npm run prettier:fix` - Fix code formatting

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | MongoDB connection string | ✅ |
| `JWT_ACCESS_SECRET` | JWT access token secret | ✅ |
| `STRIPE_SECRET_KEY` | Stripe payment secret key | ✅ |
| `SENDER_EMAIL` | Email service account | ✅ |
| `DO_SPACE_ACCESS_KEY` | DigitalOcean Spaces access key | ✅ |

### CORS Configuration

The API allows requests from:
- `https://estabencho.vercel.app`
- `https://koolbx.com`
- `https://www.koolbx.com`
- `http://localhost:3000`
- `http://localhost:3001`

## 🚀 Deployment

### Using Vercel

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy using the provided `vercel.json` configuration

### Using Docker

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 📞 Support

For support and questions:
- Create an issue in this repository
- Contact the development team

## 🔄 Version History

- **v1.0.0** - Initial release with core logistics management features

---

Built with ❤️ for efficient logistics management
