# StockMaster - Inventory Management System

A modern, full-stack inventory management system built for the 4-hour hackathon challenge. StockMaster provides efficient stock control, warehouse management, and seamless order tracking capabilities.

## 🚀 Tech Stack

- **Frontend**: Next.js 14+ (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API Routes, NextAuth.js v4
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Credentials Provider
- **Email**: Nodemailer (for OTP-based password reset)
- **Form Validation**: Zod & React Hook Form

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js 18.0 or higher
- PostgreSQL 14.0 or higher
- npm or yarn package manager
- Gmail account (for email OTP functionality)

## 🔧 Installation

Follow these steps to set up the project locally:

### 1. Clone the repository

```bash
git clone <repository-url>
cd stock_master
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example environment file and update it with your credentials:

```bash
copy .env.example .env
```

Edit `.env` and update the following variables:

- `DATABASE_URL`: Your PostgreSQL connection string (format: `postgresql://username:password@localhost:5432/stockmaster`)
- `NEXTAUTH_SECRET`: Generate using `openssl rand -base64 32` (or use an online generator)
- `NEXTAUTH_URL`: Keep as `http://localhost:3000` for local development
- `EMAIL_SERVER_HOST`: `smtp.gmail.com` (for Gmail)
- `EMAIL_SERVER_PORT`: `587`
- `EMAIL_SERVER_USER`: Your Gmail address
- `EMAIL_SERVER_PASSWORD`: Gmail App Password (see Email Configuration below)
- `EMAIL_FROM`: Email address to send from
- `OTP_EXPIRY_MINUTES`: OTP expiry time in minutes (default: `10`)

### 4. Set up the database

Generate Prisma client:

```bash
npm run prisma:generate
```

Run database migrations:

```bash
npm run prisma:migrate
```

(Optional) Open Prisma Studio to view/edit data:

```bash
npm run prisma:studio
```

### 5. Start the development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📧 Email Configuration (Gmail)

To enable OTP-based password reset:

1. Go to your [Google Account](https://myaccount.google.com/)
2. Navigate to **Security** → **2-Step Verification** (enable if not already)
3. Scroll down to **App Passwords**
4. Generate a new App Password for "Mail"
5. Copy the 16-character password and add it to `.env` as `EMAIL_SERVER_PASSWORD`

**Note**: Use App Passwords instead of your regular Gmail password for security.

## 📁 Project Structure

```
stock_master/
├── prisma/
│   └── schema.prisma          # Database schema with User model
├── src/
│   ├── app/                   # Next.js 14 App Router
│   │   ├── api/auth/          # Authentication API routes
│   │   │   ├── [...nextauth]/ # NextAuth configuration
│   │   │   ├── signup/        # User registration
│   │   │   ├── forgot-password/ # Request OTP
│   │   │   └── reset-password/  # Reset password with OTP
│   │   ├── auth/              # Authentication pages
│   │   │   ├── login/         # Login page
│   │   │   ├── signup/        # Signup page
│   │   │   ├── forgot-password/ # Forgot password page
│   │   │   ├── reset-password/  # Reset password page
│   │   │   └── error/         # Auth error page
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   └── ui/                # shadcn/ui components
│   ├── lib/
│   │   ├── auth.ts            # Auth utilities (hashing, OTP)
│   │   ├── email.ts           # Email service (Nodemailer)
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── utils.ts           # Utility functions
│   │   └── validations/       # Zod schemas
│   ├── types/                 # TypeScript type definitions
│   └── middleware.ts          # Route protection middleware
├── .env                       # Environment variables (not in git)
├── .env.example               # Example environment variables
├── components.json            # shadcn/ui configuration
├── next.config.js             # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies and scripts
```

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run prisma:seed` - Seed the database (when implemented)

## 🗄️ Database Schema

The application uses the following key models:

- **User**: System users with role-based access (ADMIN, MANAGER, STAFF), email/password authentication, OTP-based password reset
- **Product**: Inventory items with SKU, stock levels, and categories
- **Category**: Product categorization
- **Warehouse**: Storage locations for products
- **Receipt**: Incoming stock transactions
- **Delivery**: Outgoing stock transactions
- **StockMovement**: Audit trail of all stock changes

### User Model Fields
- `id`, `email` (unique), `password` (hashed with bcryptjs)
- `name`, `role` (ADMIN/MANAGER/STAFF), `isActive`
- `emailVerified`, `resetToken`, `resetTokenExpiry`
- `createdAt`, `updatedAt`

## 🔐 Authentication Flow

### Signup
1. User fills out registration form (name, email, password)
2. Password is validated (min 8 chars, uppercase, lowercase, number, special char)
3. Password is hashed with bcryptjs (12 salt rounds)
4. User account is created in database
5. User is automatically signed in and redirected to dashboard

### Login
1. User enters email and password
2. NextAuth verifies credentials against database
3. Password is compared using bcryptjs
4. JWT token is generated with user ID and role
5. User is redirected to dashboard

### Password Reset
1. User requests password reset with email
2. 6-digit OTP is generated and stored in database with expiry (10 minutes)
3. OTP is sent to user's email via Nodemailer
4. User enters OTP and new password
5. OTP is verified and password is updated
6. User is redirected to login page

### Route Protection
- Protected routes: `/dashboard`, `/products`, `/receipts`, `/deliveries`, `/settings`, `/profile`
- Middleware checks JWT token before allowing access
- Unauthenticated users are redirected to `/auth/login`
- Authenticated users accessing auth pages are redirected to `/dashboard`

## 🎯 Features (Hackathon Phases)

### Phase 1: Foundation ✅ (Completed)
- ✅ Project setup with Next.js 14, TypeScript, and Tailwind CSS
- ✅ Database schema design with Prisma
- ✅ shadcn/ui components (Button, Input, Label, Card, Dialog, Table)

### Phase 2: Authentication & Authorization ✅ (Completed)
- ✅ User registration with email/password
- ✅ Login with NextAuth.js Credentials Provider
- ✅ Password hashing with bcryptjs
- ✅ OTP-based password reset via email
- ✅ Role-based access control (ADMIN, MANAGER, STAFF)
- ✅ Route protection middleware
- ✅ Form validation with Zod
- ✅ Responsive auth pages (Login, Signup, Forgot Password, Reset Password)

### Phase 3: Core Functionality (Next)
- Product management CRUD
- Category and warehouse management
- Receipt and delivery workflows
- Stock movement tracking

### Phase 4: Advanced Features (Future)
- Dashboard with KPIs and analytics
- Low stock alerts
- Advanced search and filtering
- Export reports

## 🤝 Contributing

This is a hackathon project. If you're part of the team:

1. Create a feature branch from `main`
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

This project is created for educational/hackathon purposes.

## 🔒 Security Features

- Passwords hashed with bcryptjs (12 salt rounds)
- JWT-based session management (30-day expiry)
- OTP expires after 10 minutes
- Email enumeration prevention (returns success even if user doesn't exist)
- Protected API routes
- CSRF protection via NextAuth
- Secure password requirements (min 8 chars, mixed case, numbers, special chars)

## 🐛 Known Issues & Notes

- TypeScript/lint errors will resolve after running `npm install`
- CSS linting warnings for `@tailwind` directives are expected
- Ensure PostgreSQL is running before starting the app
- Gmail App Passwords required (regular passwords won't work with 2FA enabled)
- First user created will have STAFF role (manually update to ADMIN in database if needed)

## 📞 Support

For questions or issues, please contact the development team.

---

Built with ❤️ for the 4-hour hackathon challenge
