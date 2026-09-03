# Emoji Picker Feature

## Overview

The chat application now includes a beautiful emoji picker that allows users to easily add emojis to their messages. The picker features a dark theme that matches the application's design and includes search functionality for quick emoji discovery.

---

## Features

### 🎨 Visual Design
- **Dark Theme** - Matches the app's slate color scheme
- **Smooth Animation** - Picker slides in/out elegantly
- **Clean Interface** - Modern, uncluttered design
- **Responsive** - Works on all screen sizes

### 🔍 Functionality
- **Search Emojis** - Type to find specific emojis
- **Categories** - Browse by emoji categories
- **Skin Tones** - Select preferred skin tone
- **Recently Used** - Quick access to frequently used emojis
- **Click Outside to Close** - Intuitive close behavior

---

## How to Use

### Opening the Emoji Picker

1. Navigate to an active conversation
2. Look for the **smiley face icon** (😊) at the right side of the message input
3. Click the icon to open the emoji picker

### Selecting an Emoji

**Method 1: Browse**
1. Open the emoji picker
2. Scroll through the available emojis
3. Click any emoji to insert it into your message

**Method 2: Search**
1. Open the emoji picker
2. Type in the search box (e.g., "smile", "heart", "fire")
3. Click the emoji you want from the search results

**Method 3: Categories**
1. Open the emoji picker
2. Click on category tabs at the top
3. Select an emoji from that category

### Closing the Emoji Picker

The picker will automatically close when:
- You select an emoji
- You click outside the picker
- You press ESC key (if implemented)

### Sending Messages with Emojis

1. Type your message text
2. Add emojis using the picker
3. Mix text and emojis as desired
4. Press Enter or click Send button

**Example:**
```
Hey there! 👋 How are you doing today? 😊
```

---

## Keyboard Shortcuts

- **Enter** - Send message (Shift+Enter for new line)
- **Click emoji button** - Toggle picker
- **Click outside** - Close picker

---

## Technical Implementation

### Package Used
```json
{
  "emoji-picker-react": "^4.19.4"
}
```

### Key Components

**State Management:**
```typescript
const [showEmojiPicker, setShowEmojiPicker] = useState(false);
const emojiPickerRef = useRef<HTMLDivElement | null>(null);
```

**Emoji Selection Handler:**
```typescript
const onEmojiClick = (emojiData: EmojiClickData) => {
  setText((prevText) => prevText + emojiData.emoji);
  setShowEmojiPicker(false);
};
```

**Outside Click Detection:**
```typescript
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (emojiPickerRef.current && 
        !emojiPickerRef.current.contains(event.target as Node)) {
      setShowEmojiPicker(false);
    }
  };

  if (showEmojiPicker) {
    document.addEventListener("mousedown", handleClickOutside);
  }

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [showEmojiPicker]);
```

---

## Styling

### Picker Configuration
```typescript
<EmojiPicker
  onEmojiClick={onEmojiClick}
  theme="dark"              // Matches app theme
  searchDisabled={false}    // Enable search
  skinTonesDisabled={false} // Enable skin tones
  width={350}               // Optimal width
  height={400}              // Good viewing area
/>
```

### Position
- **Location**: Bottom-right of chat window
- **Z-index**: 50 (appears above other elements)
- **Responsive**: Adjusts on mobile devices

---

## Browser Support

The emoji picker works on:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

### Native Emoji Support
Emojis are rendered using the operating system's native emoji set:
- **Windows**: Windows 11 emoji style
- **macOS**: Apple emoji style
- **iOS**: Apple emoji style
- **Android**: Google emoji style

---

## Tips & Best Practices

### For Users
1. **Search is Fast** - Type keywords to quickly find emojis
2. **Recents Tab** - Your frequently used emojis appear first
3. **Mix Freely** - Combine text and emojis naturally
4. **Don't Overdo** - Use emojis to enhance, not replace text
5. **Cultural Awareness** - Some emojis have different meanings in different cultures

### For Developers
1. **Performance** - Picker loads on demand, not at page load
2. **Accessibility** - Consider adding aria-labels
3. **Customization** - Theme and size can be adjusted
4. **Mobile** - Test on touch devices
5. **Updates** - Keep emoji-picker-react package updated for new emojis

---

## Common Issues & Solutions

### Picker Doesn't Open
**Problem**: Clicking button does nothing  
**Solution**: Check browser console for errors; ensure React state is updating

### Picker Appears Behind Elements
**Problem**: Picker is covered by other UI elements  
**Solution**: Increase z-index value or adjust stacking context

### Emojis Look Different
**Problem**: Emojis appear differently on different devices  
**Solution**: This is normal - each OS has its own emoji style

### Search Not Working
**Problem**: Search doesn't find emojis  
**Solution**: Ensure `searchDisabled={false}` in EmojiPicker props

### Mobile Layout Issues
**Problem**: Picker is too large on mobile  
**Solution**: Add responsive width/height or use CSS media queries

---

## Future Enhancements

Potential improvements for the emoji feature:

- [ ] Custom emoji sets (Slack-style custom emojis)
- [ ] Emoji reactions to messages
- [ ] Animated emoji (GIF emojis)
- [ ] Emoji suggestions while typing
- [ ] Favorite emojis section
- [ ] Emoji stats (most used)
- [ ] Keyboard navigation within picker
- [ ] Multiple skin tone memory

---

## Examples

### Simple Message
```
Hello! 👋
```

### Emotional Expression
```
I'm so happy! 😊🎉✨
```

### Mixed Content
```
Great job on the project! 🚀 
Looking forward to tomorrow's meeting 📅
```

### Conversation Starters
```
Good morning! ☀️☕
How's your day going? 🤔
```

---

## Accessibility

### Current Features
- Click-based interaction
- Visual feedback on hover
- Clear button styling

### Recommended Improvements
- Add keyboard navigation
- Include aria-labels for screen readers
- Support for high contrast mode
- Focus management

---

## Related Documentation

- [Features Documentation](FEATURES.md) - Complete feature list
- [Frontend README](../chat-app-frontend/README.md) - Component details
- [Contributing Guide](../CONTRIBUTING.md) - How to contribute

---

## Package Documentation

For more details about the emoji picker component:
- [emoji-picker-react on npm](https://www.npmjs.com/package/emoji-picker-react)
- [GitHub Repository](https://github.com/ealush/emoji-picker-react)

---

**Enjoy expressing yourself with emojis! 😊🎉**
