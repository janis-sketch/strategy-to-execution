# StrategyHub - Strategy to Execution

A simplified version of Atlassian's Strategy Collection, built for small businesses. Connect your strategic priorities to daily execution in one place.

## Features

- **Strategy Dashboard** - Overview of all strategic progress with rollup metrics
- **Focus Areas** - Hierarchical strategic priorities with color coding
- **Goals & Key Results** - OKR-style goal tracking with progress scoring
- **Initiatives** - Project tracking linked to strategic goals
- **Tasks** - Task management within initiatives with status tracking
- **Team Alignment** - See who's working on what across your strategy

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Prisma + SQLite
- Zod validation

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Initialize database
npx prisma db push

# Seed with sample data
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:seed` - Seed database with sample data
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Prisma Studio for database inspection
