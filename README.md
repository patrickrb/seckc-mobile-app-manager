# Mobile App Management Backend

A Next.js application with Tailwind CSS and Chakra UI for managing your mobile app's backend events using Firebase.

## Features

- 🔐 Firebase Authentication (Email/Password)
- 📊 Event Management (Create, Read, Update, Delete)
- 🎨 Modern UI with Chakra UI and Tailwind CSS
- 📱 Responsive design
- 🔥 Real-time data with Firestore

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase

#### Option A: Using google-services.json (Recommended)

1. Download your `google-services.json` file from the Firebase Console
2. Run the conversion script:

```bash
node scripts/convert-google-services.js path/to/your/google-services.json
```

This will automatically populate your `.env.local` file with the correct Firebase configuration.

#### Option B: Manual Configuration

Copy the template `.env.local` file and fill in your Firebase configuration:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Firebase Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Authentication with Email/Password
4. Create a Firestore database
5. Set up Firestore security rules (example):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /events/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with providers
│   └── page.tsx            # Main application page
├── components/
│   ├── providers.tsx       # Chakra UI and Auth providers
│   ├── LoginForm.tsx       # Authentication form
│   ├── EventForm.tsx       # Event creation/editing form
│   └── EventsList.tsx      # Events management interface
├── hooks/
│   └── useAuth.tsx         # Authentication context and hook
├── lib/
│   ├── firebase.ts         # Firebase configuration
│   └── events.ts           # Firestore events operations
└── types/
    └── event.ts            # Event type definitions
```

## Usage

1. **Sign Up/Sign In**: Create an account or sign in with existing credentials
2. **Create Events**: Click "Create Event" to add new events to your mobile app
3. **Manage Events**: Edit or delete events using the action buttons
4. **Real-time Updates**: All changes are immediately synced with Firebase

## Technologies Used

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety and better development experience
- **Tailwind CSS** - Utility-first CSS framework
- **Chakra UI** - Component library for React
- **Firebase** - Backend-as-a-Service (Authentication + Firestore)
- **Framer Motion** - Animation library (Chakra UI dependency)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).
# seckc-mobile-app-manager
