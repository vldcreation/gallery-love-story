# Gallery Love Story

A modern web application for managing and displaying a beautiful photo gallery with tagging and categorization features.

## Features

- Photo management with title, description, and image upload
- Tag and category organization
- Responsive gallery view
- Presentation mode for slideshows
- Admin dashboard for content management
- Secure authentication system
- Cloudinary integration for image hosting

## Prerequisites
- You're a pimp to your partner 
- You're bored || you're being caught cheating
- You're a programmer
- Node.js (v16 or higher)
- npm or yarn
- Supabase account for database and authentication
- Cloudinary account for image hosting

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd gallery-love-story
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
VITE_SUPABASE_ANON_KEY=
VITE_SUPABASE_URL=

VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_API_KEY=
VITE_CLOUDINARY_API_SECRET=
VITE_CLOUDINARY_RESSOURCE_NAME=
```
or just cp the `.env.❤️` file

4. Set up the database:
   - Create a new Supabase project
   - Run the migration script in `supabase/migrations`

5. Configure Cloudinary:
   - Create a Cloudinary account
   - Set up an upload preset named 'love-story'
   - Configure the folder path as needed

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Building for Production

Build the application:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Usage

### Admin Access
1. Navigate to `/admin/login`
2. Log in with your Supabase user credentials
3. Use the admin dashboard to:
   - Upload and manage photos
   - Create and edit categories
   - Manage tags

### Public Gallery
- Browse photos on the main page
- Filter by tags and categories
- View photo details
- Start presentation mode

## Tech Stack

- React with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Supabase for backend and authentication
- Cloudinary for image hosting

## License

MIT