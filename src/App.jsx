import React, { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import SearchBar from './components/SearchBar';
import TagFilter from './components/TagFilter';
import BookmarkGrid from './components/BookmarkGrid';
import BookmarkForm from './components/BookmarkForm';
import BrokenLinkChecker from './components/BrokenLinkChecker';
import DuplicateDetector from './components/DuplicateDetector';
import BatchOperations from './components/BatchOperations';
import ViewToggle from './components/ViewToggle';
import ProjectManager from './components/ProjectManager';
import { useBookmarks } from './hooks/useBookmarks';
import { useTheme } from './hooks/useTheme';
import { useProjects } from './hooks/useProjects';
import './App.css';

function App() {
  const {
    bookmarks,
    loading,
    addBookmark,
    createBookmarkForProject,
    updateBookmark,
    deleteBookmark,
    deleteAllBookmarks,
    toggleFavorite,
    exportBookmarks,
    importBookmarks,
  } = useBookmarks();

  const { theme, toggleTheme } = useTheme();

  const {
    projects,
    createProject,
    updateProject,
    deleteProject,
    addBookmarkToProject,
    removeBookmarkFromProject,
    addNoteToProject,
    createNoteInProject,
    updateNoteInProject,
    deleteNoteFromProject,
    addTaskToProject,
    createTaskInProject,
    updateTaskInProject,
    toggleTaskInProject,
    deleteTaskFromProject,
    duplicateProject,
    archiveProject,
    unarchiveProject,
    exportProject,
    importProject,
    searchProjects,
    getProjectsByStatus
  } = useProjects();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true); // Default to open on desktop
  const [showBrokenLinkChecker, setShowBrokenLinkChecker] = useState(false);
  const [showDuplicateDetector, setShowDuplicateDetector] = useState(false);
  const [showBatchOperations, setShowBatchOperations] = useState(false);
  const [showProjectManager, setShowProjectManager] = useState(false);
  const [selectedBookmarks, setSelectedBookmarks] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [currentView, setCurrentView] = useState('grid');

  // Get unique categories and tags
  const categories = useMemo(() => {
    const cats = [...new Set(bookmarks.map(b => b.category))].filter(Boolean);
    return cats.sort();
  }, [bookmarks]);

  const allTags = useMemo(() => {
    const tags = bookmarks.flatMap(b => b.tags || []);
    return [...new Set(tags)].sort();
  }, [bookmarks]);

  // Filter bookmarks
  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter(bookmark => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = bookmark.title.toLowerCase().includes(searchLower) ||
          bookmark.description?.toLowerCase().includes(searchLower) ||
          bookmark.url.toLowerCase().includes(searchLower) ||
          bookmark.tags?.some(tag => tag.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Category filter
      if (selectedCategory) {
        if (selectedCategory === 'favorites') {
          if (!bookmark.isFavorite) return false;
        } else if (bookmark.category !== selectedCategory) {
          return false;
        }
      }

      // Tag filter
      if (selectedTags.length > 0) {
        const hasSelectedTag = selectedTags.some(tag => bookmark.tags?.includes(tag));
        if (!hasSelectedTag) return false;
      }

      return true;
    });
  }, [bookmarks, searchTerm, selectedCategory, selectedTags]);

  // Calculate bookmark counts
  const bookmarkCounts = useMemo(() => {
    const counts = {
      total: bookmarks.length,
      favorites: bookmarks.filter(b => b.isFavorite).length,
    };
    categories.forEach(category => {
      counts[category] = bookmarks.filter(b => b.category === category).length;
    });
    return counts;
  }, [bookmarks, categories]);

  const handleAddBookmark = () => {
    setEditingBookmark(null);
    setShowForm(true);
  };

  const handleEditBookmark = (bookmark) => {
    setEditingBookmark(bookmark);
    setShowForm(true);
  };

  const handleSaveBookmark = (bookmarkData) => {
    if (editingBookmark) {
      updateBookmark(editingBookmark.id, bookmarkData);
    } else {
      addBookmark(bookmarkData);
    }
    setShowForm(false);
    setEditingBookmark(null);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingBookmark(null);
  };

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  const handleClearTags = () => {
    setSelectedTags([]);
  };

  const handleImport = async (file) => {
    try {
      const count = await importBookmarks(file);
      alert(`Successfully imported ${count} bookmarks!`);
    } catch (error) {
      alert(`Import failed: ${error.message}`);
    }
  };

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSelectBookmark = (bookmarkId) => {
    setSelectedBookmarks(prev => 
      prev.includes(bookmarkId)
        ? prev.filter(id => id !== bookmarkId)
        : [...prev, bookmarkId]
    );
  };

  const handleToggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    if (selectionMode) {
      setSelectedBookmarks([]);
    }
  };

  const handleBatchDelete = (bookmarkIds) => {
    bookmarkIds.forEach(id => deleteBookmark(id));
    setSelectedBookmarks([]);
    setSelectionMode(false);
  };

  const handleBatchTag = (bookmarkIds, newTags) => {
    bookmarkIds.forEach(id => {
      const bookmark = bookmarks.find(b => b.id === id);
      if (bookmark) {
        const existingTags = bookmark.tags || [];
        const combinedTags = [...new Set([...existingTags, ...newTags])];
        updateBookmark(id, { tags: combinedTags });
      }
    });
    setSelectedBookmarks([]);
    setSelectionMode(false);
  };

  const handleBatchCategory = (bookmarkIds, newCategory) => {
    bookmarkIds.forEach(id => {
      updateBookmark(id, { category: newCategory });
    });
    setSelectedBookmarks([]);
    setSelectionMode(false);
  };

  const handleBatchFavorite = (bookmarkIds, isFavorite) => {
    bookmarkIds.forEach(id => {
      updateBookmark(id, { isFavorite });
    });
    setSelectedBookmarks([]);
    setSelectionMode(false);
  };

  const handleRemoveBrokenLinks = (brokenIds) => {
    brokenIds.forEach(id => deleteBookmark(id));
    setShowBrokenLinkChecker(false);
  };

  const handleRemoveDuplicates = (duplicateIds) => {
    duplicateIds.forEach(id => deleteBookmark(id));
    setShowDuplicateDetector(false);
  };

  // ✨ NEW: Enhanced project integration handlers
  const handleCreateBookmarkInProject = (projectId, bookmarkData) => {
    // Create bookmark first
    const bookmarkId = createBookmarkForProject(bookmarkData);
    
    // Then add to project
    if (bookmarkId) {
      addBookmarkToProject(projectId, bookmarkId);
    }
    
    return bookmarkId;
  };

  // ✨ FIXED: Handle multiple bookmarks addition to project
  const handleAddBookmarksToProject = (projectId, bookmarkIds) => {
    console.log('Adding bookmarks to project:', { projectId, bookmarkIds, count: bookmarkIds.length });
    
    // Add each bookmark individually to ensure all are processed
    bookmarkIds.forEach((bookmarkId, index) => {
      console.log(`Adding bookmark ${index + 1}/${bookmarkIds.length}:`, bookmarkId);
      addBookmarkToProject(projectId, bookmarkId);
    });
    
    console.log('Finished adding all bookmarks');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-secondary-600 dark:text-secondary-400">Loading bookmarks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 transition-colors">
      <Header
        onAddBookmark={handleAddBookmark}
        theme={theme}
        onToggleTheme={toggleTheme}
        onExport={exportBookmarks}
        onImport={handleImport}
        onDeleteAll={deleteAllBookmarks}
        onToggleSidebar={handleToggleSidebar}
        onShowBrokenLinkChecker={() => setShowBrokenLinkChecker(true)}
        onShowDuplicateDetector={() => setShowDuplicateDetector(true)}
        onShowBatchOperations={() => setShowBatchOperations(true)}
        onShowProjectManager={() => setShowProjectManager(true)}
        selectedBookmarks={selectedBookmarks}
        selectionMode={selectionMode}
        onToggleSelectionMode={handleToggleSelectionMode}
      />

      <div className="flex">
        <Sidebar
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          bookmarkCounts={bookmarkCounts}
          allTags={allTags}
          selectedTags={selectedTags}
          onTagToggle={handleTagToggle}
          onClearTags={handleClearTags}
          isOpen={sidebarOpen}
          onToggle={handleToggleSidebar}
        />

        <main className={`flex-1 transition-all duration-300`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="flex-1">
                  <SearchBar
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    onClear={() => setSearchTerm('')}
                  />
                </div>
                <ViewToggle
                  currentView={currentView}
                  onViewChange={setCurrentView}
                />
              </div>

              {/* ✨ Tags Filter below search bar */}
              <TagFilter
                tags={allTags}
                selectedTags={selectedTags}
                onTagToggle={handleTagToggle}
                onClearTags={handleClearTags}
              />

              {selectionMode && (
                <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
                  <p className="text-primary-700 dark:text-primary-300 text-sm">
                    Selection mode active. Click bookmarks to select them.
                    {selectedBookmarks.length > 0 && (
                      <span className="font-medium ml-2">
                        {selectedBookmarks.length} selected
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>

            <BookmarkGrid
              bookmarks={filteredBookmarks}
              onEdit={handleEditBookmark}
              onDelete={deleteBookmark}
              onToggleFavorite={toggleFavorite}
              selectedBookmarks={selectedBookmarks}
              onSelectBookmark={handleSelectBookmark}
              selectionMode={selectionMode}
              view={currentView}
            />
          </div>
        </main>
      </div>

      <AnimatePresence>
        {showForm && (
          <BookmarkForm
            bookmark={editingBookmark}
            onSave={handleSaveBookmark}
            onCancel={handleCancelForm}
            categories={categories}
            projects={projects}
            onAddToProject={addBookmarkToProject}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBrokenLinkChecker && (
          <BrokenLinkChecker
            bookmarks={bookmarks}
            onClose={() => setShowBrokenLinkChecker(false)}
            onRemoveBrokenLinks={handleRemoveBrokenLinks}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDuplicateDetector && (
          <DuplicateDetector
            bookmarks={bookmarks}
            onClose={() => setShowDuplicateDetector(false)}
            onRemoveDuplicates={handleRemoveDuplicates}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBatchOperations && (
          <BatchOperations
            selectedBookmarks={selectedBookmarks}
            onClose={() => setShowBatchOperations(false)}
            onBatchDelete={handleBatchDelete}
            onBatchTag={handleBatchTag}
            onBatchCategory={handleBatchCategory}
            onBatchFavorite={handleBatchFavorite}
            categories={categories}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showProjectManager && (
          <ProjectManager
            projects={projects}
            onCreateProject={createProject}
            onUpdateProject={updateProject}
            onDeleteProject={deleteProject}
            onClose={() => setShowProjectManager(false)}
            bookmarks={bookmarks}
            onAddBookmarkToProject={handleAddBookmarksToProject}
            onRemoveBookmarkFromProject={removeBookmarkFromProject}
            onAddNoteToProject={addNoteToProject}
            onUpdateNoteInProject={updateNoteInProject}
            onDeleteNoteFromProject={deleteNoteFromProject}
            onAddTaskToProject={addTaskToProject}
            onUpdateTaskInProject={updateTaskInProject}
            onToggleTaskInProject={toggleTaskInProject}
            onDeleteTaskFromProject={deleteTaskFromProject}
            onDuplicateProject={duplicateProject}
            onArchiveProject={archiveProject}
            onUnarchiveProject={unarchiveProject}
            onExportProject={exportProject}
            onImportProject={importProject}
            onSearchProjects={searchProjects}
            onGetProjectsByStatus={getProjectsByStatus}
            onCreateBookmarkInProject={handleCreateBookmarkInProject}
            onCreateNoteInProject={createNoteInProject}
            onCreateTaskInProject={createTaskInProject}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;