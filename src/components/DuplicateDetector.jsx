import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCopy, FiX, FiTrash2, FiExternalLink, FiRefreshCw } = FiIcons;

const DuplicateDetector = ({ bookmarks, onClose, onRemoveDuplicates }) => {
  const [duplicates, setDuplicates] = useState([]);
  const [selectedDuplicates, setSelectedDuplicates] = useState([]);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    findDuplicates();
  }, [bookmarks]);

  const findDuplicates = () => {
    setIsScanning(true);
    
    // Add a small delay to show scanning state
    setTimeout(() => {
      const urlMap = new Map();
      const titleMap = new Map();
      const duplicateGroups = [];

      // Group by exact URL match (case-insensitive)
      bookmarks.forEach(bookmark => {
        const url = bookmark.url.toLowerCase().trim();
        if (!urlMap.has(url)) {
          urlMap.set(url, []);
        }
        urlMap.get(url).push(bookmark);
      });

      // Find exact URL duplicates
      urlMap.forEach((group, url) => {
        if (group.length > 1) {
          duplicateGroups.push({
            type: 'url',
            value: url,
            displayValue: group[0].url, // Show original URL casing
            bookmarks: group,
            id: `url-${url}`
          });
        }
      });

      // Group by exact title match (case-insensitive, trimmed)
      // Only check bookmarks that are NOT already in URL duplicate groups
      const nonUrlDuplicates = bookmarks.filter(bookmark => {
        const url = bookmark.url.toLowerCase().trim();
        return !urlMap.has(url) || urlMap.get(url).length === 1;
      });

      nonUrlDuplicates.forEach(bookmark => {
        const title = bookmark.title.toLowerCase().trim();
        if (!titleMap.has(title)) {
          titleMap.set(title, []);
        }
        titleMap.get(title).push(bookmark);
      });

      // Find exact title duplicates
      titleMap.forEach((group, title) => {
        if (group.length > 1) {
          duplicateGroups.push({
            type: 'title',
            value: title,
            displayValue: group[0].title, // Show original title casing
            bookmarks: group,
            id: `title-${title}`
          });
        }
      });

      setDuplicates(duplicateGroups);
      setIsScanning(false);
    }, 500);
  };

  const handleRescan = () => {
    setSelectedDuplicates([]);
    findDuplicates();
  };

  const handleSelectDuplicate = (bookmarkId) => {
    setSelectedDuplicates(prev =>
      prev.includes(bookmarkId)
        ? prev.filter(id => id !== bookmarkId)
        : [...prev, bookmarkId]
    );
  };

  const handleSelectAllInGroup = (group) => {
    const groupIds = group.bookmarks.map(b => b.id);
    const allSelected = groupIds.every(id => selectedDuplicates.includes(id));
    
    if (allSelected) {
      setSelectedDuplicates(prev => prev.filter(id => !groupIds.includes(id)));
    } else {
      setSelectedDuplicates(prev => [...new Set([...prev, ...groupIds])]);
    }
  };

  const handleKeepNewest = (group) => {
    const sorted = [...group.bookmarks].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
    const toRemove = sorted.slice(1).map(b => b.id);
    setSelectedDuplicates(prev => [...new Set([...prev, ...toRemove])]);
  };

  const handleKeepOldest = (group) => {
    const sorted = [...group.bookmarks].sort((a, b) => 
      new Date(a.createdAt) - new Date(b.createdAt)
    );
    const toRemove = sorted.slice(1).map(b => b.id);
    setSelectedDuplicates(prev => [...new Set([...prev, ...toRemove])]);
  };

  const handleKeepFavorite = (group) => {
    const favorites = group.bookmarks.filter(b => b.isFavorite);
    const nonFavorites = group.bookmarks.filter(b => !b.isFavorite);
    
    if (favorites.length > 0) {
      // Keep one favorite (newest) and remove all non-favorites
      const sortedFavorites = [...favorites].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      const toRemove = [
        ...sortedFavorites.slice(1).map(b => b.id),
        ...nonFavorites.map(b => b.id)
      ];
      setSelectedDuplicates(prev => [...new Set([...prev, ...toRemove])]);
    } else {
      // No favorites, keep newest
      handleKeepNewest(group);
    }
  };

  const handleRemoveSelected = () => {
    if (selectedDuplicates.length > 0) {
      if (window.confirm(`Are you sure you want to remove ${selectedDuplicates.length} duplicate bookmarks? This action cannot be undone.`)) {
        onRemoveDuplicates(selectedDuplicates);
        setSelectedDuplicates([]);
        // Rescan after removal to update the duplicate list
        setTimeout(() => {
          findDuplicates();
        }, 100);
      }
    }
  };

  const handleRemoveDuplicate = (bookmarkId) => {
    if (window.confirm('Are you sure you want to remove this bookmark? This action cannot be undone.')) {
      onRemoveDuplicates([bookmarkId]);
      // Rescan after removal to update the duplicate list
      setTimeout(() => {
        findDuplicates();
      }, 100);
    }
  };

  const getTotalDuplicates = () => {
    return duplicates.reduce((total, group) => total + group.bookmarks.length, 0);
  };

  const getUniqueAfterRemoval = () => {
    return duplicates.reduce((total, group) => total + 1, 0);
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
        className="bg-white dark:bg-secondary-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        <div className="p-6 border-b border-secondary-200 dark:border-secondary-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-secondary-900 dark:text-white">
              Duplicate Bookmarks
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-lg transition-colors"
            >
              <SafeIcon icon={FiX} className="w-5 h-5 text-secondary-500" />
            </button>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={handleRescan}
              disabled={isScanning}
              className="bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <SafeIcon icon={FiRefreshCw} className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              {isScanning ? 'Scanning...' : 'Rescan'}
            </button>
            
            {duplicates.length > 0 && (
              <button
                onClick={handleRemoveSelected}
                disabled={selectedDuplicates.length === 0}
                className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                Remove Selected ({selectedDuplicates.length})
              </button>
            )}
            
            {!isScanning && duplicates.length > 0 && (
              <div className="text-sm text-secondary-600 dark:text-secondary-400 flex items-center">
                <span className="bg-secondary-100 dark:bg-secondary-700 px-2 py-1 rounded">
                  {getTotalDuplicates()} duplicates → {getUniqueAfterRemoval()} unique
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {isScanning ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p className="text-secondary-600 dark:text-secondary-400">
                Scanning for duplicates...
              </p>
            </div>
          ) : duplicates.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">✨</div>
              <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-2">
                No Exact Duplicates Found
              </h3>
              <p className="text-secondary-600 dark:text-secondary-400">
                All your bookmarks have unique URLs and titles!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <SafeIcon icon={FiCopy} className="w-5 h-5 text-orange-500" />
                  <span className="font-medium text-orange-700 dark:text-orange-300">
                    Found {duplicates.length} exact duplicate groups
                  </span>
                </div>
                <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                  Only exact matches (same URL or same title) are considered duplicates
                </p>
              </div>

              {duplicates.map(group => (
                <div
                  key={group.id}
                  className="border border-secondary-200 dark:border-secondary-700 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-secondary-900 dark:text-white">
                        Duplicate {group.type === 'url' ? 'URL' : 'Title'}
                      </h3>
                      <p className="text-sm text-secondary-600 dark:text-secondary-400 truncate">
                        {group.displayValue}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleKeepNewest(group)}
                        className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                        title="Keep the most recently created bookmark"
                      >
                        Keep Newest
                      </button>
                      <button
                        onClick={() => handleKeepOldest(group)}
                        className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                        title="Keep the oldest bookmark"
                      >
                        Keep Oldest
                      </button>
                      <button
                        onClick={() => handleKeepFavorite(group)}
                        className="text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-2 py-1 rounded hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                        title="Keep favorite bookmark or newest if none are favorites"
                      >
                        Keep Favorite
                      </button>
                      <button
                        onClick={() => handleSelectAllInGroup(group)}
                        className="text-xs bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 px-2 py-1 rounded hover:bg-secondary-200 dark:hover:bg-secondary-600 transition-colors"
                      >
                        {group.bookmarks.every(b => selectedDuplicates.includes(b.id)) ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {group.bookmarks.map(bookmark => (
                      <div
                        key={bookmark.id}
                        className="flex items-center gap-3 p-3 border border-secondary-200 dark:border-secondary-600 rounded-lg"
                      >
                        <input
                          type="checkbox"
                          checked={selectedDuplicates.includes(bookmark.id)}
                          onChange={() => handleSelectDuplicate(bookmark.id)}
                          className="w-4 h-4 text-red-600 border-secondary-300 rounded focus:ring-red-500"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-secondary-900 dark:text-white truncate">
                            {bookmark.title}
                          </h4>
                          <p className="text-sm text-secondary-500 dark:text-secondary-400 truncate">
                            {bookmark.url}
                          </p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs text-secondary-400">
                              Created: {new Date(bookmark.createdAt).toLocaleDateString()}
                            </span>
                            {bookmark.category && (
                              <span className="text-xs bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400 px-2 py-0.5 rounded">
                                {bookmark.category}
                              </span>
                            )}
                            {bookmark.isFavorite && (
                              <span className="text-xs bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 px-2 py-0.5 rounded">
                                ⭐ Favorite
                              </span>
                            )}
                            {bookmark.tags && bookmark.tags.length > 0 && (
                              <span className="text-xs text-secondary-400">
                                {bookmark.tags.length} tag{bookmark.tags.length > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => window.open(bookmark.url, '_blank')}
                            className="p-2 text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300 transition-colors"
                            title="Open bookmark"
                          >
                            <SafeIcon icon={FiExternalLink} className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveDuplicate(bookmark.id)}
                            className="p-2 text-red-500 hover:text-red-600 transition-colors"
                            title="Remove this bookmark"
                          >
                            <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DuplicateDetector;