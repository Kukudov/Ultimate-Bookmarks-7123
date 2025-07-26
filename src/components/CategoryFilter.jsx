import React from 'react';
import { motion } from 'framer-motion';

const CategoryFilter = ({ categories, selectedCategory, onCategoryChange, bookmarkCounts }) => {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onCategoryChange('')}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          selectedCategory === ''
            ? 'bg-primary-500 text-white'
            : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-600'
        }`}
      >
        All ({bookmarkCounts.total || 0})
      </motion.button>
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onCategoryChange('favorites')}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          selectedCategory === 'favorites'
            ? 'bg-primary-500 text-white'
            : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-600'
        }`}
      >
        Favorites ({bookmarkCounts.favorites || 0})
      </motion.button>

      {categories.map(category => (
        <motion.button
          key={category}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onCategoryChange(category)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedCategory === category
              ? 'bg-primary-500 text-white'
              : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-600'
          }`}
        >
          {category} ({bookmarkCounts[category] || 0})
        </motion.button>
      ))}
    </div>
  );
};

export default CategoryFilter;