import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BookmarkTile from './BookmarkTile';
import BookmarkListView from './BookmarkListView';
import BookmarkCompactView from './BookmarkCompactView';

const BookmarkGrid = ({ 
  bookmarks, 
  onEdit, 
  onDelete, 
  onToggleFavorite,
  selectedBookmarks,
  onSelectBookmark,
  selectionMode,
  view = 'grid'
}) => {
  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-2">
          No bookmarks found
        </h3>
        <p className="text-secondary-600 dark:text-secondary-400">
          Add your first bookmark to get started
        </p>
      </div>
    );
  }

  const commonProps = {
    bookmarks,
    onEdit,
    onDelete,
    onToggleFavorite,
    selectedBookmarks,
    onSelectBookmark,
    selectionMode
  };

  if (view === 'list') {
    return <BookmarkListView {...commonProps} />;
  }

  if (view === 'compact') {
    return <BookmarkCompactView {...commonProps} />;
  }

  // Grid view (default)
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <AnimatePresence>
        {bookmarks.map((bookmark) => (
          <BookmarkTile
            key={bookmark.id}
            bookmark={bookmark}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleFavorite={onToggleFavorite}
            selectedBookmarks={selectedBookmarks}
            onSelectBookmark={onSelectBookmark}
            selectionMode={selectionMode}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default BookmarkGrid;