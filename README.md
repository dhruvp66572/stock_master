# StockMaster - Inventory Management System

A modern, full-stack inventory management system built for the 4-hour hackathon challenge. StockMaster provides efficient stock control, warehouse management, and seamless order tracking capabilities.

## 🚀 Tech Stack

- **Frontend**: Next.js 14+ (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js (planned for Phase 2)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js 18.0 or higher
- PostgreSQL 14.0 or higher
- npm or yarn package manager

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

- `DATABASE_URL`: Your PostgreSQL connection string
- `NEXTAUTH_SECRET`: Generate using `openssl rand -base64 32`
- Other configuration as needed

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

## 📁 Project Structure

```
stock_master/
├── prisma/
│   └── schema.prisma          # Database schema definition
├── src/
│   ├── app/                   # Next.js 14 App Router
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   └── ui/                # shadcn/ui components
│   └── lib/
│       ├── prisma.ts          # Prisma client singleton
│       └── utils.ts           # Utility functions
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

- **User**: System users with role-based access (ADMIN, MANAGER, STAFF)
- **Product**: Inventory items with SKU, stock levels, and categories
- **Category**: Product categorization
- **Warehouse**: Storage locations for products
- **Receipt**: Incoming stock transactions
- **Delivery**: Outgoing stock transactions
- **StockMovement**: Audit trail of all stock changes

## 🎯 Features (Hackathon Phases)

### Phase 1: Foundation (Completed)
- ✅ Project setup with Next.js, TypeScript, and Tailwind CSS
- ✅ Database schema design with Prisma
- ✅ Basic UI components with shadcn/ui

### Phase 2: Core Functionality (In Progress)
- Authentication and authorization
- Product management CRUD
- Category and warehouse management
- Receipt and delivery workflows

### Phase 3: Advanced Features
- Dashboard with KPIs and analytics
- Low stock alerts
- Stock movement history
- Search and filtering

## 🤝 Contributing

This is a hackathon project. If you're part of the team:

1. Create a feature branch from `main`
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

This project is created for educational/hackathon purposes.

## 🐛 Known Issues

- TypeScript errors will resolve after running `npm install`
- CSS linting warnings are expected with Tailwind directives

## 📞 Support

For questions or issues, please contact the development team.

---

Built with ❤️ for the 4-hour hackathon challenge
