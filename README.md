# PMTool SE1 – Lightweight Project Management

<img width="1274" height="706" alt="image" src="https://github.com/user-attachments/assets/fac8fbbe-85c8-4f20-bdda-86b25043fbd9" />

<img width="1267" height="713" alt="image" src="https://github.com/user-attachments/assets/44d33308-8115-4d1a-b5cd-d2b6ff8d6b8c" />

A modern, responsive project management system designed for teams and individuals to track tasks, manage projects, and visualize progress through intuitive views including Kanban boards and Gantt charts.

## Key Features

### Project & Task Management
- **Dashboard** – Overview of active projects, tasks, and deadlines at a glance
- **Projects** – Create, edit, copy, and delete projects with full metadata
- **Tasks** – Full task lifecycle management with status tracking
- **Kanban Board** – Visual task management with drag-and-drop style columns
- **Gantt Chart** – Timeline view for project scheduling and planning
- **Task Filtering** – Filter tasks by status, project, and time windows
- **Bidirectional Date-Duration Sync** – Adjusting dates auto-updates duration; changing duration auto-updates end date

### User Management
- **User Registration** – Account creation with validation (letters, numbers, underscore only)
- **User Authentication** – Cookie-based login with hardcoded admin account support
- **User List** – View all system users (account, display name, email) from settings menu
- **User Profile** – Editable display name and email; account name is read-only

### UI/UX
- **Dark/Light Theme** – Seamless theme switching for comfortable viewing
- **Internationalization** – Full Chinese and English language support
- **About Dialog** – Project information accessible from header
- **Message Board** – Quick access from header for team communication

### Data Management
- **Data Import/Export** – Export and import project/task data via JSON
- **Data Initialization** – Reset database with sample data
- **Operation Logs** – Track user actions with granular button/menu-level logging

## Tech Stack

### Frontend
- **React 19** with **TypeScript** for type-safe development
- **Next.js 15** (App Router) for server-side rendering and routing
- **shadcn/ui** + **Radix UI** for accessible components
- **Tailwind CSS 3.4** for styling
- **Lucide React** for icons

### Backend
- **Prisma ORM** – Type-safe database access
- **PostgreSQL** (production) / **SQLite** (development)

### Date & State
- **date-fns** & **date-fns-tz** – Date manipulation and timezone handling

### Deployment
- **Vercel** – Zero-config deployment
- **Docker** – Self-hosted via Docker Compose

## Project Structure

```
├── app/
│   ├── (app)/                  # Main application pages
│   │   ├── page.tsx           # Dashboard
│   │   ├── projects/          # Project detail pages
│   │   ├── tasks/            # Task listing page
│   │   ├── kanban/           # Kanban board page
│   │   └── gantt/            # Gantt chart page
│   ├── api/                   # API routes
│   │   ├── auth/             # Login, logout, register, check-username
│   │   ├── projects/         # Project CRUD + copy
│   │   ├── tasks/            # Task CRUD + duplicate
│   │   ├── users/            # User list
│   │   ├── logs/             # Operation logs
│   │   └── messages/         # Message board
│   └── login/                # Login & register pages
├── components/
│   ├── ui/                   # shadcn/ui base components
│   ├── Header.tsx            # Top navigation bar
│   ├── Sidebar.tsx           # Side navigation menu
│   ├── TaskCard.tsx          # Task card component
│   ├── TaskListSection.tsx   # Task list container
│   ├── KanbanBoard.tsx       # Kanban board
│   ├── GanttChart.tsx        # Gantt chart
│   ├── LogViewer.tsx         # Operation log viewer
│   ├── UserProfileDialog.tsx # User profile dialog
│   ├── UserListDialog.tsx    # User list dialog
│   ├── SettingsDialog.tsx    # Settings dialog
│   ├── DeclarationDialog.tsx # About dialog
│   ├── MessageBoardDialog.tsx # Message board dialog
│   └── ...
├── lib/
│   ├── prisma.ts             # Prisma client
│   ├── utils.ts              # Utility functions
│   ├── date-utils.ts         # Date calculation utilities
│   └── i18n.ts              # Internationalization labels
└── prisma/
    └── schema.prisma         # Database schema
```

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL (or SQLite for local dev)

### Installation

```bash
# Clone the repository
git clone https://github.com/kangpingo/pmtool_se1.git
cd pmtool_se1

# Install dependencies
npm install

# Set up environment
cp .env.example .env  # or create .env with DATABASE_URL

# Generate Prisma client & push schema
npm run db:generate
npm run db:push

# Seed with sample data (optional)
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Default Login
- Account: `admin`
- Password: `admin@123`

## Deployment

### Vercel (Recommended)
```bash
npm i -g vercel
vercel login
vercel --prod
```
Set `DATABASE_URL` in Vercel Dashboard → Settings → Environment Variables.

### Docker (Self-hosted)
```bash
docker-compose up -d
```
Full documentation: [DEPLOY.md](DEPLOY.md)

## Version History

### v1.0.0 (2026-04-17)
- User management: registration, display name, user list
- Bidirectional date-duration sync in task/project dialogs
- Internationalized operation logs
- Fixed log viewer with scrollable content
- Simplified user profile dialog
- Added About dialog and Message Board shortcut
- Docker + Vercel deployment support

### v0.1.0 (2026-04-16)
- Initial release
- Project & task CRUD
- Kanban board
- Gantt chart
- Dark/light theme
- Chinese/English i18n

## Screenshots

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

MIT License
