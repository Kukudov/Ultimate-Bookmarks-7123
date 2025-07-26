import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const {
  FiFolder, FiPlus, FiEdit, FiTrash2, FiX, FiSave, FiFileText, FiCheckSquare, FiCheck,
  FiBookmark, FiCalendar, FiTarget, FiUser, FiClock, FiTag, FiExternalLink, FiArchive,
  FiStar, FiCopy, FiDownload, FiUpload, FiSearch, FiFilter, FiMoreHorizontal, FiPlay,
  FiPause, FiRefreshCw
} = FiIcons;

const ProjectManager = ({
  projects,
  onCreateProject,
  onUpdateProject,
  onDeleteProject,
  onClose,
  bookmarks,
  onAddBookmarkToProject,
  onRemoveBookmarkFromProject,
  onAddNoteToProject,
  onUpdateNoteInProject,
  onDeleteNoteFromProject,
  onAddTaskToProject,
  onUpdateTaskInProject,
  onToggleTaskInProject,
  onDeleteTaskFromProject,
  onDuplicateProject,
  onArchiveProject,
  onUnarchiveProject,
  onExportProject,
  onImportProject,
  onSearchProjects,
  onGetProjectsByStatus,
  // ✨ NEW: Functions for creating content directly in projects
  onCreateBookmarkInProject,
  onCreateNoteInProject,
  onCreateTaskInProject
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showImportDialog, setShowImportDialog] = useState(false);

  // ✨ NEW: States for quick add forms
  const [showQuickAddBookmark, setShowQuickAddBookmark] = useState(false);
  const [showQuickAddNote, setShowQuickAddNote] = useState(false);
  const [showQuickAddTask, setShowQuickAddTask] = useState(false);

  // ✨ NEW: State for bulk bookmark addition
  const [showBulkAddBookmarks, setShowBulkAddBookmarks] = useState(false);

  // Filter projects based on search and status
  const filteredProjects = React.useMemo(() => {
    let filtered = projects || [];
    if (searchQuery) {
      filtered = onSearchProjects ? onSearchProjects(searchQuery) : 
        filtered.filter(p => 
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }
    if (statusFilter !== 'all') {
      filtered = onGetProjectsByStatus ? onGetProjectsByStatus(statusFilter) : filtered;
    }
    return filtered;
  }, [projects, searchQuery, statusFilter, onSearchProjects, onGetProjectsByStatus]);

  const handleCreateProject = () => {
    setEditingProject(null);
    setShowForm(true);
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProject(null);
  };

  const handleViewProject = (project) => {
    setSelectedProject(project);
    setActiveTab('overview');
  };

  const handleDuplicateProject = (projectId) => {
    if (onDuplicateProject) {
      onDuplicateProject(projectId);
    }
  };

  const handleArchiveProject = (projectId) => {
    if (window.confirm('Are you sure you want to archive this project?')) {
      if (onArchiveProject) {
        onArchiveProject(projectId);
      }
    }
  };

  const handleExportProject = (projectId) => {
    if (onExportProject) {
      onExportProject(projectId);
    }
  };

  const handleImportProject = (file) => {
    if (onImportProject) {
      onImportProject(file).then(() => {
        setShowImportDialog(false);
        alert('Project imported successfully!');
      }).catch((error) => {
        alert(`Import failed: ${error.message}`);
      });
    }
  };

  // ✨ UPDATED: Quick add handlers with immediate updates
  const handleQuickAddBookmark = (projectId, bookmarkData) => {
    if (onCreateBookmarkInProject) {
      onCreateBookmarkInProject(projectId, bookmarkData);
      setShowQuickAddBookmark(false);
      // ✨ Update selected project to reflect changes immediately
      if (selectedProject && selectedProject.id === projectId) {
        const updatedProject = filteredProjects.find(p => p.id === projectId);
        if (updatedProject) {
          setSelectedProject(updatedProject);
        }
      }
    }
  };

  const handleQuickAddNote = (projectId, noteContent) => {
    if (onCreateNoteInProject) {
      onCreateNoteInProject(projectId, noteContent);
      setShowQuickAddNote(false);
      // ✨ Update selected project to reflect changes immediately
      if (selectedProject && selectedProject.id === projectId) {
        const updatedProject = filteredProjects.find(p => p.id === projectId);
        if (updatedProject) {
          setSelectedProject(updatedProject);
        }
      }
    }
  };

  const handleQuickAddTask = (projectId, taskTitle) => {
    if (onCreateTaskInProject) {
      onCreateTaskInProject(projectId, taskTitle);
      setShowQuickAddTask(false);
      // ✨ Update selected project to reflect changes immediately
      if (selectedProject && selectedProject.id === projectId) {
        const updatedProject = filteredProjects.find(p => p.id === projectId);
        if (updatedProject) {
          setSelectedProject(updatedProject);
        }
      }
    }
  };

  // ✨ NEW: Handler for bulk bookmark addition
  const handleBulkAddBookmarks = (projectId, bookmarkIds) => {
    if (onAddBookmarkToProject && bookmarkIds.length > 0) {
      onAddBookmarkToProject(projectId, bookmarkIds);
      setShowBulkAddBookmarks(false);
      // Update selected project to reflect changes immediately
      if (selectedProject && selectedProject.id === projectId) {
        const updatedProject = filteredProjects.find(p => p.id === projectId);
        if (updatedProject) {
          setSelectedProject(updatedProject);
        }
      }
    }
  };

  // ✨ NEW: Handler to update selected project when main project data changes
  React.useEffect(() => {
    if (selectedProject) {
      const updatedProject = filteredProjects.find(p => p.id === selectedProject.id);
      if (updatedProject && JSON.stringify(updatedProject) !== JSON.stringify(selectedProject)) {
        setSelectedProject(updatedProject);
      }
    }
  }, [projects, selectedProject]);

  const getProjectStats = (project) => {
    const bookmarkCount = project.bookmarks?.length || 0;
    const noteCount = project.notes?.length || 0;
    const taskCount = project.tasks?.length || 0;
    const completedTasks = project.tasks?.filter(t => t.completed).length || 0;
    const progress = taskCount > 0 ? (completedTasks / taskCount) * 100 : 0;

    return {
      bookmarkCount,
      noteCount,
      taskCount,
      completedTasks,
      progress,
      isCompleted: taskCount > 0 && completedTasks === taskCount
    };
  };

  const statusOptions = [
    { id: 'all', label: 'All Projects', icon: FiFolder },
    { id: 'active', label: 'Active', icon: FiPlay },
    { id: 'completed', label: 'Completed', icon: FiCheck },
    { id: 'in-progress', label: 'In Progress', icon: FiClock },
    { id: 'archived', label: 'Archived', icon: FiArchive }
  ];

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
        className="bg-white dark:bg-secondary-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-secondary-200 dark:border-secondary-700"
      >
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <SafeIcon icon={FiFolder} className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Project Manager</h2>
                <p className="text-primary-100">Organize your bookmarks into projects</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* ✨ NEW: Bulk add bookmarks button */}
              <button
                onClick={() => setShowBulkAddBookmarks(true)}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 backdrop-blur-sm"
              >
                <SafeIcon icon={FiPlus} className="w-4 h-4" />
                <SafeIcon icon={FiBookmark} className="w-4 h-4" />
                Bulk Add
              </button>

              {/* ✨ NEW: Quick add buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowQuickAddBookmark(true)}
                  className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 backdrop-blur-sm text-sm"
                  title="Quick Add Bookmark"
                >
                  <SafeIcon icon={FiBookmark} className="w-4 h-4" />
                  <span className="hidden sm:inline">Bookmark</span>
                </button>
                <button
                  onClick={() => setShowQuickAddNote(true)}
                  className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 backdrop-blur-sm text-sm"
                  title="Quick Add Note"
                >
                  <SafeIcon icon={FiFileText} className="w-4 h-4" />
                  <span className="hidden sm:inline">Note</span>
                </button>
                <button
                  onClick={() => setShowQuickAddTask(true)}
                  className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 backdrop-blur-sm text-sm"
                  title="Quick Add Task"
                >
                  <SafeIcon icon={FiCheckSquare} className="w-4 h-4" />
                  <span className="hidden sm:inline">Task</span>
                </button>
              </div>

              <div className="w-px h-8 bg-white/20"></div>

              <button
                onClick={() => setShowImportDialog(true)}
                className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 backdrop-blur-sm"
              >
                <SafeIcon icon={FiUpload} className="w-4 h-4" />
                Import
              </button>

              <button
                onClick={handleCreateProject}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 backdrop-blur-sm"
              >
                <SafeIcon icon={FiPlus} className="w-4 h-4" />
                New Project
              </button>

              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <SafeIcon icon={FiX} className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="mt-4 flex gap-4">
            <div className="flex-1 relative">
              <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className="w-full pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/50 appearance-none pr-8"
              >
                {statusOptions.map(option => (
                  <option key={option.id} value={option.id} className="text-secondary-900">
                    {option.label}
                  </option>
                ))}
              </select>
              <SafeIcon icon={FiFilter} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <SafeIcon icon={FiFolder} className="w-12 h-12 text-primary-500" />
              </div>
              <h3 className="text-2xl font-semibold text-secondary-900 dark:text-white mb-3">
                {searchQuery || statusFilter !== 'all' ? 'No Projects Found' : 'No Projects Yet'}
              </h3>
              <p className="text-secondary-600 dark:text-secondary-400 mb-6 max-w-md mx-auto">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Create your first project to organize bookmarks, take notes, and track tasks all in one place.'
                }
              </p>
              {(!searchQuery && statusFilter === 'all') && (
                <button
                  onClick={handleCreateProject}
                  className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-8 py-3 rounded-xl font-medium transition-all flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl"
                >
                  <SafeIcon icon={FiPlus} className="w-5 h-5" />
                  Create First Project
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEdit={handleEditProject}
                  onDelete={onDeleteProject}
                  onView={handleViewProject}
                  onDuplicate={handleDuplicateProject}
                  onArchive={handleArchiveProject}
                  onExport={handleExportProject}
                  stats={getProjectStats(project)}
                />
              ))}
            </div>
          )}
        </div>

        <AnimatePresence>
          {showForm && (
            <ProjectForm
              project={editingProject}
              onSave={editingProject ? onUpdateProject : onCreateProject}
              onCancel={handleCloseForm}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {selectedProject && (
            <ProjectDetail
              project={selectedProject}
              onClose={() => setSelectedProject(null)}
              onUpdate={onUpdateProject}
              bookmarks={bookmarks}
              onAddBookmark={onAddBookmarkToProject}
              onRemoveBookmark={onRemoveBookmarkFromProject}
              onAddNote={onAddNoteToProject}
              onUpdateNote={onUpdateNoteInProject}
              onDeleteNote={onDeleteNoteFromProject}
              onAddTask={onAddTaskToProject}
              onUpdateTask={onUpdateTaskInProject}
              onToggleTask={onToggleTaskInProject}
              onDeleteTask={onDeleteTaskFromProject}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showImportDialog && (
            <ImportProjectDialog
              onClose={() => setShowImportDialog(false)}
              onImport={handleImportProject}
            />
          )}
        </AnimatePresence>

        {/* ✨ NEW: Bulk Add Bookmarks Dialog */}
        <AnimatePresence>
          {showBulkAddBookmarks && (
            <BulkAddBookmarksDialog
              projects={filteredProjects}
              bookmarks={bookmarks}
              onClose={() => setShowBulkAddBookmarks(false)}
              onAdd={handleBulkAddBookmarks}
            />
          )}
        </AnimatePresence>

        {/* ✨ NEW: Quick Add Dialogs */}
        <AnimatePresence>
          {showQuickAddBookmark && (
            <QuickAddBookmarkDialog
              projects={filteredProjects}
              onClose={() => setShowQuickAddBookmark(false)}
              onAdd={handleQuickAddBookmark}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showQuickAddNote && (
            <QuickAddNoteDialog
              projects={filteredProjects}
              onClose={() => setShowQuickAddNote(false)}
              onAdd={handleQuickAddNote}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showQuickAddTask && (
            <QuickAddTaskDialog
              projects={filteredProjects}
              onClose={() => setShowQuickAddTask(false)}
              onAdd={handleQuickAddTask}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

// ✨ NEW: Bulk Add Bookmarks Dialog
const BulkAddBookmarksDialog = ({ projects, bookmarks, onClose, onAdd }) => {
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedBookmarks, setSelectedBookmarks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Filter bookmarks based on search and category
  const filteredBookmarks = React.useMemo(() => {
    return bookmarks.filter(bookmark => {
      const matchesSearch = !searchQuery || 
        bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bookmark.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bookmark.url.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = !categoryFilter || bookmark.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });
  }, [bookmarks, searchQuery, categoryFilter]);

  // Get unique categories
  const categories = React.useMemo(() => {
    return [...new Set(bookmarks.map(b => b.category))].filter(Boolean).sort();
  }, [bookmarks]);

  const handleSelectBookmark = (bookmarkId) => {
    setSelectedBookmarks(prev => 
      prev.includes(bookmarkId) 
        ? prev.filter(id => id !== bookmarkId)
        : [...prev, bookmarkId]
    );
  };

  const handleSelectAll = () => {
    if (selectedBookmarks.length === filteredBookmarks.length) {
      setSelectedBookmarks([]);
    } else {
      setSelectedBookmarks(filteredBookmarks.map(b => b.id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedProject && selectedBookmarks.length > 0) {
      onAdd(selectedProject, selectedBookmarks);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-10"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-secondary-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-secondary-200 dark:border-secondary-700"
      >
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <SafeIcon icon={FiBookmark} className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Add Multiple Bookmarks to Project</h3>
                <p className="text-blue-100">Select bookmarks and add them to a project</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <SafeIcon icon={FiX} className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Selection */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Select Project *
              </label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:text-white"
                required
              >
                <option value="">Choose a project</option>
                {projects.filter(p => !p.archived).map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Search and Filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Search Bookmarks
                </label>
                <div className="relative">
                  <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by title, description, or URL..."
                    className="w-full pl-10 pr-4 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Filter by Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:text-white"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selection Controls */}
            <div className="flex items-center justify-between bg-secondary-50 dark:bg-secondary-700 p-4 rounded-lg">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                >
                  {selectedBookmarks.length === filteredBookmarks.length ? 'Deselect All' : 'Select All'}
                </button>
                <span className="text-sm text-secondary-600 dark:text-secondary-400">
                  {selectedBookmarks.length} of {filteredBookmarks.length} bookmarks selected
                </span>
              </div>
              {selectedBookmarks.length > 0 && (
                <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                  Ready to add {selectedBookmarks.length} bookmark{selectedBookmarks.length > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Bookmarks List */}
            <div className="border border-secondary-200 dark:border-secondary-600 rounded-lg max-h-96 overflow-y-auto">
              {filteredBookmarks.length > 0 ? (
                <div className="space-y-1 p-2">
                  {filteredBookmarks.map(bookmark => (
                    <div
                      key={bookmark.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                        selectedBookmarks.includes(bookmark.id)
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-secondary-200 dark:border-secondary-600 hover:border-secondary-300 dark:hover:border-secondary-500 hover:bg-secondary-50 dark:hover:bg-secondary-700'
                      }`}
                      onClick={() => handleSelectBookmark(bookmark.id)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedBookmarks.includes(bookmark.id)}
                        onChange={() => handleSelectBookmark(bookmark.id)}
                        className="w-4 h-4 text-primary-600 rounded"
                      />
                      <div className="w-8 h-8 bg-secondary-100 dark:bg-secondary-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        {bookmark.favicon ? (
                          <img src={bookmark.favicon} alt="" className="w-5 h-5 object-contain" />
                        ) : (
                          <SafeIcon icon={FiBookmark} className="w-4 h-4 text-secondary-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-secondary-900 dark:text-white truncate">
                          {bookmark.title}
                        </h4>
                        <p className="text-sm text-secondary-500 truncate">{bookmark.url}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {bookmark.category && (
                            <span className="text-xs bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400 px-2 py-0.5 rounded">
                              {bookmark.category}
                            </span>
                          )}
                          {bookmark.tags && bookmark.tags.length > 0 && (
                            <span className="text-xs text-secondary-400">
                              {bookmark.tags.length} tag{bookmark.tags.length > 1 ? 's' : ''}
                            </span>
                          )}
                          {bookmark.isFavorite && (
                            <SafeIcon icon={FiStar} className="w-3 h-3 text-yellow-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <SafeIcon icon={FiBookmark} className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
                  <p className="text-secondary-600 dark:text-secondary-400">
                    No bookmarks found matching your criteria
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={!selectedProject || selectedBookmarks.length === 0}
                className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:from-secondary-300 disabled:to-secondary-400 text-white py-3 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              >
                <SafeIcon icon={FiPlus} className="w-4 h-4" />
                Add {selectedBookmarks.length} Bookmark{selectedBookmarks.length > 1 ? 's' : ''}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-secondary-300 dark:border-secondary-600 text-secondary-700 dark:text-secondary-300 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors font-medium"
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

// ✨ NEW: Quick Add Bookmark Dialog
const QuickAddBookmarkDialog = ({ projects, onClose, onAdd }) => {
  const [selectedProject, setSelectedProject] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    category: 'Quick Add',
    tags: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title.trim() && formData.url.trim() && selectedProject) {
      try {
        const bookmarkData = {
          ...formData,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          favicon: `https://www.google.com/s2/favicons?domain=${new URL(formData.url).hostname}`
        };
        onAdd(selectedProject, bookmarkData);
      } catch (error) {
        const bookmarkData = {
          ...formData,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          favicon: ''
        };
        onAdd(selectedProject, bookmarkData);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-10"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-secondary-800 rounded-2xl shadow-2xl max-w-md w-full border border-secondary-200 dark:border-secondary-700"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-secondary-900 dark:text-white">
              Quick Add Bookmark
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-lg transition-colors"
            >
              <SafeIcon icon={FiX} className="w-5 h-5 text-secondary-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Project *
              </label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:text-white"
                required
              >
                <option value="">Select a project</option>
                {projects.filter(p => !p.archived).map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:text-white"
                placeholder="Bookmark title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                URL *
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:text-white"
                placeholder="https://example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:text-white resize-none"
                placeholder="Brief description"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              >
                <SafeIcon icon={FiBookmark} className="w-4 h-4" />
                Add Bookmark
              </button>
              <button
                type="button"
                onClick={onClose}
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

// ✨ NEW: Quick Add Note Dialog
const QuickAddNoteDialog = ({ projects, onClose, onAdd }) => {
  const [selectedProject, setSelectedProject] = useState('');
  const [noteContent, setNoteContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (noteContent.trim() && selectedProject) {
      onAdd(selectedProject, noteContent);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-10"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-secondary-800 rounded-2xl shadow-2xl max-w-md w-full border border-secondary-200 dark:border-secondary-700"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-secondary-900 dark:text-white">
              Quick Add Note
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-lg transition-colors"
            >
              <SafeIcon icon={FiX} className="w-5 h-5 text-secondary-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Project *
              </label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:text-white"
                required
              >
                <option value="">Select a project</option>
                {projects.filter(p => !p.archived).map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Note Content *
              </label>
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:text-white resize-none"
                placeholder="Write your note here..."
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              >
                <SafeIcon icon={FiFileText} className="w-4 h-4" />
                Add Note
              </button>
              <button
                type="button"
                onClick={onClose}
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

// ✨ NEW: Quick Add Task Dialog
const QuickAddTaskDialog = ({ projects, onClose, onAdd }) => {
  const [selectedProject, setSelectedProject] = useState('');
  const [taskTitle, setTaskTitle] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (taskTitle.trim() && selectedProject) {
      onAdd(selectedProject, taskTitle);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-10"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-secondary-800 rounded-2xl shadow-2xl max-w-md w-full border border-secondary-200 dark:border-secondary-700"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-secondary-900 dark:text-white">
              Quick Add Task
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-lg transition-colors"
            >
              <SafeIcon icon={FiX} className="w-5 h-5 text-secondary-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Project *
              </label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:text-white"
                required
              >
                <option value="">Select a project</option>
                {projects.filter(p => !p.archived).map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Task Title *
              </label>
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:text-white"
                placeholder="Enter task title..."
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              >
                <SafeIcon icon={FiCheckSquare} className="w-4 h-4" />
                Add Task
              </button>
              <button
                type="button"
                onClick={onClose}
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

// Keep all the other existing components (ProjectCard, ProjectForm, etc.)
const ProjectCard = ({ project, onEdit, onDelete, onView, onDuplicate, onArchive, onExport, stats }) => {
  const [showActions, setShowActions] = useState(false);

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      onDelete(project.id);
    }
  };

  const handleAction = (e, action) => {
    e.stopPropagation();
    action(project.id);
    setShowActions(false);
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className="bg-gradient-to-br from-white to-secondary-50 dark:from-secondary-800 dark:to-secondary-900 rounded-xl p-6 border border-secondary-200 dark:border-secondary-700 cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 relative"
      onClick={() => onView(project)}
    >
      {project.archived && (
        <div className="absolute top-3 right-3 bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 px-2 py-1 rounded-full text-xs font-medium">
          Archived
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: project.color }}
          />
          <h3 className="font-bold text-secondary-900 dark:text-white text-lg truncate">
            {project.name}
          </h3>
        </div>
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowActions(!showActions);
            }}
            className="p-2 hover:bg-secondary-200 dark:hover:bg-secondary-600 rounded-lg transition-colors"
          >
            <SafeIcon icon={FiMoreHorizontal} className="w-4 h-4 text-secondary-500" />
          </button>
          {showActions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="absolute right-0 top-full mt-1 bg-white dark:bg-secondary-700 rounded-lg shadow-xl border border-secondary-200 dark:border-secondary-600 py-1 z-10 min-w-[160px]"
            >
              <button
                onClick={(e) => handleAction(e, onEdit)}
                className="w-full px-3 py-2 text-left text-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-600 flex items-center gap-2"
              >
                <SafeIcon icon={FiEdit} className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={(e) => handleAction(e, onDuplicate)}
                className="w-full px-3 py-2 text-left text-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-600 flex items-center gap-2"
              >
                <SafeIcon icon={FiCopy} className="w-4 h-4" />
                Duplicate
              </button>
              <button
                onClick={(e) => handleAction(e, onExport)}
                className="w-full px-3 py-2 text-left text-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-600 flex items-center gap-2"
              >
                <SafeIcon icon={FiDownload} className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={(e) => handleAction(e, onArchive)}
                className="w-full px-3 py-2 text-left text-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-600 flex items-center gap-2"
              >
                <SafeIcon icon={FiArchive} className="w-4 h-4" />
                {project.archived ? 'Unarchive' : 'Archive'}
              </button>
              <hr className="my-1 border-secondary-200 dark:border-secondary-600" />
              <button
                onClick={handleDelete}
                className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
              >
                <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                Delete
              </button>
            </motion.div>
          )}
        </div>
      </div>

      <p className="text-secondary-600 dark:text-secondary-400 mb-4 line-clamp-2 text-sm">
        {project.description || 'No description provided'}
      </p>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <SafeIcon icon={FiBookmark} className="w-4 h-4 text-primary-500" />
              <span className="text-secondary-600 dark:text-secondary-400">{stats.bookmarkCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <SafeIcon icon={FiFileText} className="w-4 h-4 text-blue-500" />
              <span className="text-secondary-600 dark:text-secondary-400">{stats.noteCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <SafeIcon icon={FiTarget} className="w-4 h-4 text-green-500" />
              <span className="text-secondary-600 dark:text-secondary-400">{stats.completedTasks}/{stats.taskCount}</span>
            </div>
          </div>
          {stats.isCompleted && (
            <div className="flex items-center gap-1 text-green-500">
              <SafeIcon icon={FiCheck} className="w-4 h-4" />
              <span className="text-xs font-medium">Complete</span>
            </div>
          )}
        </div>

        {stats.taskCount > 0 && (
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-secondary-500">Progress</span>
              <span className="text-secondary-600 dark:text-secondary-400">{Math.round(stats.progress)}%</span>
            </div>
            <div className="w-full bg-secondary-200 dark:bg-secondary-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${stats.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-secondary-200 dark:border-secondary-700">
        <div className="flex items-center justify-between text-xs text-secondary-500">
          <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
          <div className="flex items-center gap-1">
            <SafeIcon icon={FiClock} className="w-3 h-3" />
            <span>{new Date(project.updatedAt || project.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ✨ FIXED: ProjectForm with auto-population
const ProjectForm = ({ project, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#0ea5e9'
  });

  // ✨ FIXED: Auto-populate form fields when editing
  React.useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        color: project.color || '#0ea5e9'
      });
    } else {
      // Reset form for new project
      setFormData({
        name: '',
        description: '',
        color: '#0ea5e9'
      });
    }
  }, [project]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim()) {
      if (project) {
        onSave(project.id, {
          ...formData,
          updatedAt: new Date().toISOString()
        });
      } else {
        onSave(formData);
      }
      onCancel();
    }
  };

  const colorOptions = [
    '#0ea5e9', '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
    '#10b981', '#ef4444', '#64748b', '#06b6d4', '#84cc16'
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-10"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-secondary-800 rounded-2xl shadow-2xl max-w-md w-full border border-secondary-200 dark:border-secondary-700"
      >
        <div className="p-6">
          <h3 className="text-2xl font-bold text-secondary-900 dark:text-white mb-6">
            {project ? 'Edit Project' : 'Create New Project'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-secondary-300 dark:border-secondary-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:text-white transition-all"
                placeholder="Enter project name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 border border-secondary-300 dark:border-secondary-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:text-white transition-all resize-none"
                placeholder="Project description"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-3">
                Color Theme
              </label>
              <div className="grid grid-cols-5 gap-3">
                {colorOptions.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${
                      formData.color === color
                        ? 'border-secondary-400 scale-110'
                        : 'border-secondary-200 dark:border-secondary-600 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <SafeIcon icon={FiSave} className="w-4 h-4" />
                {project ? 'Update' : 'Create'} Project
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 border border-secondary-300 dark:border-secondary-600 text-secondary-700 dark:text-secondary-300 rounded-xl hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-all font-semibold"
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

const ImportProjectDialog = ({ onClose, onImport }) => {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = React.useRef(null);

  const handleFileSelect = (file) => {
    if (file && file.name.endsWith('.json')) {
      onImport(file);
    } else {
      alert('Please select a valid JSON project file.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-10"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-secondary-800 rounded-2xl shadow-2xl max-w-md w-full border border-secondary-200 dark:border-secondary-700"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-secondary-900 dark:text-white">
              Import Project
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-lg transition-colors"
            >
              <SafeIcon icon={FiX} className="w-5 h-5 text-secondary-500" />
            </button>
          </div>

          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              dragOver
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-secondary-300 dark:border-secondary-600'
            }`}
          >
            <SafeIcon icon={FiUpload} className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
            <p className="text-secondary-600 dark:text-secondary-400 mb-4">
              Drag and drop a project JSON file here, or click to browse
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Browse Files
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={(e) => {
              if (e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
              }
            }}
            className="hidden"
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

const ProjectDetail = ({
  project,
  onClose,
  onUpdate,
  bookmarks,
  onAddBookmark,
  onRemoveBookmark,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  onAddTask,
  onUpdateTask,
  onToggleTask,
  onDeleteTask,
  activeTab,
  onTabChange
}) => {
  const [newNote, setNewNote] = useState('');
  const [newTask, setNewTask] = useState('');
  const [selectedBookmarks, setSelectedBookmarks] = useState([]);
  const [editingNote, setEditingNote] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  const handleAddNote = () => {
    if (newNote.trim() && onAddNote) {
      onAddNote(project.id, newNote);
      setNewNote('');
    }
  };

  const handleUpdateNote = (noteId, content) => {
    if (onUpdateNote) {
      onUpdateNote(project.id, noteId, content);
      setEditingNote(null);
    }
  };

  const handleDeleteNote = (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      if (onDeleteNote) {
        onDeleteNote(project.id, noteId);
      }
    }
  };

  const handleAddTask = () => {
    if (newTask.trim() && onAddTask) {
      onAddTask(project.id, newTask);
      setNewTask('');
    }
  };

  const handleToggleTask = (taskId) => {
    if (onToggleTask) {
      onToggleTask(project.id, taskId);
    }
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      if (onDeleteTask) {
        onDeleteTask(project.id, taskId);
      }
    }
  };

  // ✨ FIXED: Handle adding multiple selected bookmarks
  const handleAddBookmarks = () => {
    console.log('ProjectDetail: Adding bookmarks:', selectedBookmarks);
    if (selectedBookmarks.length > 0 && onAddBookmark) {
      // Pass the project ID and all selected bookmark IDs
      onAddBookmark(project.id, selectedBookmarks);
      // Clear selections after adding
      setSelectedBookmarks([]);
    }
  };

  const handleRemoveBookmark = (bookmarkId) => {
    if (onRemoveBookmark) {
      onRemoveBookmark(project.id, bookmarkId);
    }
  };

  const projectBookmarks = bookmarks.filter(bookmark => 
    project.bookmarks?.includes(bookmark.id)
  );

  const availableBookmarks = bookmarks.filter(bookmark => 
    !project.bookmarks?.includes(bookmark.id)
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiTarget },
    { id: 'bookmarks', label: 'Bookmarks', icon: FiBookmark },
    { id: 'notes', label: 'Notes', icon: FiFileText },
    { id: 'tasks', label: 'Tasks', icon: FiCheckSquare }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-white dark:bg-secondary-800"
    >
      <div 
        className="p-6 border-b border-secondary-200 dark:border-secondary-700"
        style={{
          background: `linear-gradient(135deg, ${project.color}20, ${project.color}10)`,
          borderBottom: `2px solid ${project.color}30`
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
              style={{ backgroundColor: project.color }}
            >
              <SafeIcon icon={FiFolder} className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-secondary-900 dark:text-white">
                {project.name}
              </h3>
              <p className="text-secondary-600 dark:text-secondary-400">
                {project.description || 'No description provided'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-lg transition-colors"
          >
            <SafeIcon icon={FiX} className="w-5 h-5 text-secondary-500" />
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white shadow-md'
                  : 'text-secondary-600 dark:text-secondary-400 hover:bg-white/50 dark:hover:bg-secondary-700/50'
              }`}
            >
              <SafeIcon icon={tab.icon} className="w-4 h-4" />
              {tab.label}
              {tab.id === 'bookmarks' && (
                <span className="bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded-full text-xs">
                  {projectBookmarks.length}
                </span>
              )}
              {tab.id === 'notes' && (
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full text-xs">
                  {project.notes?.length || 0}
                </span>
              )}
              {tab.id === 'tasks' && (
                <span className="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full text-xs">
                  {project.tasks?.filter(t => t.completed).length || 0}/{project.tasks?.length || 0}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
        {activeTab === 'overview' && (
          <ProjectOverview project={project} bookmarks={projectBookmarks} />
        )}
        {activeTab === 'bookmarks' && (
          <ProjectBookmarks
            projectBookmarks={projectBookmarks}
            availableBookmarks={availableBookmarks}
            selectedBookmarks={selectedBookmarks}
            onSelectBookmark={setSelectedBookmarks}
            onAddBookmarks={handleAddBookmarks}
            onRemoveBookmark={handleRemoveBookmark}
          />
        )}
        {activeTab === 'notes' && (
          <ProjectNotes
            notes={project.notes || []}
            newNote={newNote}
            onNewNoteChange={setNewNote}
            onAddNote={handleAddNote}
            onUpdateNote={handleUpdateNote}
            onDeleteNote={handleDeleteNote}
            editingNote={editingNote}
            onEditingNoteChange={setEditingNote}
          />
        )}
        {activeTab === 'tasks' && (
          <ProjectTasks
            tasks={project.tasks || []}
            newTask={newTask}
            onNewTaskChange={setNewTask}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            editingTask={editingTask}
            onEditingTaskChange={setEditingTask}
            onUpdateTask={onUpdateTask}
            projectId={project.id}
          />
        )}
      </div>
    </motion.div>
  );
};

const ProjectOverview = ({ project, bookmarks }) => {
  const stats = {
    bookmarks: bookmarks.length,
    notes: project.notes?.length || 0,
    tasks: project.tasks?.length || 0,
    completedTasks: project.tasks?.filter(t => t.completed).length || 0
  };

  const progress = stats.tasks > 0 ? (stats.completedTasks / stats.tasks) * 100 : 0;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <SafeIcon icon={FiBookmark} className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.bookmarks}</p>
              <p className="text-sm text-blue-600 dark:text-blue-400">Bookmarks</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-xl border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3">
            <SafeIcon icon={FiFileText} className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.notes}</p>
              <p className="text-sm text-green-600 dark:text-green-400">Notes</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-3">
            <SafeIcon icon={FiTarget} className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.tasks}</p>
              <p className="text-sm text-purple-600 dark:text-purple-400">Tasks</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-6 rounded-xl border border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-3">
            <SafeIcon icon={FiCheck} className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{Math.round(progress)}%</p>
              <p className="text-sm text-orange-600 dark:text-orange-400">Progress</p>
            </div>
          </div>
        </div>
      </div>

      {stats.tasks > 0 && (
        <div className="bg-gradient-to-r from-secondary-50 to-secondary-100 dark:from-secondary-800 dark:to-secondary-700 p-6 rounded-xl">
          <h4 className="font-semibold text-secondary-900 dark:text-white mb-4">Task Progress</h4>
          <div className="w-full bg-secondary-200 dark:bg-secondary-600 rounded-full h-4">
            <div 
              className="bg-gradient-to-r from-green-400 to-green-500 h-4 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-2">
            {stats.completedTasks} of {stats.tasks} tasks completed
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-secondary-800 p-6 rounded-xl border border-secondary-200 dark:border-secondary-700">
          <h4 className="font-semibold text-secondary-900 dark:text-white mb-4">Recent Bookmarks</h4>
          {bookmarks.length > 0 ? (
            <div className="space-y-3">
              {bookmarks.slice(0, 3).map(bookmark => (
                <div key={bookmark.id} className="flex items-center gap-3 p-3 bg-secondary-50 dark:bg-secondary-700 rounded-lg">
                  <SafeIcon icon={FiBookmark} className="w-4 h-4 text-primary-500" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-secondary-900 dark:text-white truncate">{bookmark.title}</p>
                    <p className="text-sm text-secondary-500 truncate">{bookmark.url}</p>
                  </div>
                  <button
                    onClick={() => window.open(bookmark.url, '_blank')}
                    className="p-1 hover:bg-secondary-200 dark:hover:bg-secondary-600 rounded"
                  >
                    <SafeIcon icon={FiExternalLink} className="w-4 h-4 text-secondary-500" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-secondary-500 text-center py-4">No bookmarks yet</p>
          )}
        </div>

        <div className="bg-white dark:bg-secondary-800 p-6 rounded-xl border border-secondary-200 dark:border-secondary-700">
          <h4 className="font-semibold text-secondary-900 dark:text-white mb-4">Recent Notes</h4>
          {project.notes && project.notes.length > 0 ? (
            <div className="space-y-3">
              {project.notes.slice(-3).map(note => (
                <div key={note.id} className="p-3 bg-secondary-50 dark:bg-secondary-700 rounded-lg">
                  <p className="text-secondary-900 dark:text-white text-sm">{note.content}</p>
                  <p className="text-xs text-secondary-500 mt-1">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-secondary-500 text-center py-4">No notes yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

// ✨ FIXED: ProjectBookmarks component with proper multiple bookmark selection
const ProjectBookmarks = ({ 
  projectBookmarks, 
  availableBookmarks, 
  selectedBookmarks, 
  onSelectBookmark, 
  onAddBookmarks, 
  onRemoveBookmark 
}) => {
  const [showAddBookmarks, setShowAddBookmarks] = useState(false);

  const handleSelectBookmark = (bookmarkId) => {
    console.log('Selecting/deselecting bookmark:', bookmarkId);
    onSelectBookmark(prev => {
      const newSelection = prev.includes(bookmarkId)
        ? prev.filter(id => id !== bookmarkId)
        : [...prev, bookmarkId];
      console.log('New selection:', newSelection);
      return newSelection;
    });
  };

  // ✨ FIXED: Add all selected bookmarks and clear selections
  const handleAddSelectedBookmarks = () => {
    console.log('ProjectBookmarks: Adding selected bookmarks:', selectedBookmarks);
    if (selectedBookmarks.length > 0) {
      onAddBookmarks();
      setShowAddBookmarks(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-secondary-900 dark:text-white">
          Project Bookmarks ({projectBookmarks.length})
        </h4>
        <button
          onClick={() => setShowAddBookmarks(!showAddBookmarks)}
          className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <SafeIcon icon={FiPlus} className="w-4 h-4" />
          Add Bookmarks
        </button>
      </div>

      {showAddBookmarks && (
        <div className="bg-secondary-50 dark:bg-secondary-700 p-4 rounded-xl border border-secondary-200 dark:border-secondary-600">
          <div className="flex items-center justify-between mb-4">
            <h5 className="font-medium text-secondary-900 dark:text-white">
              Available Bookmarks ({availableBookmarks.length})
            </h5>
            {selectedBookmarks.length > 0 && (
              <button
                onClick={handleAddSelectedBookmarks}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
              >
                Add Selected ({selectedBookmarks.length})
              </button>
            )}
          </div>

          {selectedBookmarks.length > 0 && (
            <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {selectedBookmarks.length} bookmark{selectedBookmarks.length > 1 ? 's' : ''} selected
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
            {availableBookmarks.map(bookmark => (
              <div
                key={bookmark.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                  selectedBookmarks.includes(bookmark.id)
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-secondary-200 dark:border-secondary-600 hover:border-secondary-300 dark:hover:border-secondary-500'
                }`}
                onClick={() => handleSelectBookmark(bookmark.id)}
              >
                <input
                  type="checkbox"
                  checked={selectedBookmarks.includes(bookmark.id)}
                  onChange={() => handleSelectBookmark(bookmark.id)}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-secondary-900 dark:text-white truncate text-sm">
                    {bookmark.title}
                  </p>
                  <p className="text-xs text-secondary-500 truncate">{bookmark.url}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {projectBookmarks.length > 0 ? (
          projectBookmarks.map(bookmark => (
            <div key={bookmark.id} className="flex items-center gap-4 p-4 bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-700 hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                <SafeIcon icon={FiBookmark} className="w-5 h-5 text-primary-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="font-medium text-secondary-900 dark:text-white truncate">
                  {bookmark.title}
                </h5>
                <p className="text-sm text-secondary-500 truncate">{bookmark.url}</p>
                {bookmark.description && (
                  <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-1 line-clamp-2">
                    {bookmark.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.open(bookmark.url, '_blank')}
                  className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-lg transition-colors"
                >
                  <SafeIcon icon={FiExternalLink} className="w-4 h-4 text-secondary-500" />
                </button>
                <button
                  onClick={() => onRemoveBookmark(bookmark.id)}
                  className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <SafeIcon icon={FiTrash2} className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <SafeIcon icon={FiBookmark} className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
            <p className="text-secondary-600 dark:text-secondary-400">
              No bookmarks in this project yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const ProjectNotes = ({ notes, newNote, onNewNoteChange, onAddNote, onUpdateNote, onDeleteNote, editingNote, onEditingNoteChange }) => {
  const [editContent, setEditContent] = useState('');

  const handleStartEdit = (note) => {
    onEditingNoteChange(note.id);
    setEditContent(note.content);
  };

  const handleSaveEdit = (noteId) => {
    if (editContent.trim()) {
      onUpdateNote(noteId, editContent);
      setEditContent('');
    }
  };

  const handleCancelEdit = () => {
    onEditingNoteChange(null);
    setEditContent('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-secondary-800 p-4 rounded-xl border border-secondary-200 dark:border-secondary-700">
        <div className="flex gap-3">
          <textarea
            value={newNote}
            onChange={(e) => onNewNoteChange(e.target.value)}
            placeholder="Add a note..."
            className="flex-1 px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:text-white resize-none"
            rows={3}
          />
          <button
            onClick={onAddNote}
            disabled={!newNote.trim()}
            className="bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {notes.length > 0 ? (
          notes.map(note => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800"
            >
              {editingNote === note.id ? (
                <div className="space-y-3">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:text-white resize-none"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(note.id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="bg-secondary-500 hover:bg-secondary-600 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <p className="text-secondary-900 dark:text-white flex-1">
                    {note.content}
                  </p>
                  <div className="flex items-center gap-1 ml-3">
                    <button
                      onClick={() => handleStartEdit(note)}
                      className="p-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded transition-colors"
                    >
                      <SafeIcon icon={FiEdit} className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                      onClick={() => onDeleteNote(note.id)}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                    >
                      <SafeIcon icon={FiTrash2} className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              )}
              {editingNote !== note.id && (
                <div className="flex items-center gap-2 mt-3 text-xs text-secondary-500">
                  <SafeIcon icon={FiCalendar} className="w-3 h-3" />
                  {new Date(note.createdAt).toLocaleDateString()}
                  {note.updatedAt && note.updatedAt !== note.createdAt && (
                    <span>
                      • Updated {new Date(note.updatedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12">
            <SafeIcon icon={FiFileText} className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
            <p className="text-secondary-600 dark:text-secondary-400">
              No notes yet. Add your first note above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const ProjectTasks = ({ tasks, newTask, onNewTaskChange, onAddTask, onToggleTask, onDeleteTask, editingTask, onEditingTaskChange, onUpdateTask, projectId }) => {
  const [editContent, setEditContent] = useState('');

  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);

  const handleStartEdit = (task) => {
    onEditingTaskChange(task.id);
    setEditContent(task.title);
  };

  const handleSaveEdit = (taskId) => {
    if (editContent.trim() && onUpdateTask) {
      onUpdateTask(projectId, taskId, { title: editContent });
      setEditContent('');
      onEditingTaskChange(null);
    }
  };

  const handleCancelEdit = () => {
    onEditingTaskChange(null);
    setEditContent('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-secondary-800 p-4 rounded-xl border border-secondary-200 dark:border-secondary-700">
        <div className="flex gap-3">
          <input
            type="text"
            value={newTask}
            onChange={(e) => onNewTaskChange(e.target.value)}
            placeholder="Add a task..."
            className="flex-1 px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:text-white"
            onKeyPress={(e) => e.key === 'Enter' && onAddTask()}
          />
          <button
            onClick={onAddTask}
            disabled={!newTask.trim()}
            className="bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {pendingTasks.length > 0 && (
          <div>
            <h5 className="font-medium text-secondary-900 dark:text-white mb-3">
              Pending Tasks ({pendingTasks.length})
            </h5>
            <div className="space-y-2">
              {pendingTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={onToggleTask}
                  onDelete={onDeleteTask}
                  editingTask={editingTask}
                  editContent={editContent}
                  onEditContentChange={setEditContent}
                  onStartEdit={handleStartEdit}
                  onSaveEdit={handleSaveEdit}
                  onCancelEdit={handleCancelEdit}
                />
              ))}
            </div>
          </div>
        )}

        {completedTasks.length > 0 && (
          <div>
            <h5 className="font-medium text-secondary-900 dark:text-white mb-3">
              Completed Tasks ({completedTasks.length})
            </h5>
            <div className="space-y-2">
              {completedTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={onToggleTask}
                  onDelete={onDeleteTask}
                  editingTask={editingTask}
                  editContent={editContent}
                  onEditContentChange={setEditContent}
                  onStartEdit={handleStartEdit}
                  onSaveEdit={handleSaveEdit}
                  onCancelEdit={handleCancelEdit}
                />
              ))}
            </div>
          </div>
        )}

        {tasks.length === 0 && (
          <div className="text-center py-12">
            <SafeIcon icon={FiTarget} className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
            <p className="text-secondary-600 dark:text-secondary-400">
              No tasks yet. Add your first task above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const TaskItem = ({ task, onToggle, onDelete, editingTask, editContent, onEditContentChange, onStartEdit, onSaveEdit, onCancelEdit }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
        task.completed
          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
          : 'bg-white dark:bg-secondary-800 border-secondary-200 dark:border-secondary-700'
      }`}
    >
      <button
        onClick={() => onToggle(task.id)}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
          task.completed
            ? 'bg-green-500 border-green-500 text-white'
            : 'border-secondary-300 dark:border-secondary-600 hover:border-green-500'
        }`}
      >
        {task.completed && <SafeIcon icon={FiCheck} className="w-4 h-4" />}
      </button>

      <div className="flex-1">
        {editingTask === task.id ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={editContent}
              onChange={(e) => onEditContentChange(e.target.value)}
              className="flex-1 px-2 py-1 border border-secondary-300 dark:border-secondary-600 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 dark:bg-secondary-700 dark:text-white"
              onKeyPress={(e) => {
                if (e.key === 'Enter') onSaveEdit(task.id);
                if (e.key === 'Escape') onCancelEdit();
              }}
              autoFocus
            />
            <button
              onClick={() => onSaveEdit(task.id)}
              className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs transition-colors"
            >
              Save
            </button>
            <button
              onClick={onCancelEdit}
              className="bg-secondary-500 hover:bg-secondary-600 text-white px-2 py-1 rounded text-xs transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <span className={`${
            task.completed
              ? 'line-through text-secondary-500'
              : 'text-secondary-900 dark:text-white'
          }`}>
            {task.title}
          </span>
        )}
      </div>

      {editingTask !== task.id && (
        <>
          <div className="flex items-center gap-2 text-xs text-secondary-500">
            <SafeIcon icon={FiCalendar} className="w-3 h-3" />
            {new Date(task.createdAt).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onStartEdit(task)}
              className="p-1 hover:bg-secondary-200 dark:hover:bg-secondary-600 rounded transition-colors"
            >
              <SafeIcon icon={FiEdit} className="w-4 h-4 text-secondary-500" />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
            >
              <SafeIcon icon={FiTrash2} className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default ProjectManager;