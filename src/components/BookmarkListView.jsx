import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiHeart, FiEdit, FiTrash2, FiExternalLink, FiGlobe, FiCalendar } = FiIcons;

const BookmarkListView = ({ 
  bookmarks, 
  onEdit, 
  onDelete, 
  onToggleFavorite,
  selectedBookmarks,
  onSelectBookmark,
  selectionMode 
}) => {
  const getDomain = (url) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  const openBookmark = (bookmark) => {
    window.open(bookmark.url, '_blank');
  };

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

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {bookmarks.map((bookmark) => (
          <motion.div
            key={bookmark.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="group bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-4 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              {selectionMode && (
                <input
                  type="checkbox"
                  checked={selectedBookmarks.includes(bookmark.id)}
                  onChange={() => onSelectBookmark(bookmark.id)}
                  className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                />
              )}

              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-secondary-100 dark:bg-secondary-700 flex items-center justify-center">
                {bookmark.favicon ? (
                  <img
                    src={bookmark.favicon}
                    alt=""
                    className="w-6 h-6 object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                ) : null}
                <SafeIcon 
                  icon={FiGlobe} 
                  className="w-5 h-5 text-secondary-500" 
                  style={{ display: bookmark.favicon ? 'none' : 'block' }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-secondary-900 dark:text-white truncate">
                      {bookmark.title}
                    </h3>
                    <p className="text-sm text-secondary-500 dark:text-secondary-400 truncate">
                      {getDomain(bookmark.url)}
                    </p>
                    {bookmark.description && (
                      <p className="text-sm text-secondary-600 dark:text-secondary-300 mt-1 line-clamp-2">
                        {bookmark.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(bookmark.id);
                      }}
                      className={`p-1 rounded-full transition-colors ${
                        bookmark.isFavorite 
                          ? 'text-red-500 hover:text-red-600' 
                          : 'text-secondary-400 hover:text-red-500'
                      }`}
                    >
                      <SafeIcon 
                        icon={FiHeart} 
                        className="w-4 h-4" 
                        fill={bookmark.isFavorite ? 'currentColor' : 'none'} 
                      />
                    </button>

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <button
                        onClick={() => openBookmark(bookmark)}
                        className="p-1 bg-primary-500 hover:bg-primary-600 text-white rounded transition-colors"
                        title="Open bookmark"
                      >
                        <SafeIcon icon={FiExternalLink} className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onEdit(bookmark)}
                        className="p-1 bg-secondary-500 hover:bg-secondary-600 text-white rounded transition-colors"
                        title="Edit bookmark"
                      >
                        <SafeIcon icon={FiEdit} className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onDelete(bookmark.id)}
                        className="p-1 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                        title="Delete bookmark"
                      >
                        <SafeIcon icon={FiTrash2} className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1 text-xs text-secondary-400">
                    <SafeIcon icon={FiCalendar} className="w-3 h-3" />
                    {new Date(bookmark.createdAt).toLocaleDateString()}
                  </div>
                  
                  {bookmark.category && (
                    <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-xs rounded-full">
                      {bookmark.category}
                    </span>
                  )}

                  {bookmark.tags && bookmark.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {bookmark.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {bookmark.tags.length > 3 && (
                        <span className="px-2 py-0.5 bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400 text-xs rounded-full">
                          +{bookmark.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default BookmarkListView;