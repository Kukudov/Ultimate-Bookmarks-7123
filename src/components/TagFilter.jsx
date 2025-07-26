import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiX, FiTag, FiFilter } = FiIcons;

const TagFilter = ({ tags, selectedTags, onTagToggle, onClearTags }) => {
  if (tags.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-700 p-4 shadow-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <SafeIcon icon={FiTag} className="w-4 h-4 text-primary-500" />
          <h3 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300">
            Filter by Tags
          </h3>
          {tags.length > 0 && (
            <span className="text-xs text-secondary-500 bg-secondary-100 dark:bg-secondary-700 px-2 py-1 rounded-full">
              {tags.length} available
            </span>
          )}
        </div>
        
        <AnimatePresence>
          {selectedTags.length > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={onClearTags}
              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors font-medium bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30"
            >
              <SafeIcon icon={FiX} className="w-3 h-3" />
              Clear all ({selectedTags.length})
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
        <AnimatePresence>
          {tags.map((tag, index) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <motion.button
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.02 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onTagToggle(tag)}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                  isSelected
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white border-primary-500 shadow-md transform scale-105'
                    : 'bg-secondary-50 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400 border-secondary-200 dark:border-secondary-600 hover:bg-secondary-100 dark:hover:bg-secondary-600 hover:text-secondary-800 dark:hover:text-secondary-200 hover:border-secondary-300 dark:hover:border-secondary-500 hover:shadow-sm'
                }`}
              >
                <SafeIcon 
                  icon={FiTag} 
                  className={`w-3 h-3 ${
                    isSelected 
                      ? 'text-white' 
                      : 'text-secondary-400 dark:text-secondary-500'
                  }`} 
                />
                <span className="truncate max-w-[120px]">{tag}</span>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-1.5 h-1.5 bg-white rounded-full ml-1"
                  />
                )}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Selected tags summary */}
      <AnimatePresence>
        {selectedTags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 pt-3 border-t border-secondary-200 dark:border-secondary-700"
          >
            <div className="flex items-center gap-2 text-xs text-secondary-600 dark:text-secondary-400">
              <SafeIcon icon={FiFilter} className="w-3 h-3" />
              <span>
                Filtering by {selectedTags.length} tag{selectedTags.length > 1 ? 's' : ''}:
              </span>
              <div className="flex flex-wrap gap-1 ml-1">
                {selectedTags.map(tag => (
                  <span
                    key={tag}
                    className="bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No tags message */}
      {tags.length === 0 && (
        <div className="text-center py-4">
          <SafeIcon icon={FiTag} className="w-8 h-8 text-secondary-300 dark:text-secondary-600 mx-auto mb-2" />
          <p className="text-sm text-secondary-500 dark:text-secondary-400">
            No tags found in your bookmarks
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default TagFilter;