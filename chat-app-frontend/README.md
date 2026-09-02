# Chat App - Frontend

Modern Next.js frontend with real-time messaging capabilities.

---

## Tech Stack

- **Framework**: Next.js 16.2 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Custom components with React Icons
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client
- **State Management**: React Hooks

---

## Project Structure

```
chat-app-frontend/
├── app/
│   ├── components/
│   │   └── Header.tsx           # Navigation header
│   ├── contacts/
│   │   └── page.tsx             # Contacts directory
│   ├── home/
│   │   └── page.tsx             # Main chat interface
│   ├── login/
│   │   └── page.tsx             # Login page
│   ├── signup/
│   │   └── page.tsx             # Registration page
│   ├── profile/
│   │   └── page.tsx             # User profile
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Landing page
│   └── globals.css              # Global styles
├── src/
│   ├── components/
│   │   └── Header.tsx           # Shared header component
│   └── logo/
│       └── chat-we.png          # Application logo
├── public/                      # Static assets
├── .next/                       # Next.js build output
├── next.config.ts               # Next.js configuration
├── tailwind.config.ts           # Tailwind configuration
├── tsconfig.json                # TypeScript configuration
└── README.md
```

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables (Optional)

Create `.env.local` if you need custom API URLs:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### 3. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

---

## Features

### Authentication
- User registration with validation
- Login with email/password
- JWT token storage in localStorage
- Protected routes

### Real-Time Chat
- Instant message delivery
- Socket.IO integration
- Message history
- Conversation list

### User Presence
- Online/offline status indicators
- Last seen timestamps
- Real-time status updates

### Typing Indicators
- Show when others are typing
- Animated typing bubbles
- Auto-hide after inactivity

### Responsive Design
- Mobile-first approach
- Tablet and desktop layouts
- Smooth animations
- Custom scrollbars

---

## Pages

### `/` - Landing Page
Welcome page with navigation to login/signup

### `/signup` - Registration
- Name, email, password fields
- Form validation
- Redirect to home after signup

### `/login` - Login
- Email, password fields
- JWT token storage
- Redirect to home after login

### `/home` - Main Chat Interface
- Conversation sidebar
- Active chat window
- Message input with typing indicators
- Real-time updates

### `/contacts` - Contacts Directory
- Search users by name/email
- Start new conversations
- View all registered users

### `/profile` - User Profile
- View user information
- Update profile (coming soon)

---

## Components

### Header
- Navigation menu
- Logo
- Links to all pages
- Gradient styling

### Conversation List
- All user conversations
- Last message preview
- Online status indicators
- Last active time

### Chat Window
- Message history
- Typing indicators
- Message input
- Auto-scroll to bottom

### Contact Card
- User information
- Start conversation button
- Avatar with initials

---

## Styling

### Tailwind CSS
Custom configuration with:
- Dark theme (slate colors)
- Gradient utilities
- Custom animations
- Responsive breakpoints

### Color Scheme
- Background: `slate-950`
- Cards: `slate-900`
- Borders: `slate-800`
- Text: `slate-100`, `slate-400`, `slate-500`
- Accent: `blue-500`, `indigo-600`, `purple-600`

### Custom Scrollbar
```css
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #475569 #1e293b;
}
```

---

## State Management

Using React hooks for state:
- `useState` - Local component state
- `useEffect` - Side effects and Socket.IO
- `useRef` - Message scroll and typing timeout
- `useRouter` - Navigation

### Key State Variables
- `messages` - Current conversation messages
- `conversations` - All user conversations
- `typingUsers` - Set of users currently typing
- `socket` - Socket.IO client instance

---

## API Integration

### Base URL
```typescript
const API_URL = "http://localhost:5000/api";
```

### Axios Configuration
```typescript
const token = localStorage.getItem("token");
axios.get(url, {
  headers: { Authorization: `Bearer ${token}` }
});
```

---

## Socket.IO Integration

### Connection
```typescript
const socket = io("http://localhost:5000");
socket.emit("setup", userId);
```

### Event Handlers
- `user_status_changed` - Update user online status
- `new_message` - Receive new messages
- `user_typing` - Show typing indicator
- `user_stop_typing` - Hide typing indicator

---

## TypeScript

### Key Types
```typescript
interface User {
  _id: string;
  name: string;
  email: string;
  isOnline: boolean;
  lastSeen: Date;
}

interface Message {
  _id: string;
  conversation: string;
  sender: User | string;
  text: string;
  createdAt: Date;
}

interface Conversation {
  _id: string;
  participants: User[];
  lastMessage?: Message;
  isGroup: boolean;
  groupName?: string;
}
```

---

## Development

### Hot Reload
Next.js Fast Refresh automatically updates:
- React components
- CSS changes
- TypeScript files

### Browser Console
Check for:
- Socket.IO connection status
- API request/response
- State updates
- Errors and warnings

### Network Tab
Monitor:
- API calls
- WebSocket connections
- Response times
- Failed requests

---

## Troubleshooting

### Can't Connect to Backend
- Verify backend is running on port 5000
- Check CORS settings in backend
- Inspect browser console for errors

### Socket.IO Not Working
- Check Socket.IO connection in Network tab
- Verify user ID is being sent in setup
- Ensure conversation room is joined

### Messages Not Appearing
- Check duplicate prevention logic
- Verify message structure matches backend
- Look for console errors

### Styling Issues
- Clear `.next` build cache
- Restart dev server
- Check Tailwind configuration

---

## Build for Production

```bash
# Build optimized production bundle
npm run build

# Start production server
npm start
```

### Production Checklist
- [ ] Update API URLs to production backend
- [ ] Remove console.log statements
- [ ] Test all features
- [ ] Optimize images
- [ ] Add error boundaries
- [ ] Configure environment variables

---

## Performance

### Optimizations
- Next.js automatic code splitting
- Image optimization with Next.js Image
- Lazy loading components
- Debounced search inputs
- Memoized callbacks

### Monitoring
- Check Lighthouse scores
- Monitor bundle size
- Profile React components
- Test on slow networks

---

## Accessibility

- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation
- Focus indicators
- Color contrast ratios

---

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Contributing

1. Follow TypeScript best practices
2. Use existing component patterns
3. Test responsive design
4. Update documentation

---

## License

MIT License - See LICENSE file for details
