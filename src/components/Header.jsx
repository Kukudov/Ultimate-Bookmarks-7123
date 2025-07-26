import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { 
  FiPlus, FiSun, FiMoon, FiDownload, FiUpload, FiMenu, FiTrash2, 
  FiMoreVertical, FiCheck, FiCopy, FiAlertTriangle, FiFolder, FiZap 
} = FiIcons;

const Header = ({
  onAddBookmark,
  theme,
  onToggleTheme,
  onExport,
  onImport,
  onDeleteAll,
  onToggleSidebar,
  onShowBrokenLinkChecker,
  onShowDuplicateDetector,
  onShowBatchOperations,
  onShowProjectManager,
  selectedBookmarks,
  selectionMode,
  onToggleSelectionMode
}) => {
  const fileInputRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onImport(file);
    }
  };

  const handleDeleteAll = () => {
    if (window.confirm('Are you sure you want to delete all bookmarks? This action cannot be undone.')) {
      onDeleteAll();
    }
    setShowDropdown(false);
  };

  const handleExport = (format) => {
    onExport(format);
    setShowDropdown(false);
  };

  const handleMenuAction = (action) => {
    setShowDropdown(false);
    action();
  };

  return (
    <header className="bg-white dark:bg-secondary-800 shadow-lg border-b border-secondary-200 dark:border-secondary-700 sticky top-0 z-50 backdrop-blur-sm bg-white/95 dark:bg-secondary-800/95">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={onToggleSidebar}
              className="p-2 text-secondary-600 dark:text-secondary-400 hover:text-secondary-800 dark:hover:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-lg transition-colors lg:hidden mr-3"
            >
              <SafeIcon icon={FiMenu} className="w-5 h-5" />
            </button>

            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                duration: 0.5,
                type: "spring",
                stiffness: 200
              }}
              className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mr-3 shadow-lg"
            >
              <SafeIcon icon={FiCheck} className="w-6 h-6 text-white" />
            </motion.div>

            <div>
              <h1 className="text-xl font-bold text-secondary-900 dark:text-white">
                Ultimate Bookmarks
              </h1>
              <p className="text-xs text-secondary-500 dark:text-secondary-400 hidden sm:block">
                Organize your digital life
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Selection Mode Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleSelectionMode}
              className={`p-2 rounded-lg transition-all duration-200 ${
                selectionMode
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                  : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-800 dark:hover:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-700'
              }`}
              title="Toggle selection mode"
            >
              <SafeIcon icon={FiCheck} className="w-5 h-5" />
            </motion.button>

            {/* Batch Operations (shown when bookmarks are selected) */}
            <AnimatePresence>
              {selectedBookmarks.length > 0 && (
                <motion.button
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onShowBatchOperations}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <SafeIcon icon={FiZap} className="w-4 h-4" />
                  <span className="hidden sm:inline">Batch ({selectedBookmarks.length})</span>
                  <span className="sm:hidden">{selectedBookmarks.length}</span>
                </motion.button>
              )}
            </AnimatePresence>

            {/* Tools Dropdown */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-2 text-secondary-600 dark:text-secondary-400 hover:text-secondary-800 dark:hover:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-lg transition-colors"
                title="Tools & Options"
              >
                <SafeIcon icon={FiMoreVertical} className="w-5 h-5" />
              </motion.button>

              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-64 bg-white dark:bg-secondary-800 rounded-xl shadow-2xl border border-secondary-200 dark:border-secondary-700 py-2 z-50 backdrop-blur-sm"
                  >
                    <div className="px-4 py-2 border-b border-secondary-200 dark:border-secondary-700">
                      <p className="text-sm font-semibold text-secondary-900 dark:text-white">Tools & Management</p>
                    </div>

                    <button
                      onClick={() => handleMenuAction(onShowProjectManager)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors"
                    >
                      <SafeIcon icon={FiFolder} className="w-4 h-4 text-blue-500" />
                      <div className="text-left">
                        <div className="font-medium">Project Manager</div>
                        <div className="text-xs text-secondary-500">Organize into projects</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleMenuAction(onShowBrokenLinkChecker)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors"
                    >
                      <SafeIcon icon={FiAlertTriangle} className="w-4 h-4 text-orange-500" />
                      <div className="text-left">
                        <div className="font-medium">Check Broken Links</div>
                        <div className="text-xs text-secondary-500">Find invalid URLs</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleMenuAction(onShowDuplicateDetector)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors"
                    >
                      <SafeIcon icon={FiCopy} className="w-4 h-4 text-purple-500" />
                      <div className="text-left">
                        <div className="font-medium">Find Duplicates</div>
                        <div className="text-xs text-secondary-500">Remove duplicate entries</div>
                      </div>
                    </button>

                    <hr className="my-2 border-secondary-200 dark:border-secondary-700" />

                    <button
                      onClick={() => handleExport('json')}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors"
                    >
                      <SafeIcon icon={FiDownload} className="w-4 h-4 text-green-500" />
                      <div className="text-left">
                        <div className="font-medium">Export as JSON</div>
                        <div className="text-xs text-secondary-500">Backup your data</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleExport('html')}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors"
                    >
                      <SafeIcon icon={FiDownload} className="w-4 h-4 text-blue-500" />
                      <div className="text-left">
                        <div className="font-medium">Export as HTML</div>
                        <div className="text-xs text-secondary-500">Browser bookmarks format</div>
                      </div>
                    </button>

                    <button
                      onClick={handleImportClick}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors"
                    >
                      <SafeIcon icon={FiUpload} className="w-4 h-4 text-cyan-500" />
                      <div className="text-left">
                        <div className="font-medium">Import Bookmarks</div>
                        <div className="text-xs text-secondary-500">From JSON or HTML</div>
                      </div>
                    </button>

                    <hr className="my-2 border-secondary-200 dark:border-secondary-700" />

                    <button
                      onClick={handleDeleteAll}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                      <div className="text-left">
                        <div className="font-medium">Delete All Bookmarks</div>
                        <div className="text-xs text-red-500">Permanent action</div>
                      </div>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.html,.htm"
              onChange={handleFileChange}
              className="hidden"
            />

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleTheme}
              className="p-2 text-secondary-600 dark:text-secondary-400 hover:text-secondary-800 dark:hover:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-lg transition-colors"
            >
              <SafeIcon icon={theme === 'light' ? FiMoon : FiSun} className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAddBookmark}
              className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <SafeIcon icon={FiPlus} className="w-4 h-4" />
              <span className="hidden sm:inline">Add Bookmark</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Dropdown backdrop */}
      {showDropdown && (
        <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
      )}
    </header>
  );
};

export default Header;