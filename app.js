// Bookmark Manager App
class BookmarkManager {
    constructor() {
        this.bookmarks = this.loadBookmarks();
        this.currentEditId = null;
        this.initializeElements();
        this.attachEventListeners();
        this.renderBookmarks();
    }

    initializeElements() {
        this.modal = document.getElementById('bookmarkModal');
        this.addBookmarkBtn = document.getElementById('addBookmarkBtn');
        this.closeBtn = document.querySelector('.close');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.bookmarkForm = document.getElementById('bookmarkForm');
        this.searchInput = document.getElementById('searchInput');
        this.bookmarksGrid = document.getElementById('bookmarksGrid');
        this.modalTitle = document.getElementById('modalTitle');
    }

    attachEventListeners() {
        // Open modal for adding new bookmark
        this.addBookmarkBtn.addEventListener('click', () => this.openModal());

        // Close modal
        this.closeBtn.addEventListener('click', () => this.closeModal());
        this.cancelBtn.addEventListener('click', () => this.closeModal());

        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target === this.modal) {
                this.closeModal();
            }
        });

        // Form submission
        this.bookmarkForm.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Search functionality
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
    }

    loadBookmarks() {
        const stored = localStorage.getItem('myAppsBookmarks');
        if (stored) {
            return JSON.parse(stored);
        }
        // Return some default bookmarks for first-time users
        return [
            {
                id: this.generateId(),
                name: 'GitHub',
                url: 'https://github.com',
                description: 'Code hosting and collaboration platform'
            },
            {
                id: this.generateId(),
                name: 'Google',
                url: 'https://google.com',
                description: 'Search engine and productivity tools'
            }
        ];
    }

    saveBookmarks() {
        localStorage.setItem('myAppsBookmarks', JSON.stringify(this.bookmarks));
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }

    openModal(bookmark = null) {
        if (bookmark) {
            // Edit mode
            this.currentEditId = bookmark.id;
            this.modalTitle.textContent = 'Edit Bookmark';
            document.getElementById('bookmarkName').value = bookmark.name;
            document.getElementById('bookmarkUrl').value = bookmark.url;
            document.getElementById('bookmarkDescription').value = bookmark.description || '';
        } else {
            // Add mode
            this.currentEditId = null;
            this.modalTitle.textContent = 'Add Bookmark';
            this.bookmarkForm.reset();
        }
        this.modal.style.display = 'block';
    }

    closeModal() {
        this.modal.style.display = 'none';
        this.bookmarkForm.reset();
        this.currentEditId = null;
    }

    handleFormSubmit(e) {
        e.preventDefault();

        const name = document.getElementById('bookmarkName').value.trim();
        const url = document.getElementById('bookmarkUrl').value.trim();
        const description = document.getElementById('bookmarkDescription').value.trim();

        if (this.currentEditId) {
            // Edit existing bookmark
            const index = this.bookmarks.findIndex(b => b.id === this.currentEditId);
            if (index !== -1) {
                this.bookmarks[index] = {
                    ...this.bookmarks[index],
                    name,
                    url,
                    description
                };
            }
        } else {
            // Add new bookmark
            const newBookmark = {
                id: this.generateId(),
                name,
                url,
                description
            };
            this.bookmarks.push(newBookmark);
        }

        this.saveBookmarks();
        this.renderBookmarks();
        this.closeModal();
    }

    deleteBookmark(id) {
        if (confirm('Are you sure you want to delete this bookmark?')) {
            this.bookmarks = this.bookmarks.filter(b => b.id !== id);
            this.saveBookmarks();
            this.renderBookmarks();
        }
    }

    handleSearch(query) {
        const filtered = this.bookmarks.filter(bookmark => {
            const searchTerm = query.toLowerCase();
            return (
                bookmark.name.toLowerCase().includes(searchTerm) ||
                bookmark.url.toLowerCase().includes(searchTerm) ||
                (bookmark.description && bookmark.description.toLowerCase().includes(searchTerm))
            );
        });
        this.renderBookmarks(filtered);
    }

    openBookmark(url) {
        window.open(url, '_blank');
    }

    renderBookmarks(bookmarksToRender = null) {
        const bookmarksToDisplay = bookmarksToRender || this.bookmarks;

        if (bookmarksToDisplay.length === 0) {
            this.bookmarksGrid.innerHTML = `
                <div class="empty-state">
                    <h2>No bookmarks found</h2>
                    <p>${bookmarksToRender ? 'Try a different search term' : 'Click "Add Bookmark" to get started!'}</p>
                </div>
            `;
            return;
        }

        this.bookmarksGrid.innerHTML = bookmarksToDisplay.map(bookmark => `
            <div class="bookmark-card" data-bookmark-id="${this.escapeHtml(bookmark.id)}">
                <h3>${this.escapeHtml(bookmark.name)}</h3>
                <div class="url" title="${this.escapeHtml(bookmark.url)}">${this.escapeHtml(bookmark.url)}</div>
                ${bookmark.description ? `<div class="description">${this.escapeHtml(bookmark.description)}</div>` : ''}
                <div class="bookmark-actions">
                    <button class="btn-edit" data-bookmark-id="${this.escapeHtml(bookmark.id)}">Edit</button>
                    <button class="btn-delete" data-bookmark-id="${this.escapeHtml(bookmark.id)}">Delete</button>
                </div>
            </div>
        `).join('');

        // Add click handlers using event delegation
        document.querySelectorAll('.bookmark-card').forEach((card) => {
            const bookmarkId = card.dataset.bookmarkId;
            const bookmark = this.bookmarks.find(b => b.id === bookmarkId);
            
            card.addEventListener('click', (e) => {
                // Don't open if clicking on buttons
                if (!e.target.classList.contains('btn-edit') && 
                    !e.target.classList.contains('btn-delete')) {
                    this.openBookmark(bookmark.url);
                }
            });
        });

        // Add edit button handlers
        document.querySelectorAll('.btn-edit').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const bookmarkId = btn.dataset.bookmarkId;
                const bookmark = this.bookmarks.find(b => b.id === bookmarkId);
                this.openModal(bookmark);
            });
        });

        // Add delete button handlers
        document.querySelectorAll('.btn-delete').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const bookmarkId = btn.dataset.bookmarkId;
                this.deleteBookmark(bookmarkId);
            });
        });
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return String(text).replace(/[&<>"']/g, m => map[m]);
    }
}

// Initialize the app when DOM is ready
let bookmarkManager;
document.addEventListener('DOMContentLoaded', () => {
    bookmarkManager = new BookmarkManager();
});
