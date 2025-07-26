import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiHeart, FiEdit, FiTrash2, FiExternalLink, FiGlobe } = FiIcons;

const BookmarkTile = ({ 
  bookmark, 
  onEdit, 
  onDelete, 
  onToggleFavorite,
  selectedBookmarks,
  onSelectBookmark,
  selectionMode 
}) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const getDomain = (url) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  const openBookmark = () => {
    if (!selectionMode) {
      window.open(bookmark.url, '_blank');
    }
  };

  const handleClick = () => {
    if (selectionMode) {
      onSelectBookmark(bookmark.id);
    } else {
      openBookmark();
    }
  };

  const isSelected = selectedBookmarks.includes(bookmark.id);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      className={`group bg-white dark:bg-secondary-800 rounded-xl shadow-sm border transition-all duration-300 cursor-pointer relative overflow-hidden ${
        selectionMode && isSelected
          ? 'border-primary-500 ring-2 ring-primary-200 dark:ring-primary-800'
          : 'border-secondary-200 dark:border-secondary-700 hover:shadow-lg'
      } ${selectionMode ? 'hover:border-primary-300' : ''}`}
      onClick={handleClick}
    >
      {selectionMode && (
        <div className="absolute top-3 left-3 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelectBookmark(bookmark.id)}
            className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-secondary-100 dark:bg-secondary-700 flex items-center justify-center overflow-hidden">
            {!imageError && bookmark.favicon ? (
              <img
                src={bookmark.favicon}
                alt=""
                className="w-6 h-6 object-contain"
                onError={handleImageError}
              />
            ) : (
              <SafeIcon icon={FiGlobe} className="w-4 h-4 text-secondary-500" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-secondary-900 dark:text-white text-sm truncate">
              {bookmark.title}
            </h3>
            <p className="text-xs text-secondary-500 dark:text-secondary-400 truncate">
              {getDomain(bookmark.url)}
            </p>
          </div>
          
          {!selectionMode && (
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
          )}
        </div>

        <div className="mb-3">
          <p className="text-sm text-secondary-600 dark:text-secondary-300 line-clamp-2 mb-2">
            {bookmark.description}
          </p>
          
          {bookmark.tags && bookmark.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {bookmark.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
              {bookmark.tags.length > 3 && (
                <span className="px-2 py-1 bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400 text-xs rounded-full">
                  +{bookmark.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action buttons - shown on hover */}
        {!selectionMode && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white dark:from-secondary-800 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="flex justify-end gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openBookmark();
                }}
                className="p-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
              >
                <SafeIcon icon={FiExternalLink} className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(bookmark);
                }}
                className="p-2 bg-secondary-500 hover:bg-secondary-600 text-white rounded-lg transition-colors"
              >
                <SafeIcon icon={FiEdit} className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(bookmark.id);
                }}
                className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                <SafeIcon icon={FiTrash2} className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default BookmarkTile;