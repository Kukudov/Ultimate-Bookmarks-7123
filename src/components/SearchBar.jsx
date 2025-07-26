import React from 'react';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiSearch, FiX } = FiIcons;

const SearchBar = ({ searchTerm, onSearchChange, onClear }) => {
  return (
    <div className="relative">
      <SafeIcon
        icon={FiSearch}
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4"
      />
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search bookmarks..."
        className="w-full pl-10 pr-10 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:text-white"
      />
      {searchTerm && (
        <button
          onClick={onClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600 transition-colors"
        >
          <SafeIcon icon={FiX} className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;