import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiX, FiSave, FiGlobe, FiFolder } = FiIcons;

const BookmarkForm = ({ bookmark, onSave, onCancel, categories, projects, onAddToProject }) => {
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    category: '',
    tags: '',
    favicon: '',
    isFavorite: false,
  });

  const [selectedProjects, setSelectedProjects] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (bookmark) {
      setFormData({
        title: bookmark.title || '',
        url: bookmark.url || '',
        description: bookmark.description || '',
        category: bookmark.category || '',
        tags: bookmark.tags ? bookmark.tags.join(', ') : '',
        favicon: bookmark.favicon || '',
        isFavorite: bookmark.isFavorite || false,
      });
    }
  }, [bookmark]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.url.trim()) {
      newErrors.url = 'URL is required';
    } else {
      try {
        new URL(formData.url);
      } catch {
        newErrors.url = 'Invalid URL format';
      }
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const bookmarkData = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      favicon: formData.favicon || `https://www.google.com/s2/favicons?domain=${new URL(formData.url).hostname}`,
    };

    // Save the bookmark first
    onSave(bookmarkData);

    // If it's a new bookmark and projects are selected, add to projects
    if (!bookmark && selectedProjects.length > 0 && onAddToProject) {
      // We need to get the bookmark ID after it's created
      // This is a workaround since we don't have the ID yet
      setTimeout(() => {
        selectedProjects.forEach(projectId => {
          onAddToProject(projectId, Date.now().toString());
        });
      }, 100);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleProjectToggle = (projectId) => {
    setSelectedProjects(prev =>
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  // Combine existing categories with common ones for the dropdown
  const allCategories = [...new Set([
    ...categories,
    'Development', 'Design', 'Entertainment', 'News', 'Shopping',
    'Social', 'Tools', 'Education', 'Finance', 'Health', 'Travel'
  ])].sort();

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
        className="bg-white dark:bg-secondary-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-secondary-900 dark:text-white">
              {bookmark ? 'Edit Bookmark' : 'Add Bookmark'}
            </h2>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-lg transition-colors"
            >
              <SafeIcon icon={FiX} className="w-5 h-5 text-secondary-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:border-secondary-600 dark:text-white ${
                    errors.title ? 'border-red-500' : 'border-secondary-300'
                  }`}
                  placeholder="Enter bookmark title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-500">{errors.title}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  URL *
                </label>
                <input
                  type="url"
                  name="url"
                  value={formData.url}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:border-secondary-600 dark:text-white ${
                    errors.url ? 'border-red-500' : 'border-secondary-300'
                  }`}
                  placeholder="https://example.com"
                />
                {errors.url && (
                  <p className="mt-1 text-sm text-red-500">{errors.url}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:text-white"
                  placeholder="Brief description of the bookmark"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Category *
                </label>
                <input
                  list="categories"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:border-secondary-600 dark:text-white ${
                    errors.category ? 'border-red-500' : 'border-secondary-300'
                  }`}
                  placeholder="Enter or select a category"
                />
                <datalist id="categories">
                  {allCategories.map(category => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-500">{errors.category}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:text-white"
                  placeholder="tag1, tag2, tag3"
                />
                <p className="mt-1 text-xs text-secondary-500 dark:text-secondary-400">
                  Separate tags with commas
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Custom Favicon URL
                </label>
                <input
                  type="url"
                  name="favicon"
                  value={formData.favicon}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:text-white"
                  placeholder="https://example.com/favicon.ico"
                />
                <p className="mt-1 text-xs text-secondary-500 dark:text-secondary-400">
                  Leave empty to auto-generate
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isFavorite"
                  checked={formData.isFavorite}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                />
                <label className="ml-2 text-sm text-secondary-700 dark:text-secondary-300">
                  Add to favorites
                </label>
              </div>
            </div>

            {/* Projects Section - Only show for new bookmarks */}
            {!bookmark && projects && projects.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-3">
                  <SafeIcon icon={FiFolder} className="w-4 h-4 inline mr-2" />
                  Add to Projects
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto border border-secondary-200 dark:border-secondary-600 rounded-lg p-3">
                  {projects.map(project => (
                    <div
                      key={project.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                        selectedProjects.includes(project.id)
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-secondary-200 dark:border-secondary-600 hover:border-secondary-300 dark:hover:border-secondary-500'
                      }`}
                      onClick={() => handleProjectToggle(project.id)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedProjects.includes(project.id)}
                        onChange={() => handleProjectToggle(project.id)}
                        className="w-4 h-4 text-primary-600 rounded"
                      />
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: project.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-secondary-900 dark:text-white truncate text-sm">
                          {project.name}
                        </p>
                        {project.description && (
                          <p className="text-xs text-secondary-500 truncate">
                            {project.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {selectedProjects.length > 0 && (
                  <p className="mt-2 text-sm text-primary-600 dark:text-primary-400">
                    Will be added to {selectedProjects.length} project{selectedProjects.length > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <SafeIcon icon={FiSave} className="w-4 h-4" />
                {bookmark ? 'Update' : 'Save'} Bookmark
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-secondary-300 dark:border-secondary-600 text-secondary-700 dark:text-secondary-300 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BookmarkForm;