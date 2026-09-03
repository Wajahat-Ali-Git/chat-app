# Contributing to ChatWe

Thank you for your interest in contributing to ChatWe! This document provides guidelines and instructions for contributing to the project.

---

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other contributors

---

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates.

**When submitting a bug report, include:**
- Clear, descriptive title
- Steps to reproduce the issue
- Expected behavior vs actual behavior
- Screenshots if applicable
- Environment details (OS, browser, Node version)

**Example:**
```markdown
**Bug:** Messages appear twice when sent

**Steps to Reproduce:**
1. Log in as User A
2. Send a message to User B
3. Message appears twice in conversation

**Expected:** Message should appear once
**Actual:** Message appears twice

**Environment:**
- OS: Windows 11
- Browser: Chrome 120
- Node: v18.17.0
```

---

### Suggesting Features

Feature suggestions are welcome! Please provide:
- Clear description of the feature
- Use case and benefits
- Possible implementation approach
- Any relevant examples or mockups

---

### Pull Requests

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/chat-app.git
   cd chat-app
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Write clean, readable code
   - Follow existing code style
   - Add comments for complex logic
   - Update documentation if needed

4. **Test your changes**
   - Test manually in browser
   - Ensure no breaking changes
   - Test on different screen sizes
   - Verify real-time features work

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add: brief description of your changes"
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Open a Pull Request**
   - Use a clear, descriptive title
   - Reference any related issues
   - Describe what changes were made and why
   - Include screenshots for UI changes

---

## Development Setup

See [docs/SETUP.md](docs/SETUP.md) for detailed setup instructions.

**Quick Start:**
```bash
# Backend
cd chat-app-backend
npm install
npm run dev

# Frontend
cd chat-app-frontend
npm install
npm run dev
```

---

## Coding Standards

### JavaScript/TypeScript

**Style Guide:**
- Use 2 spaces for indentation
- Use semicolons
- Use single quotes for strings
- Use camelCase for variables and functions
- Use PascalCase for components and classes
- Add JSDoc comments for functions

**Example:**
```typescript
/**
 * Formats a timestamp to relative time
 * @param {Date} date - The date to format
 * @returns {string} Formatted string like "5m ago"
 */
const formatLastSeen = (date: Date): string => {
  // Implementation
};
```

---

### React Components

**Structure:**
```typescript
'use client';

import { useState, useEffect } from 'react';

interface Props {
  userId: string;
}

export default function Component({ userId }: Props) {
  // State declarations
  const [data, setData] = useState([]);
  
  // Effects
  useEffect(() => {
    // Effect logic
  }, [dependency]);
  
  // Event handlers
  const handleClick = () => {
    // Handler logic
  };
  
  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

---

### CSS/Tailwind

- Use Tailwind utility classes
- Follow mobile-first approach
- Use consistent spacing (4, 8, 16, 24, etc.)
- Prefer Tailwind over custom CSS
- Extract repeated patterns into components

**Example:**
```tsx
<div className="flex items-center gap-4 p-4 rounded-lg bg-slate-900">
  {/* Content */}
</div>
```

---

### Backend Code

**Controller Example:**
```javascript
const getUsers = async (req, res) => {
  try {
    // Business logic
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

**Route Example:**
```javascript
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getUsers } = require('../controllers/userController');

router.get('/', protect, getUsers);

module.exports = router;
```

---

## Commit Message Guidelines

Use clear, descriptive commit messages:

**Format:**
```
Type: Brief description (max 50 chars)

Detailed explanation if needed (wrap at 72 chars)
```

**Types:**
- `Add:` New feature or functionality
- `Fix:` Bug fix
- `Update:` Update existing feature
- `Refactor:` Code refactoring
- `Style:` Formatting, styling changes
- `Docs:` Documentation changes
- `Test:` Adding or updating tests
- `Chore:` Maintenance tasks

**Examples:**
```
Add: typing indicators in chat

Implemented real-time typing indicators that show when
users are typing. Indicators appear in both header and
message area, with 3-second auto-hide.
```

```
Fix: duplicate messages on send

Removed manual state update in handleSend to rely on
Socket.IO events only, preventing duplicate messages.
```

---

## Testing Guidelines

### Manual Testing Checklist

**For new features:**
- [ ] Feature works as expected
- [ ] No console errors
- [ ] Works on mobile (responsive)
- [ ] Works in different browsers
- [ ] Real-time updates work correctly
- [ ] No performance issues

**For bug fixes:**
- [ ] Bug is fixed
- [ ] No new bugs introduced
- [ ] Related features still work
- [ ] Edge cases handled

---

## Areas We'd Love Help With

### High Priority
- [ ] Add message pagination
- [ ] Implement read receipts
- [ ] Add file/image upload
- [x] Create group chat functionality **✅ Completed**
  - [x] Frontend: Groups page (`app/groups/page.tsx`) with create/invite/leave functionality
  - [x] Backend: Group conversation endpoints (`POST /api/conversations/group`, `POST /api/conversations/:id/invite`, `POST /api/conversations/:id/leave`)
- [ ] Add message search

### Medium Priority
- [x] Add emoji picker **✅ Completed**
- [ ] Implement message reactions
- [ ] Add user profile editing
- [ ] Create settings page
- [ ] Add notification preferences

### Low Priority
- [ ] Add light theme
- [ ] Create custom themes
- [ ] Add message formatting (bold, italic)
- [ ] Implement GIF support
- [ ] Add link previews

### Documentation
- [ ] Add code examples
- [ ] Create video tutorials
- [ ] Improve API documentation
- [ ] Add architecture diagrams
- [ ] Write deployment guides

---

## Questions?

- Open an issue for questions
- Join our discussions
- Review existing documentation
- Check closed issues for answers

---

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to ChatWe! 🎉
