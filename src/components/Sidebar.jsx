import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiHome, FiHeart, FiFolder, FiTag, FiTrendingUp, FiStar, FiClock } = FiIcons;

const Sidebar = ({ 
  categories, 
  selectedCategory, 
  onCategoryChange, 
  bookmarkCounts, 
  allTags, 
  selectedTags, 
  onTagToggle, 
  onClearTags, 
  isOpen, 
  onToggle 
}) => {
  const sidebarVariants = {
    open: { 
      x: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30 
      }
    },
    closed: { 
      x: -320,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30 
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={isOpen ? "open" : "closed"}
        variants={sidebarVariants}
        className={`
          fixed lg:sticky left-0 top-16 h-[calc(100vh-4rem)] w-80 
          bg-gradient-to-b from-white to-secondary-50 dark:from-secondary-800 dark:to-secondary-900 
          border-r border-secondary-200 dark:border-secondary-700 
          z-40 shadow-xl lg:shadow-none overflow-hidden
          lg:translate-x-0 lg:block
          ${isOpen ? 'block' : 'hidden lg:block'}
        `}
      >
        <div className="p-6 h-full overflow-y-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <SafeIcon icon={FiTrendingUp} className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg font-bold text-secondary-900 dark:text-white">
                Quick Access
              </h2>
            </div>
            <p className="text-sm text-secondary-600 dark:text-secondary-400">
              Navigate your bookmarks easily
            </p>
          </div>

          {/* Categories Section */}
          <div className="mb-8">
            <motion.h3 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm font-bold text-secondary-900 dark:text-white mb-4 flex items-center gap-2 uppercase tracking-wide"
            >
              <SafeIcon icon={FiFolder} className="w-4 h-4 text-primary-500" />
              Categories
            </motion.h3>
            
            <div className="space-y-2">
              <motion.button
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onCategoryChange('')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  selectedCategory === '' 
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg transform scale-105' 
                    : 'text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700 hover:shadow-md'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  selectedCategory === '' 
                    ? 'bg-white/20' 
                    : 'bg-secondary-100 dark:bg-secondary-700'
                }`}>
                  <SafeIcon icon={FiHome} className="w-4 h-4" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold">All Bookmarks</div>
                  <div className="text-xs opacity-75">Complete collection</div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  selectedCategory === '' 
                    ? 'bg-white/20 text-white' 
                    : 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
                }`}>
                  {bookmarkCounts.total || 0}
                </span>
              </motion.button>

              <motion.button
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onCategoryChange('favorites')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  selectedCategory === 'favorites' 
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg transform scale-105' 
                    : 'text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700 hover:shadow-md'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  selectedCategory === 'favorites' 
                    ? 'bg-white/20' 
                    : 'bg-red-100 dark:bg-red-900/20'
                }`}>
                  <SafeIcon icon={FiHeart} className="w-4 h-4 text-red-500" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold">Favorites</div>
                  <div className="text-xs opacity-75">Your starred items</div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  selectedCategory === 'favorites' 
                    ? 'bg-white/20 text-white' 
                    : 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
                }`}>
                  {bookmarkCounts.favorites || 0}
                </span>
              </motion.button>

              {categories.map((category, index) => (
                <motion.button
                  key={category}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onCategoryChange(category)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category 
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg transform scale-105' 
                      : 'text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700 hover:shadow-md'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    selectedCategory === category 
                      ? 'bg-white/20' 
                      : 'bg-secondary-100 dark:bg-secondary-700'
                  }`}>
                    <SafeIcon icon={FiFolder} className="w-4 h-4" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold truncate">{category}</div>
                    <div className="text-xs opacity-75">Category</div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    selectedCategory === category 
                      ? 'bg-white/20 text-white' 
                      : 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
                  }`}>
                    {bookmarkCounts[category] || 0}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Tags Section */}
          {allTags.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <motion.h3 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm font-bold text-secondary-900 dark:text-white flex items-center gap-2 uppercase tracking-wide"
                >
                  <SafeIcon icon={FiTag} className="w-4 h-4 text-primary-500" />
                  Tags
                </motion.h3>
                {selectedTags.length > 0 && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={onClearTags}
                    className="text-xs text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium bg-primary-100 dark:bg-primary-900 px-2 py-1 rounded-full"
                  >
                    Clear All
                  </motion.button>
                )}
              </div>
              
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {allTags.map((tag, index) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <motion.button
                      key={tag}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: 0.1 + index * 0.05 }}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onTagToggle(tag)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                        isSelected 
                          ? 'bg-gradient-to-r from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 text-primary-700 dark:text-primary-300 shadow-md transform scale-105' 
                          : 'text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-700 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <SafeIcon icon={FiTag} className={`w-3 h-3 ${
                          isSelected ? 'text-primary-500' : 'text-secondary-400'
                        }`} />
                        <span className="truncate font-medium">{tag}</span>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-2 h-2 bg-primary-500 rounded-full ml-auto"
                          />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-secondary-200 dark:border-secondary-700">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-xs text-secondary-500 dark:text-secondary-400">
                <SafeIcon icon={FiClock} className="w-3 h-3" />
                <span>Updated {new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;