import { useState, useEffect } from 'react';

const STORAGE_KEY = 'bookmarks';

const defaultBookmarks = [
  {
    id: '1',
    title: 'GitHub',
    url: 'https://github.com',
    description: 'Where the world builds software',
    category: 'Development',
    tags: ['coding', 'repository', 'git'],
    favicon: 'https://github.com/favicon.ico',
    isFavorite: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Stack Overflow',
    url: 'https://stackoverflow.com',
    description: 'Developer Q&A community',
    category: 'Development',
    tags: ['coding', 'help', 'community'],
    favicon: 'https://stackoverflow.com/favicon.ico',
    isFavorite: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Dribbble',
    url: 'https://dribbble.com',
    description: 'Design inspiration and portfolio',
    category: 'Design',
    tags: ['design', 'inspiration', 'portfolio'],
    favicon: 'https://dribbble.com/favicon.ico',
    isFavorite: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'YouTube',
    url: 'https://youtube.com',
    description: 'Video sharing platform',
    category: 'Entertainment',
    tags: ['video', 'learning', 'entertainment'],
    favicon: 'https://youtube.com/favicon.ico',
    isFavorite: false,
    createdAt: new Date().toISOString(),
  },
];

export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBookmarks = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setBookmarks(JSON.parse(stored));
        } else {
          setBookmarks(defaultBookmarks);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultBookmarks));
        }
      } catch (error) {
        console.error('Error loading bookmarks:', error);
        setBookmarks(defaultBookmarks);
      } finally {
        setLoading(false);
      }
    };

    loadBookmarks();
  }, []);

  const saveBookmarks = (newBookmarks) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newBookmarks));
      setBookmarks(newBookmarks);
    } catch (error) {
      console.error('Error saving bookmarks:', error);
    }
  };

  // ✨ UPDATED: Add bookmark with project support
  const addBookmark = (bookmark, projectIds = []) => {
    const newBookmark = {
      ...bookmark,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      isFavorite: bookmark.isFavorite || false,
    };
    const newBookmarks = [...bookmarks, newBookmark];
    saveBookmarks(newBookmarks);
    
    // Return the bookmark ID for project integration
    return newBookmark.id;
  };

  // ✨ NEW: Create bookmark specifically for project
  const createBookmarkForProject = (bookmarkData) => {
    return addBookmark(bookmarkData);
  };

  const updateBookmark = (id, updatedBookmark) => {
    const newBookmarks = bookmarks.map(bookmark =>
      bookmark.id === id ? { ...bookmark, ...updatedBookmark } : bookmark
    );
    saveBookmarks(newBookmarks);
  };

  const deleteBookmark = (id) => {
    const newBookmarks = bookmarks.filter(bookmark => bookmark.id !== id);
    saveBookmarks(newBookmarks);
  };

  const deleteAllBookmarks = () => {
    saveBookmarks([]);
  };

  const toggleFavorite = (id) => {
    const newBookmarks = bookmarks.map(bookmark =>
      bookmark.id === id ? { ...bookmark, isFavorite: !bookmark.isFavorite } : bookmark
    );
    saveBookmarks(newBookmarks);
  };

  // ✨ NEW: Get bookmark by ID
  const getBookmarkById = (id) => {
    return bookmarks.find(bookmark => bookmark.id === id);
  };

  // ✨ NEW: Get bookmarks by IDs (for project display)
  const getBookmarksByIds = (ids) => {
    return bookmarks.filter(bookmark => ids.includes(bookmark.id));
  };

  const exportBookmarks = (format = 'json') => {
    if (format === 'json') {
      const dataStr = JSON.stringify(bookmarks, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', 'bookmarks.json');
      linkElement.click();
    } else if (format === 'html') {
      const htmlContent = generateBookmarksHTML(bookmarks);
      const dataUri = 'data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent);
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', 'bookmarks.html');
      linkElement.click();
    }
  };

  const generateBookmarksHTML = (bookmarks) => {
    const categorizedBookmarks = bookmarks.reduce((acc, bookmark) => {
      const category = bookmark.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(bookmark);
      return acc;
    }, {});

    let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html;charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
`;

    Object.keys(categorizedBookmarks).forEach(category => {
      html += `    <DT><H3 FOLDED>${category}</H3>
    <DL><p>
`;
      categorizedBookmarks[category].forEach(bookmark => {
        const addDate = Math.floor(new Date(bookmark.createdAt).getTime() / 1000);
        html += `        <DT><A HREF="${bookmark.url}" ADD_DATE="${addDate}"${bookmark.favicon ? ` ICON="${bookmark.favicon}"` : ''}>${bookmark.title}</A>
`;
        if (bookmark.description) {
          html += `        <DD>${bookmark.description}
`;
        }
      });
      html += `    </DL><p>
`;
    });

    html += `</DL><p>`;
    return html;
  };

  const parseHTMLBookmarks = (htmlContent) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const bookmarks = [];

    // Find all bookmark links
    const links = doc.querySelectorAll('a[href]');
    links.forEach(link => {
      const url = link.getAttribute('href');
      const title = link.textContent.trim();
      const favicon = link.getAttribute('icon') || '';

      // Find category by traversing up to find the H3 element
      let category = 'Imported';
      let parent = link.parentElement;
      while (parent) {
        const h3 = parent.querySelector('h3');
        if (h3) {
          category = h3.textContent.trim();
          break;
        }
        parent = parent.parentElement;
      }

      // Find description (DD element that follows)
      let description = '';
      let nextElement = link.parentElement.nextElementSibling;
      if (nextElement && nextElement.tagName === 'DD') {
        description = nextElement.textContent.trim();
      }

      if (url && title) {
        bookmarks.push({
          title,
          url,
          description,
          category,
          tags: [],
          favicon,
          isFavorite: false,
        });
      }
    });

    return bookmarks;
  };

  const importBookmarks = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target.result;
          let importedBookmarks = [];

          if (file.name.endsWith('.json')) {
            const jsonData = JSON.parse(content);
            if (Array.isArray(jsonData)) {
              importedBookmarks = jsonData;
            } else {
              reject(new Error('Invalid JSON bookmark format'));
              return;
            }
          } else if (file.name.endsWith('.html') || file.name.endsWith('.htm')) {
            importedBookmarks = parseHTMLBookmarks(content);
          } else {
            reject(new Error('Unsupported file format'));
            return;
          }

          const processedBookmarks = importedBookmarks.map(bookmark => ({
            ...bookmark,
            id: bookmark.id || Date.now().toString() + Math.random(),
            createdAt: bookmark.createdAt || new Date().toISOString(),
          }));

          saveBookmarks([...bookmarks, ...processedBookmarks]);
          resolve(processedBookmarks.length);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsText(file);
    });
  };

  return {
    bookmarks,
    loading,
    addBookmark,
    createBookmarkForProject, // ✨ NEW
    updateBookmark,
    deleteBookmark,
    deleteAllBookmarks,
    toggleFavorite,
    getBookmarkById, // ✨ NEW
    getBookmarksByIds, // ✨ NEW
    exportBookmarks,
    importBookmarks,
  };
};