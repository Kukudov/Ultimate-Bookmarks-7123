import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiGrid, FiList, FiMenu } = FiIcons;

const ViewToggle = ({ currentView, onViewChange }) => {
  const views = [
    { id: 'grid', icon: FiGrid, label: 'Grid View' },
    { id: 'list', icon: FiList, label: 'List View' },
    { id: 'compact', icon: FiMenu, label: 'Compact View' }
  ];

  return (
    <div className="flex items-center gap-1 bg-secondary-100 dark:bg-secondary-700 rounded-lg p-1">
      {views.map(view => (
        <motion.button
          key={view.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onViewChange(view.id)}
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            currentView === view.id
              ? 'bg-white dark:bg-secondary-600 text-primary-600 dark:text-primary-400 shadow-sm'
              : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-800 dark:hover:text-secondary-200'
          }`}
          title={view.label}
        >
          <SafeIcon icon={view.icon} className="w-4 h-4" />
          <span className="hidden sm:inline">{view.label}</span>
        </motion.button>
      ))}
    </div>
  );
};

export default ViewToggle;