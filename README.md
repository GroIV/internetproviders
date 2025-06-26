# Internet Provider Analytics

A comprehensive web application for comparing internet service providers, finding coverage by ZIP code, and getting personalized recommendations based on your needs.

## 🚀 Features

### Core Features (Working)
- **Provider Search by ZIP Code**: Find all available internet providers in your area
- **Plan Comparison**: Compare plans side-by-side with speeds, pricing, and features
- **Smart Recommendations**: Get personalized plan recommendations based on your usage needs
- **Excel Data Import**: Automatically imports provider coverage data from Excel files
- **Real-time Geolocation**: Use your current location to find providers

### In Development
- **Interactive Coverage Map**: Visual representation of provider coverage areas
- **AI Assistant**: Natural language support for internet-related questions
- **User Authentication**: Save preferences and comparison history
- **Admin Dashboard**: Manage providers, plans, and coverage data

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI Components**: Radix UI, Shadcn/ui
- **State Management**: React Query (TanStack Query)
- **Routing**: Wouter

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (local or cloud)
- Excel file with provider coverage data (optional)

## 🔧 Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/internet-provider-analytics.git
cd internet-provider-analytics
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp env.example .env
```

Edit `.env` and add your configuration:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/internet_providers
NODE_ENV=development
SESSION_SECRET=your-secret-key
```

4. **Set up the database**

For local PostgreSQL:
```sql
CREATE DATABASE internet_providers;
```

Or use a cloud service like [Neon](https://neon.tech/) (recommended for easy setup).

5. **Run database migrations**
```bash
npm run db:push
```

6. **Start the development server**
```bash
npm run dev
```

The application will be available at http://localhost:5000

## 📊 Data Import

The application can import provider coverage data from Excel files. Place your Excel file in the `attached_assets` directory with the following structure:

- Column 1: ZIP codes
- Remaining columns: Provider names (with 1 or 0 indicating coverage)

The data will be automatically imported on server startup.

## 🏗️ Project Structure

```
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── lib/         # Utilities and API clients
│   │   └── hooks/       # Custom React hooks
├── server/              # Express backend
│   ├── routes.ts        # API endpoints
│   ├── storage.ts       # Storage interface
│   ├── dbStorage.ts     # Database implementation
│   ├── excelParser.ts   # Excel data import
│   └── geocoding.ts     # Geocoding service
├── shared/              # Shared types and schemas
│   └── schema.ts        # Database schema
└── migrations/          # Database migrations
```

## 🔌 API Endpoints

### Providers
- `GET /api/providers` - List all providers
- `GET /api/providers/:id` - Get provider details
- `POST /api/providers` - Create new provider

### Coverage
- `GET /api/coverage/:zipCode` - Get providers by ZIP code

### Plans
- `GET /api/plans` - List all plans
- `GET /api/plans/:id` - Get plan details
- `POST /api/plans` - Create new plan

### Recommendations
- `POST /api/recommendations` - Get personalized recommendations

### Geocoding
- `POST /api/geocode/reverse` - Convert coordinates to ZIP code

## 🚦 Development Status

### ✅ Completed
- Database schema and migrations
- Provider and plan management
- ZIP code coverage lookup
- Plan comparison interface
- Recommendation algorithm
- Excel data import
- Geocoding integration

### 🚧 In Progress
- Coverage map visualization
- AI assistant integration
- User authentication system
- Real-time updates

### 📋 Planned
- Admin dashboard
- Email notifications
- Advanced filtering
- Performance optimization
- Mobile app

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Provider logos and information are property of their respective companies
- Built with React, Node.js, and PostgreSQL
- UI components from Radix UI and Shadcn/ui 