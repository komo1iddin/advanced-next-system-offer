# StudyBridge - Chinese University Study Offers Platform

StudyBridge is a platform designed to help students discover and apply for study opportunities at Chinese universities. This application allows educational agencies to showcase university programs, scholarships, and admission requirements in an organized and user-friendly interface.

## Features

- Browse study opportunities from Chinese universities
- Filter by degree level, tags, and other criteria
- View detailed information about each study program
- Sort offers by deadline, tuition cost, and other factors
- Mobile-responsive design
- Add and edit study offers with rich metadata

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **UI Components**: Radix UI, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Form Handling**: React Hook Form with Zod validation
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB Atlas account or local MongoDB setup

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/studybridge.git
   cd studybridge
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Configure environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Update `MONGODB_URI` with your MongoDB connection string

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

- `app/` - Next.js application routes
- `components/` - Reusable UI components
- `hooks/` - Custom React hooks
- `lib/` - Utility functions and database connection
- `lib/models/` - MongoDB models
- `public/` - Static assets

## Deployment

This project can be deployed to any platform that supports Next.js, such as Vercel, Netlify, or a traditional server setup.

1. Build the project:
   ```bash
   npm run build
   # or
   yarn build
   # or
   pnpm build
   ```

2. Start the production server:
   ```bash
   npm start
   # or
   yarn start
   # or
   pnpm start
   ```

## License

[MIT](LICENSE)

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/) 