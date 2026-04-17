# PMTools – Lightweight Project Management Tool SE1
<img width="1274" height="706" alt="image" src="https://github.com/user-attachments/assets/fac8fbbe-85c8-4f20-bdda-86b25043fbd9" />

<img width="1267" height="713" alt="image" src="https://github.com/user-attachments/assets/44d33308-8115-4d1a-b5cd-d2b6ff8d6b8c" />


A modern, responsive project management system designed for teams and individuals to track tasks, manage projects, and visualize progress through intuitive views including Kanban boards and Gantt charts.

## Key Features

- **Dashboard** – Overview of active projects, tasks, and deadlines at a glance
- **Kanban Board** – Visual task management with drag-and-drop style columns
- **Gantt Chart** – Timeline view for project scheduling and planning
- **Task Filtering** – Filter tasks by status, project, and time windows
- **Dark/Light Theme** – Seamless theme switching for comfortable viewing
- **Internationalization** – Support for Chinese and English languages

## Tech Stack

### Frontend Framework
- **React 19** with **TypeScript** for type-safe development
- **Next.js 15** (App Router) for server-side rendering and routing

### UI Library & Styling
- **shadcn/ui** – Radix UI-based accessible component library
- **Tailwind CSS 3.4** – Utility-first CSS framework
- **Lucide React** – Icon library

### State & Date Management
- **date-fns** & **date-fns-tz** – Modern date manipulation and timezone handling

### Build & Development
- **TypeScript 5** – Static type checking
- **Vercel** deployment ready

### Backend (via Prisma)
- **Prisma ORM** – Type-safe database access
- Compatible with PostgreSQL, MySQL, SQLite

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── (app)/             # Main application pages
│   │   ├── page.tsx       # Dashboard
│   │   ├── projects/      # Project management pages
│   │   ├── tasks/         # Task listing page
│   │   ├── kanban/        # Kanban board page
│   │   └── gantt/         # Gantt chart page
│   ├── api/               # API routes
│   └── login/             # Authentication page
├── components/            # React components
│   ├── ui/                # shadcn/ui base components
│   ├── Header.tsx         # Top navigation bar
│   ├── Sidebar.tsx        # Side navigation menu
│   ├── TaskCard.tsx       # Task display component
│   ├── TaskListSection.tsx # Task list container
│   └── ...
├── lib/                   # Utilities and helpers
│   ├── prisma.ts          # Prisma client
│   └── utils.ts           # Utility functions
├── prisma/                # Database schema and migrations
│   └── schema.prisma      # Prisma schema definition
└── public/                # Static assets
```

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- PostgreSQL / MySQL / SQLite database (or use SQLite for local dev)

### Installation

```bash
# Clone the repository
git clone https://github.com/kangpingo/pmtools1.git
cd pmtools1

# Install dependencies
npm install

# Set up environment variables
# Create .env file with your database URL:
# DATABASE_URL="file:./dev.db"  # for SQLite
# or
# DATABASE_URL="postgresql://user:password@localhost:5432/pmtools"

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Seed database with sample data
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Screenshots

*Dashboard View*
<img width="1267" height="713" alt="image" src="https://github.com/user-attachments/assets/f01a3586-0ec4-4108-89a8-96eb1757d19c" />

*Project View*
<img width="1266" height="695" alt="image" src="https://github.com/user-attachments/assets/38749e00-3eb5-4116-b471-c7badd531386" />
<img width="1269" height="722" alt="image" src="https://github.com/user-attachments/assets/274e96dc-c54f-4edc-a3e1-d3d479ab93ae" />


*Task View*
<img width="1261" height="718" alt="image" src="https://github.com/user-attachments/assets/937bab26-b128-42f5-95af-4654de5f7462" />

*Kanban Board*
<img width="1262" height="819" alt="image" src="https://github.com/user-attachments/assets/7ed2c540-ca74-404b-aea2-3a81979d14dd" />


*Gantt Chart*
<img width="1267" height="824" alt="image" src="https://github.com/user-attachments/assets/55e2305f-322b-4c88-8454-589a622fe9cf" />

## License

MIT License – see LICENSE file for details.
