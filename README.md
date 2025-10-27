# MyApps
Simple app to have bookmarks and web launcher for each of them.

## Features

- 📚 **Add, Edit, Delete Bookmarks**: Full CRUD functionality for managing your apps
- 🔍 **Search**: Real-time search across bookmark names, URLs, and descriptions
- 💾 **Persistent Storage**: Bookmarks are saved in your browser's localStorage
- 📱 **Responsive Design**: Works beautifully on desktop, tablet, and mobile
- 🎨 **Modern UI**: Clean, gradient design with smooth animations
- ⚡ **Fast & Lightweight**: Pure JavaScript, no framework dependencies

## Quick Start

Simply open `index.html` in your web browser to start using the bookmark manager!

### Local Development

```bash
# Serve the app with Python
python3 -m http.server 8080

# Or with Node.js
npx http-server -p 8080

# Then open http://localhost:8080 in your browser
```

## Usage

1. **Add a Bookmark**: Click the "+ Add Bookmark" button and fill in the name, URL, and optional description
2. **Edit a Bookmark**: Click the "Edit" button on any bookmark card
3. **Delete a Bookmark**: Click the "Delete" button on any bookmark card
4. **Search Bookmarks**: Type in the search box to filter bookmarks by name, URL, or description
5. **Open a Bookmark**: Click anywhere on a bookmark card (except the Edit/Delete buttons) to open it in a new tab

## Technical Stack

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with flexbox and grid
- **JavaScript (ES6+)**: Vanilla JavaScript with classes
- **LocalStorage API**: Client-side data persistence
