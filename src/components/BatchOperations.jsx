import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCheck, FiX, FiTrash2, FiTag, FiFolder, FiHeart } = FiIcons;

const BatchOperations = ({ 
  selectedBookmarks, 
  onClose, 
  onBatchDelete, 
  onBatchTag, 
  onBatchCategory, 
  onBatchFavorite,
  categories 
}) => {
  const [activeOperation, setActiveOperation] = useState(null);
  const [newTags, setNewTags] = useState('');
  const [newCategory, setNewCategory] = useState('');

  const handleBatchDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedBookmarks.length} bookmarks?`)) {
      onBatchDelete(selectedBookmarks);
      onClose();
    }
  };

  const handleBatchTag = () => {
    if (newTags.trim()) {
      const tags = newTags.split(',').map(tag => tag.trim()).filter(Boolean);
      onBatchTag(selectedBookmarks, tags);
      setNewTags('');
      onClose();
    }
  };

  const handleBatchCategory = () => {
    if (newCategory.trim()) {
      onBatchCategory(selectedBookmarks, newCategory);
      setNewCategory('');
      onClose();
    }
  };

  const handleBatchFavorite = (isFavorite) => {
    onBatchFavorite(selectedBookmarks, isFavorite);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-secondary-800 rounded-xl shadow-xl max-w-md w-full"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-secondary-900 dark:text-white">
              Batch Operations
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-lg transition-colors"
            >
              <SafeIcon icon={FiX} className="w-5 h-5 text-secondary-500" />
            </button>
          </div>

          <div className="mb-6">
            <p className="text-secondary-600 dark:text-secondary-400">
              {selectedBookmarks.length} bookmarks selected
            </p>
          </div>

          <div className="space-y-3">
            {/* Delete */}
            <button
              onClick={handleBatchDelete}
              className="w-full flex items-center gap-3 p-3 text-left border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <SafeIcon icon={FiTrash2} className="w-5 h-5 text-red-500" />
              <div>
                <div className="font-medium text-red-700 dark:text-red-300">
                  Delete Bookmarks
                </div>
                <div className="text-sm text-red-600 dark:text-red-400">
                  Permanently remove selected bookmarks
                </div>
              </div>
            </button>

            {/* Add to Favorites */}
            <button
              onClick={() => handleBatchFavorite(true)}
              className="w-full flex items-center gap-3 p-3 text-left border border-secondary-200 dark:border-secondary-700 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors"
            >
              <SafeIcon icon={FiHeart} className="w-5 h-5 text-red-500" />
              <div>
                <div className="font-medium text-secondary-900 dark:text-white">
                  Add to Favorites
                </div>
                <div className="text-sm text-secondary-600 dark:text-secondary-400">
                  Mark selected bookmarks as favorites
                </div>
              </div>
            </button>

            {/* Remove from Favorites */}
            <button
              onClick={() => handleBatchFavorite(false)}
              className="w-full flex items-center gap-3 p-3 text-left border border-secondary-200 dark:border-secondary-700 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors"
            >
              <SafeIcon icon={FiHeart} className="w-5 h-5 text-secondary-400" />
              <div>
                <div className="font-medium text-secondary-900 dark:text-white">
                  Remove from Favorites
                </div>
                <div className="text-sm text-secondary-600 dark:text-secondary-400">
                  Unmark selected bookmarks as favorites
                </div>
              </div>
            </button>

            {/* Add Tags */}
            <div className="border border-secondary-200 dark:border-secondary-700 rounded-lg p-3">
              <div className="flex items-center gap-3 mb-3">
                <SafeIcon icon={FiTag} className="w-5 h-5 text-primary-500" />
                <div className="font-medium text-secondary-900 dark:text-white">
                  Add Tags
                </div>
              </div>
              <input
                type="text"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                placeholder="Enter tags separated by commas"
                className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:text-white text-sm"
              />
              <button
                onClick={handleBatchTag}
                disabled={!newTags.trim()}
                className="mt-2 w-full bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <SafeIcon icon={FiCheck} className="w-4 h-4" />
                Add Tags
              </button>
            </div>

            {/* Change Category */}
            <div className="border border-secondary-200 dark:border-secondary-700 rounded-lg p-3">
              <div className="flex items-center gap-3 mb-3">
                <SafeIcon icon={FiFolder} className="w-5 h-5 text-primary-500" />
                <div className="font-medium text-secondary-900 dark:text-white">
                  Change Category
                </div>
              </div>
              <input
                list="batch-categories"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Enter or select category"
                className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:text-white text-sm"
              />
              <datalist id="batch-categories">
                {categories.map(category => (
                  <option key={category} value={category} />
                ))}
              </datalist>
              <button
                onClick={handleBatchCategory}
                disabled={!newCategory.trim()}
                className="mt-2 w-full bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <SafeIcon icon={FiCheck} className="w-4 h-4" />
                Change Category
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BatchOperations;