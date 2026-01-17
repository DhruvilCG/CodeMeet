# 🎯 CodeMeet

> **A powerful AI-powered mock interview platform for conducting technical interviews with real-time video calls, code collaboration, and automated testing**

[![Node Version](https://img.shields.io/badge/node-%3E%3D18.17.0-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/typescript-5.0+-blue)](https://www.typescriptlang.org)
[![Next.js](https://img.shields.io/badge/nextjs-14.2-black)](https://nextjs.org)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Quick Start](#-quick-start)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Environment Setup](#-environment-setup)
- [Database](#-database)
- [Commands](#-commands)
- [Usage](#-usage)
- [Troubleshooting](#-troubleshooting)

---

## 📌 Overview

CodeMeet is a modern, AI-powered mock interview platform designed to facilitate technical interviews with seamless video communication, collaborative coding, and automated code testing. It enables interviewers to conduct live coding interviews while candidates solve problems in real-time.

### What It Does
- Conduct live video interviews with screen sharing and recording
- Collaborate on code in real-time with a built-in code editor
- Test candidate solutions automatically with predefined test cases
- Schedule and manage interviews with a calendar system
- Track interview history, ratings, and feedback
- Support multiple programming languages (JavaScript, Python, Java)
- Role-based access control for candidates and interviewers

---

## 🎬 Quick Start

Get up and running in 3 minutes:

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env.local
# Fill in your API keys (see Environment Setup)

# 3. Initialize Convex backend
npx convex dev

# 4. Start development server
npm run dev
```

**Access the app**: [http://localhost:3000](http://localhost:3000)

---

## ✨ Features

### Core Functionality
- ✅ **Real-time Video Calls** - High-quality video conferencing powered by Stream.io
- ✅ **Screen Sharing** - Share your screen during interviews
- ✅ **Screen Recording** - Record interviews for later review
- ✅ **Collaborative Code Editor** - Built-in Monaco Editor with syntax highlighting
- ✅ **Multi-language Support** - JavaScript, Python, and Java
- ✅ **Automated Testing** - Run test cases on candidate submissions
- ✅ **Interview Scheduling** - Schedule interviews with calendar integration
- ✅ **Role-based Access** - Separate dashboards for candidates and interviewers
- ✅ **Interview Management** - Track upcoming and completed interviews
- ✅ **Comments & Ratings** - Provide feedback and rate candidates
- ✅ **Code Submissions** - Submit and review code solutions

### Advanced Features
- 🔐 **Authentication** - Secure authentication with Clerk
- 📊 **Interview Dashboard** - Comprehensive dashboard for managing interviews
- 💬 **Real-time Collaboration** - Live code editing and collaboration
- 🎯 **Question Assignment** - Assign coding questions during interviews
- 📝 **Interview Notes** - Add notes and feedback for each interview
- 🔔 **Status Tracking** - Track interview status (upcoming, completed, succeeded, failed)
- 🎨 **Modern UI** - Beautiful interface built with Radix UI and Tailwind CSS
- 🌙 **Dark Mode** - Support for light and dark themes

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **React** - UI library
- **Radix UI** - Accessible component library
- **Tailwind CSS** - Utility-first styling
- **Monaco Editor** - Code editor component
- **React Hot Toast** - Toast notifications
- **Lucide React** - Icon library

### Backend
- **Convex** - Real-time backend as a service
- **Clerk** - Authentication and user management
- **Stream.io** - Video calling and real-time communication
- **Node.js** - Runtime environment

### Services & Integrations
- **Clerk** - Authentication provider
- **Stream.io** - Video SDK for calls, screen sharing, and recording
- **Convex** - Backend database and real-time sync
- **Svix** - Webhook handling

---

## 📁 Project Structure

```
ai_mock_interviews/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (admin)/              # Admin dashboard pages
│   │   │   └── dashboard/        # Admin dashboard
│   │   ├── (root)/               # Main application pages
│   │   │   ├── (home)/           # Home page
│   │   │   ├── meeting/          # Meeting room pages
│   │   │   │   └── [id]/         # Dynamic meeting page
│   │   │   ├── recordings/       # Recordings page
│   │   │   ├── schedule/         # Interview scheduling
│   │   │   └── layout.tsx        # Root layout
│   │   ├── api/                  # API routes
│   │   ├── fonts/                # Custom fonts
│   │   ├── globals.css           # Global styles
│   │   └── layout.tsx            # Root layout
│   │
│   ├── components/               # React components
│   │   ├── ui/                   # UI components (buttons, cards, etc.)
│   │   ├── providers/            # Context providers
│   │   │   ├── ConvexClerkProvider.tsx
│   │   │   ├── StreamClientProvider.tsx
│   │   │   └── ThemeProvider.tsx
│   │   ├── ActionCard.tsx        # Quick action cards
│   │   ├── CandidateInterviewCard.tsx
│   │   ├── CodeEditor.tsx        # Code editor component
│   │   ├── CommentDialog.tsx     # Comments UI
│   │   ├── EndCallButton.tsx
│   │   ├── InterviewDetailsDialog.tsx
│   │   ├── LoaderUI.tsx
│   │   ├── MeetingCard.tsx
│   │   ├── MeetingModal.tsx
│   │   ├── MeetingRoom.tsx       # Main meeting room
│   │   ├── MeetingSetup.tsx
│   │   ├── Navbar.tsx
│   │   ├── RecordingCard.tsx
│   │   └── UserInfo.tsx
│   │
│   ├── actions/                  # Server actions
│   │   └── stream.actions.ts     # Stream.io actions
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useGetCallById.ts
│   │   ├── useGetCalls.ts
│   │   ├── useMeetingActions.ts
│   │   └── useUserRole.ts
│   │
│   ├── lib/                      # Utilities
│   │   └── utils.ts              # General utilities
│   │
│   ├── constants/                # Constants and config
│   │   └── index.ts              # App constants
│   │
│   └── middleware.ts             # Next.js middleware
│
├── convex/                       # Convex backend
│   ├── _generated/               # Generated Convex files
│   ├── auth.config.ts            # Auth configuration
│   ├── comments.ts               # Comments queries/mutations
│   ├── http.ts                   # HTTP endpoints
│   ├── interviews.ts             # Interview logic
│   ├── schema.ts                 # Database schema
│   └── users.ts                  # User queries/mutations
│
├── public/                       # Static assets
│   ├── java.png
│   ├── javascript.png
│   ├── python.png
│   └── screenshot-for-readme.png
│
├── .env.example                  # Environment template
├── next.config.mjs               # Next.js config
├── tsconfig.json                 # TypeScript config
├── tailwind.config.ts            # Tailwind config
├── postcss.config.mjs            # PostCSS config
├── components.json               # shadcn/ui config
└── package.json                  # Dependencies

```

---

## 🚀 Installation

### Prerequisites
- Node.js >= 18.0.0
- npm, yarn, or pnpm
- Git
- Clerk account (for authentication)
- Stream.io account (for video calls)
- Convex account (for backend)

### Setup Steps

#### 1. Clone & Install
```bash
git clone <repository-url>
cd ai_mock_interviews
npm install
```

#### 2. Environment Variables
```bash
cp .env.example .env.local
```

**Required variables in `.env.local`:**
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Convex Backend
CONVEX_DEPLOYMENT=your-deployment-name
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Stream.io Video
NEXT_PUBLIC_STREAM_API_KEY=your-stream-api-key
STREAM_SECRET_KEY=your-stream-secret-key
```

#### 3. Initialize Convex
```bash
npx convex dev
```

This will:
- Create a new Convex deployment (if needed)
- Generate the Convex URL
- Set up the database schema
- Start the Convex development server

#### 4. Start Development
```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

---

## 🔧 Environment Configuration

### Essential Variables

```env
# Clerk Authentication (Required)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Convex Backend (Required)
CONVEX_DEPLOYMENT="your-deployment-name"
NEXT_PUBLIC_CONVEX_URL="https://your-deployment.convex.cloud"

# Stream.io Video SDK (Required)
NEXT_PUBLIC_STREAM_API_KEY="your-stream-api-key"
STREAM_SECRET_KEY="your-stream-secret-key"
```

### Getting API Keys

#### Clerk Setup
1. Go to [clerk.com](https://clerk.com)
2. Create a new application
3. Copy the Publishable Key and Secret Key
4. Configure authentication providers (optional)

#### Stream.io Setup
1. Go to [getstream.io](https://getstream.io)
2. Create a new application
3. Navigate to the Dashboard
4. Copy the API Key and Secret
5. Enable video calling features

#### Convex Setup
1. Go to [convex.dev](https://convex.dev)
2. Create a new project
3. Run `npx convex dev` in your project
4. The deployment URL will be generated automatically

---

## 💾 Database

### Schema Overview

The application uses Convex for real-time database operations. Key tables:

- **users** - User accounts with roles (candidate/interviewer)
- **interviews** - Interview records with scheduling and status
- **questionAssignments** - Coding questions assigned to interviews
- **submissions** - Code submissions with test results
- **comments** - Interview feedback and ratings

### Schema Details

```typescript
// Users table
users: {
  name: string
  email: string
  image?: string
  role: "candidate" | "interviewer"
  clerkId: string
}

// Interviews table
interviews: {
  title: string
  description?: string
  startTime: number
  endTime?: number
  status: string
  streamCallId: string
  candidateId: string
  interviewerIds: string[]
  rating?: "pass" | "fail" | "pending"
  interviewerNotes?: string
}

// Submissions table
submissions: {
  streamCallId: string
  questionId: string
  code: string
  language: string
  submittedBy: string
  submittedAt: number
  testResults?: TestResult[]
  status?: "pending" | "passed" | "failed"
}
```

### Useful Commands

```bash
# View database in Convex dashboard
npx convex dev

# Deploy schema changes
npx convex deploy

# Check Convex status
npx convex status
```

---

## ⚡ Commands

```bash
# Development
npm run dev              # Start Next.js dev server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Convex
npx convex dev           # Start Convex dev server
npx convex deploy        # Deploy Convex functions
npx convex dashboard     # Open Convex dashboard
```

---

## 📖 Usage

### For Interviewers

1. **Sign Up/Login** - Create an account with Clerk
2. **Set Role** - Ensure your role is set to "interviewer"
3. **Schedule Interview** - Go to Schedule page and create a new interview
4. **Start Meeting** - Click "New Call" or join via meeting ID
5. **Assign Questions** - Select coding questions from the editor
6. **Review Submissions** - View candidate code submissions and test results
7. **Add Feedback** - Provide comments and ratings after the interview

### For Candidates

1. **Sign Up/Login** - Create an account with Clerk
2. **Set Role** - Ensure your role is set to "candidate"
3. **View Interviews** - See your upcoming interviews on the home page
4. **Join Interview** - Click on an interview card or join via meeting ID
5. **Solve Problems** - Use the code editor to solve assigned questions
6. **Submit Solutions** - Submit your code and view test results
7. **Review Feedback** - Check comments and ratings from interviewers

### Features in Detail

#### Video Calls
- Start or join video calls with meeting IDs
- Enable/disable camera and microphone
- Share your screen during the interview
- Record interviews for later review

#### Code Editor
- Multi-language support (JavaScript, Python, Java)
- Syntax highlighting and auto-completion
- Real-time code collaboration
- Test case execution
- Submission tracking

#### Interview Management
- Schedule interviews with date and time
- Assign candidates and interviewers
- Track interview status
- View interview history
- Add notes and ratings

---

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Windows: Find and kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :3000
kill -9 <PID>
```

#### Convex Connection Error
```bash
# Check .env.local for correct CONVEX_DEPLOYMENT and NEXT_PUBLIC_CONVEX_URL
# Verify Convex dev server is running
npx convex dev

# Check Convex dashboard for errors
npx convex dashboard
```

#### Clerk Authentication Issues
```bash
# Verify Clerk keys in .env.local
# Check Clerk dashboard for application status
# Ensure callback URLs are configured correctly
```

#### Stream.io Video Not Working
```bash
# Verify Stream.io API keys
# Check browser console for errors
# Ensure camera/microphone permissions are granted
# Check Stream.io dashboard for usage limits
```

#### Code Editor Not Loading
```bash
# Clear browser cache
# Check browser console for errors
# Verify Monaco Editor dependencies are installed
npm install @monaco-editor/react
```

### Getting Help

- 📚 Check the [Convex documentation](https://docs.convex.dev)
- 📚 Review [Stream.io docs](https://getstream.io/video/docs/)
- 📚 Read [Clerk documentation](https://clerk.com/docs)
- 🐛 Check browser console for errors
- 💻 Review Convex dashboard for backend errors

---

## 🤝 Contributing

This is a personal project, but improvements are welcome!

**To contribute:**
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

**Guidelines:**
- Follow TypeScript conventions
- Add comments for complex logic
- Update documentation
- Keep commits atomic and descriptive
- Run linter: `npm run lint`

---

## 📝 License

This project is licensed under the MIT License.

---

## 🔗 Quick Links

- 🌐 **Next.js**: https://nextjs.org/docs
- 📖 **Convex**: https://docs.convex.dev
- 🎥 **Stream.io**: https://getstream.io/video/docs/
- 🔐 **Clerk**: https://clerk.com/docs
- 🎨 **Radix UI**: https://www.radix-ui.com
- 📚 **Monaco Editor**: https://microsoft.github.io/monaco-editor/

---

## 🎯 Roadmap

- [ ] Add more programming languages (C++, Go, Rust)
- [ ] AI-powered interview feedback
- [ ] Video playback with synchronized code timeline
- [ ] Interview analytics and insights
- [ ] Custom question builder
- [ ] Interview templates
- [ ] Multi-participant interviews
- [ ] Mobile app support
- [ ] Integration with calendar services
- [ ] Automated interview scheduling
- [ ] Code review annotations
- [ ] Performance metrics tracking

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) - React framework
- [Convex](https://convex.dev) - Real-time backend
- [Stream.io](https://getstream.io) - Video SDK
- [Clerk](https://clerk.com) - Authentication
- [Radix UI](https://www.radix-ui.com) - UI components
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - Code editor

---

<div align="center">

**Built with ❤️ for better technical interviews**

*CodeMeet - Making technical interviews more efficient and collaborative*

</div>
