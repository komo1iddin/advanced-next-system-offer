# StudyBridge - Chinese University Study Offers Platform

StudyBridge is a platform designed to help students discover and apply for study opportunities at Chinese universities. This application allows educational agencies to showcase university programs, scholarships, and admission requirements in an organized and user-friendly interface.

## Features

- Browse study opportunities from Chinese universities
- Filter by degree level, tags, and other criteria
- View detailed information about each study program
- Sort offers by deadline, tuition cost, and other factors
- Mobile-responsive design
- Add and edit study offers with rich metadata
- Standardized admin interfaces and forms for consistent UX

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **UI Components**: Radix UI, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Form Handling**: Standardized form system with React Hook Form and Zod validation
- **Date Handling**: date-fns
- **Code Quality**: Custom ESLint plugin for form standards

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
  - `app/components/forms/` - Standardized form system
  - `app/components/forms/validation/` - Validation library
- `components/` - Reusable UI components
- `hooks/` - Custom React hooks
- `lib/` - Utility functions and database connection
- `lib/models/` - MongoDB models
- `public/` - Static assets
- `eslint-plugin-form-standards/` - Custom ESLint plugin for form standardization

## Standardized Form System

The project uses a comprehensive standardized form system to ensure consistency across all forms:

- **FormBase**: A reusable form component built on react-hook-form and zod validation
- **ModalBase**: A standardized modal component with consistent styling and behavior
- **FormModal**: Combines FormBase and ModalBase for the common pattern of forms within modals
- **Form Fields**: Standardized form field components (FormTextField, FormSelectField, FormSwitchField)
- **Validation Library**: Reusable validation patterns using Zod for consistent form validation
- **ESLint Plugin**: Custom ESLint rules to enforce usage of the standardized components

For detailed documentation:
- [Form System README](app/components/forms/README.md)
- [Validation Library README](app/components/forms/validation/README.md)
- [ESLint Plugin README](eslint-plugin-form-standards/README.md)

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