import { books, authors, genres, BOOKS_PER_PAGE } from './data.js'

/**
 * Book Preview Web Component
 * A custom element that displays a book preview with image, title, and author
 */
class BookPreview extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['author', 'id', 'image', 'title', 'author-name'];
  }

  connectedCallback() {
    this.render();
    this.addEventListeners();
  }

  attributeChangedCallback() {
    this.render();
  }

  disconnectedCallback() {
    this.removeEventListeners();
  }

  addEventListeners() {
    this.button = this.shadowRoot.querySelector('.preview');
    if (this.button) {
      this.button.addEventListener('click', this.handleClick.bind(this));
    }
  }

  removeEventListeners() {
    if (this.button) {
      this.button.removeEventListener('click', this.handleClick.bind(this));
    }
  }

  handleClick(event) {
    // Dispatch a custom event that bubbles up to parent elements
    this.dispatchEvent(new CustomEvent('preview-click', {
      bubbles: true,
      composed: true, // Allows the event to cross the shadow DOM boundary
      detail: {
        bookId: this.getAttribute('id')
      }
    }));
  }

  render() {
    const author = this.getAttribute('author');
    const id = this.getAttribute('id');
    const image = this.getAttribute('image');
    const title = this.getAttribute('title');
    const authorName = this.getAttribute('author-name');

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
        }
        
        .preview {
          border-width: 0;
          width: 100%;
          font-family: Roboto, sans-serif;
          padding: 0.5rem 1rem;
          display: flex;
          align-items: center;
          cursor: pointer;
          text-align: left;
          border-radius: 8px;
          border: 1px solid rgba(var(--color-dark, 10, 10, 20), 0.15);
          background: rgba(var(--color-light, 255, 255, 255), 1);
        }
        
        @media (min-width: 60rem) {
          .preview {
            padding: 1rem;
          }
        }
        
        .preview:hover {
          background: rgba(var(--color-blue, 0, 150, 255), 0.05);
        }
        
        .preview__image {
          width: 48px;
          height: 70px;
          object-fit: cover;
          background: grey;
          border-radius: 2px;
          box-shadow: 0px 2px 1px -1px rgba(0, 0, 0, 0.2),
            0px 1px 1px 0px rgba(0, 0, 0, 0.1), 0px 1px 3px 0px rgba(0, 0, 0, 0.1);
        }
        
        .preview__info {
          padding: 1rem;
        }
        
        .preview__title {
          margin: 0 0 0.5rem;
          font-weight: bold;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;  
          overflow: hidden;
          color: rgba(var(--color-dark, 10, 10, 20), 0.8)
        }
        
        .preview__author {
          color: rgba(var(--color-dark, 10, 10, 20), 0.4);
        }
      </style>
      
      <button class="preview" data-preview="${id}">
        <img
          class="preview__image"
          src="${image}"
          alt="Cover for ${title}"
        />
        
        <div class="preview__info">
          <h3 class="preview__title">${title}</h3>
          <div class="preview__author">${authorName}</div>
        </div>
      </button>
    `;
  }
}

// Register the custom element
customElements.define('book-preview', BookPreview);

/**
 * Book Connect Application
 * A modular application for browsing and searching books.
 * Refactored to use Web Components for book previews.
 */
const BookConnect = {
  /**
   * State management for the application
   */
  state: {
    page: 1,
    matches: books,
    currentTheme: 'day'
  },

  /**
   * DOM element selectors used throughout the application
   */
  selectors: {
    listItems: '[data-list-items]',
    searchGenres: '[data-search-genres]',
    searchAuthors: '[data-search-authors]',
    settingsTheme: '[data-settings-theme]',
    listButton: '[data-list-button]',
    listMessage: '[data-list-message]',
    searchOverlay: '[data-search-overlay]',
    settingsOverlay: '[data-settings-overlay]',
    listActive: '[data-list-active]',
    searchCancel: '[data-search-cancel]',
    settingsCancel: '[data-settings-cancel]',
    headerSearch: '[data-header-search]',
    headerSettings: '[data-header-settings]',
    listClose: '[data-list-close]',
    settingsForm: '[data-settings-form]',
    searchForm: '[data-search-form]',
    searchTitle: '[data-search-title]',
    listBlur: '[data-list-blur]',
    listImage: '[data-list-image]',
    listTitle: '[data-list-title]',
    listSubtitle: '[data-list-subtitle]',
    listDescription: '[data-list-description]'
  },

  /**
   * Initialize the application
   */
  init() {
    this.renderBooks();
    this.populateFilterOptions();
    this.setInitialTheme();
    this.updateShowMoreButton();
    this.setupEventListeners();
  },

  /**
   * Create a book preview using the Web Component
   * @param {Object} book - Book object containing author, id, image, title
   * @returns {HTMLElement} - BookPreview Web Component
   */
  createBookPreview({ author, id, image, title }) {
    const element = document.createElement('book-preview');
    element.setAttribute('author', author);
    element.setAttribute('id', id);
    element.setAttribute('image', image);
    element.setAttribute('title', title);
    element.setAttribute('author-name', authors[author]);
    
    return element;
  },

  /**
   * Render books to the page based on current state
   */
  renderBooks() {
    const startIndex = (this.state.page - 1) * BOOKS_PER_PAGE;
    const endIndex = startIndex + BOOKS_PER_PAGE;
    const fragment = document.createDocumentFragment();

    for (const book of this.state.matches.slice(startIndex, endIndex)) {
      fragment.appendChild(this.createBookPreview(book));
    }

    document.querySelector(this.selectors.listItems).appendChild(fragment);
  },

  /**
   * Clear the current book list and render fresh
   */
  refreshBookList() {
    document.querySelector(this.selectors.listItems).innerHTML = '';
    this.renderBooks();
  },

  /**
   * Create an option element for dropdowns
   * @param {string} value - Value for the option
   * @param {string} text - Display text for the option
   * @returns {HTMLElement} - Option element
   */
  createOptionElement(value, text) {
    const element = document.createElement('option');
    element.value = value;
    element.innerText = text;
    return element;
  },

  /**
   * Populate the genre and author filter options
   */
  populateFilterOptions() {
    // Populate genres dropdown
    const genreHtml = document.createDocumentFragment();
    genreHtml.appendChild(this.createOptionElement('any', 'All Genres'));

    for (const [id, name] of Object.entries(genres)) {
      genreHtml.appendChild(this.createOptionElement(id, name));
    }
    document.querySelector(this.selectors.searchGenres).appendChild(genreHtml);

    // Populate authors dropdown
    const authorsHtml = document.createDocumentFragment();
    authorsHtml.appendChild(this.createOptionElement('any', 'All Authors'));

    for (const [id, name] of Object.entries(authors)) {
      authorsHtml.appendChild(this.createOptionElement(id, name));
    }
    document.querySelector(this.selectors.searchAuthors).appendChild(authorsHtml);
  },

  /**
   * Set theme based on user preference
   * @param {string} theme - Theme to set ('day' or 'night')
   */
  setTheme(theme) {
    this.state.currentTheme = theme;
    
    if (theme === 'night') {
      document.documentElement.style.setProperty('--color-dark', '255, 255, 255');
      document.documentElement.style.setProperty('--color-light', '10, 10, 20');
    } else {
      document.documentElement.style.setProperty('--color-dark', '10, 10, 20');
      document.documentElement.style.setProperty('--color-light', '255, 255, 255');
    }
    
    document.querySelector(this.selectors.settingsTheme).value = theme;
  },

  /**
   * Set initial theme based on system preference
   */
  setInitialTheme() {
    const prefersDarkMode = window.matchMedia && 
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    this.setTheme(prefersDarkMode ? 'night' : 'day');
  },

  /**
   * Update the "Show more" button text and state
   */
  updateShowMoreButton() {
    const remainingBooks = this.state.matches.length - (this.state.page * BOOKS_PER_PAGE);
    const remainingText = remainingBooks > 0 ? remainingBooks : 0;
    
    const button = document.querySelector(this.selectors.listButton);
    button.disabled = remainingBooks <= 0;
    button.innerHTML = `
      <span>Show more</span>
      <span class="list__remaining"> (${remainingText})</span>
    `;
  },

  /**
   * Filter books based on search criteria
   * @param {Object} filters - Object containing title, author, and genre filters
   * @returns {Array} - Filtered books
   */
  filterBooks(filters) {
    return books.filter(book => {
      // Check if title matches
      const titleMatch = filters.title.trim() === '' || 
        book.title.toLowerCase().includes(filters.title.toLowerCase());
      
      // Check if author matches
      const authorMatch = filters.author === 'any' || book.author === filters.author;
      
      // Check if any genre matches
      let genreMatch = filters.genre === 'any';
      if (!genreMatch) {
        for (const singleGenre of book.genres) {
          if (singleGenre === filters.genre) {
            genreMatch = true;
            break;
          }
        }
      }
      
      return titleMatch && authorMatch && genreMatch;
    });
  },

  /**
   * Find a book by its ID
   * @param {string} id - Book ID to search for
   * @returns {Object|null} - Book object if found, null otherwise
   */
  findBookById(id) {
    return books.find(book => book.id === id) || null;
  },

  /**
   * Display book details in the overlay
   * @param {Object} book - Book object to display
   */
  showBookDetails(book) {
    if (!book) return;
    
    document.querySelector(this.selectors.listActive).open = true;
    document.querySelector(this.selectors.listBlur).src = book.image;
    document.querySelector(this.selectors.listImage).src = book.image;
    document.querySelector(this.selectors.listTitle).innerText = book.title;
    document.querySelector(this.selectors.listSubtitle).innerText = 
      `${authors[book.author]} (${new Date(book.published).getFullYear()})`;
    document.querySelector(this.selectors.listDescription).innerText = book.description;
  },

  /**
   * Set up all event listeners for the application
   */
  setupEventListeners() {
    // Cancel search overlay
    document.querySelector(this.selectors.searchCancel).addEventListener('click', () => {
      document.querySelector(this.selectors.searchOverlay).open = false;
    });

    // Cancel settings overlay
    document.querySelector(this.selectors.settingsCancel).addEventListener('click', () => {
      document.querySelector(this.selectors.settingsOverlay).open = false;
    });

    // Open search overlay
    document.querySelector(this.selectors.headerSearch).addEventListener('click', () => {
      document.querySelector(this.selectors.searchOverlay).open = true;
      document.querySelector(this.selectors.searchTitle).focus();
    });

    // Open settings overlay
    document.querySelector(this.selectors.headerSettings).addEventListener('click', () => {
      document.querySelector(this.selectors.settingsOverlay).open = true;
    });

    // Close book details
    document.querySelector(this.selectors.listClose).addEventListener('click', () => {
      document.querySelector(this.selectors.listActive).open = false;
    });

    // Settings form submission
    document.querySelector(this.selectors.settingsForm).addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(event.target);
      const { theme } = Object.fromEntries(formData);
      
      this.setTheme(theme);
      document.querySelector(this.selectors.settingsOverlay).open = false;
    });

    // Search form submission
    document.querySelector(this.selectors.searchForm).addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(event.target);
      const filters = Object.fromEntries(formData);
      
      // Reset to page 1 and update matches
      this.state.page = 1;
      this.state.matches = this.filterBooks(filters);
      
      // Show/hide "no results" message
      if (this.state.matches.length < 1) {
        document.querySelector(this.selectors.listMessage).classList.add('list__message_show');
      } else {
        document.querySelector(this.selectors.listMessage).classList.remove('list__message_show');
      }
      
      this.refreshBookList();
      this.updateShowMoreButton();
      
      window.scrollTo({top: 0, behavior: 'smooth'});
      document.querySelector(this.selectors.searchOverlay).open = false;
    });

    // Show more button
    document.querySelector(this.selectors.listButton).addEventListener('click', () => {
      this.state.page += 1;
      this.renderBooks();
      this.updateShowMoreButton();
    });

    // Book preview click event (using event delegation with custom events)
    document.querySelector(this.selectors.listItems).addEventListener('preview-click', (event) => {
      const bookId = event.detail.bookId;
      const book = this.findBookById(bookId);
      if (book) {
        this.showBookDetails(book);
      }
    });
  }
};

// Initialize the application when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  BookConnect.init();
});
