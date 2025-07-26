import { useState, useEffect } from 'react';

const PROJECTS_STORAGE_KEY = 'bookmark-projects';

const defaultProjects = [
  {
    id: '1',
    name: 'Web Development',
    description: 'Resources for web development projects and learning materials',
    color: '#0ea5e9',
    bookmarks: ['1', '2'], // Reference existing bookmark IDs
    notes: [
      {
        id: '1',
        content: 'Remember to check React 18 updates and new features',
        createdAt: new Date().toISOString()
      }
    ],
    tasks: [
      {
        id: '1',
        title: 'Update project dependencies',
        completed: false,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Review new CSS Grid features',
        completed: true,
        createdAt: new Date().toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Design Resources',
    description: 'Collection of design inspiration and tools',
    color: '#8b5cf6',
    bookmarks: ['3'], // Reference existing bookmark IDs
    notes: [
      {
        id: '1',
        content: 'Explore new color palettes for upcoming projects',
        createdAt: new Date().toISOString()
      }
    ],
    tasks: [
      {
        id: '1',
        title: 'Create design system documentation',
        completed: false,
        createdAt: new Date().toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjects = () => {
      try {
        const stored = localStorage.getItem(PROJECTS_STORAGE_KEY);
        if (stored) {
          setProjects(JSON.parse(stored));
        } else {
          setProjects(defaultProjects);
          localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(defaultProjects));
        }
      } catch (error) {
        console.error('Error loading projects:', error);
        setProjects(defaultProjects);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  const saveProjects = (newProjects) => {
    try {
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(newProjects));
      setProjects(newProjects);
    } catch (error) {
      console.error('Error saving projects:', error);
    }
  };

  const createProject = (projectData) => {
    const newProject = {
      ...projectData,
      id: Date.now().toString(),
      bookmarks: [],
      notes: [],
      tasks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const newProjects = [...projects, newProject];
    saveProjects(newProjects);
    return newProject.id;
  };

  const updateProject = (id, updatedData) => {
    const newProjects = projects.map(project =>
      project.id === id
        ? { ...project, ...updatedData, updatedAt: new Date().toISOString() }
        : project
    );
    saveProjects(newProjects);
  };

  const deleteProject = (id) => {
    const newProjects = projects.filter(project => project.id !== id);
    saveProjects(newProjects);
  };

  // ✨ NEW: Add bookmark to project function
  const addBookmarkToProject = (projectId, bookmarkId) => {
    const newProjects = projects.map(project => {
      if (project.id === projectId) {
        const bookmarks = project.bookmarks || [];
        if (!bookmarks.includes(bookmarkId)) {
          return {
            ...project,
            bookmarks: [...bookmarks, bookmarkId],
            updatedAt: new Date().toISOString()
          };
        }
      }
      return project;
    });
    saveProjects(newProjects);
  };

  // ✨ NEW: Create and add bookmark to project
  const createBookmarkInProject = (projectId, bookmarkData, onCreateBookmark) => {
    if (onCreateBookmark) {
      // Create the bookmark first
      const bookmarkId = onCreateBookmark(bookmarkData);
      
      // Then add it to the project
      if (bookmarkId) {
        addBookmarkToProject(projectId, bookmarkId);
      }
      
      return bookmarkId;
    }
  };

  const removeBookmarkFromProject = (projectId, bookmarkId) => {
    const newProjects = projects.map(project => {
      if (project.id === projectId) {
        const bookmarks = project.bookmarks || [];
        return {
          ...project,
          bookmarks: bookmarks.filter(id => id !== bookmarkId),
          updatedAt: new Date().toISOString()
        };
      }
      return project;
    });
    saveProjects(newProjects);
  };

  // ✨ NEW: Direct note creation function
  const createNoteInProject = (projectId, noteContent) => {
    const newNote = {
      id: Date.now().toString(),
      content: noteContent,
      createdAt: new Date().toISOString()
    };

    const newProjects = projects.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          notes: [...(project.notes || []), newNote],
          updatedAt: new Date().toISOString()
        };
      }
      return project;
    });
    
    saveProjects(newProjects);
    return newNote.id;
  };

  const addNoteToProject = (projectId, noteContent) => {
    return createNoteInProject(projectId, noteContent);
  };

  const updateNoteInProject = (projectId, noteId, updatedContent) => {
    const newProjects = projects.map(project => {
      if (project.id === projectId) {
        const notes = project.notes.map(note =>
          note.id === noteId
            ? { ...note, content: updatedContent, updatedAt: new Date().toISOString() }
            : note
        );
        return {
          ...project,
          notes,
          updatedAt: new Date().toISOString()
        };
      }
      return project;
    });
    saveProjects(newProjects);
  };

  const deleteNoteFromProject = (projectId, noteId) => {
    const newProjects = projects.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          notes: project.notes.filter(note => note.id !== noteId),
          updatedAt: new Date().toISOString()
        };
      }
      return project;
    });
    saveProjects(newProjects);
  };

  // ✨ NEW: Direct task creation function
  const createTaskInProject = (projectId, taskTitle) => {
    const newTask = {
      id: Date.now().toString(),
      title: taskTitle,
      completed: false,
      createdAt: new Date().toISOString()
    };

    const newProjects = projects.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          tasks: [...(project.tasks || []), newTask],
          updatedAt: new Date().toISOString()
        };
      }
      return project;
    });
    
    saveProjects(newProjects);
    return newTask.id;
  };

  const addTaskToProject = (projectId, taskTitle) => {
    return createTaskInProject(projectId, taskTitle);
  };

  const updateTaskInProject = (projectId, taskId, updates) => {
    const newProjects = projects.map(project => {
      if (project.id === projectId) {
        const tasks = project.tasks.map(task =>
          task.id === taskId
            ? { ...task, ...updates, updatedAt: new Date().toISOString() }
            : task
        );
        return {
          ...project,
          tasks,
          updatedAt: new Date().toISOString()
        };
      }
      return project;
    });
    saveProjects(newProjects);
  };

  const toggleTaskInProject = (projectId, taskId) => {
    const newProjects = projects.map(project => {
      if (project.id === projectId) {
        const tasks = project.tasks.map(task =>
          task.id === taskId
            ? { ...task, completed: !task.completed, updatedAt: new Date().toISOString() }
            : task
        );
        return {
          ...project,
          tasks,
          updatedAt: new Date().toISOString()
        };
      }
      return project;
    });
    saveProjects(newProjects);
  };

  const deleteTaskFromProject = (projectId, taskId) => {
    const newProjects = projects.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          tasks: project.tasks.filter(task => task.id !== taskId),
          updatedAt: new Date().toISOString()
        };
      }
      return project;
    });
    saveProjects(newProjects);
  };

  const duplicateProject = (projectId) => {
    const projectToDuplicate = projects.find(p => p.id === projectId);
    if (!projectToDuplicate) return;

    const duplicatedProject = {
      ...projectToDuplicate,
      id: Date.now().toString(),
      name: `${projectToDuplicate.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Duplicate notes and tasks with new IDs
      notes: projectToDuplicate.notes.map(note => ({
        ...note,
        id: `${Date.now()}-${Math.random()}`,
        createdAt: new Date().toISOString()
      })),
      tasks: projectToDuplicate.tasks.map(task => ({
        ...task,
        id: `${Date.now()}-${Math.random()}`,
        createdAt: new Date().toISOString(),
        completed: false // Reset completion status
      }))
    };

    const newProjects = [...projects, duplicatedProject];
    saveProjects(newProjects);
    return duplicatedProject.id;
  };

  const archiveProject = (projectId) => {
    updateProject(projectId, { 
      archived: true,
      archivedAt: new Date().toISOString()
    });
  };

  const unarchiveProject = (projectId) => {
    const newProjects = projects.map(project => {
      if (project.id === projectId) {
        const { archived, archivedAt, ...rest } = project;
        return {
          ...rest,
          updatedAt: new Date().toISOString()
        };
      }
      return project;
    });
    saveProjects(newProjects);
  };

  const getProjectStats = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return null;

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

  const exportProject = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const exportData = {
      ...project,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `${project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_project.json`);
    linkElement.click();
  };

  const importProject = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const projectData = JSON.parse(e.target.result);
          
          // Validate project structure
          if (!projectData.name || !projectData.id) {
            reject(new Error('Invalid project file format'));
            return;
          }

          // Generate new ID to avoid conflicts
          const importedProject = {
            ...projectData,
            id: Date.now().toString(),
            name: `${projectData.name} (Imported)`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            importedAt: new Date().toISOString()
          };

          const newProjects = [...projects, importedProject];
          saveProjects(newProjects);
          resolve(importedProject.id);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsText(file);
    });
  };

  const searchProjects = (query) => {
    if (!query.trim()) return projects;

    const searchLower = query.toLowerCase();
    return projects.filter(project => {
      const matchesName = project.name.toLowerCase().includes(searchLower);
      const matchesDescription = project.description?.toLowerCase().includes(searchLower);
      const matchesNotes = project.notes?.some(note => 
        note.content.toLowerCase().includes(searchLower)
      );
      const matchesTasks = project.tasks?.some(task => 
        task.title.toLowerCase().includes(searchLower)
      );

      return matchesName || matchesDescription || matchesNotes || matchesTasks;
    });
  };

  const getProjectsByStatus = (status) => {
    switch (status) {
      case 'active':
        return projects.filter(p => !p.archived);
      case 'archived':
        return projects.filter(p => p.archived);
      case 'completed':
        return projects.filter(p => {
          const stats = getProjectStats(p.id);
          return stats?.isCompleted;
        });
      case 'in-progress':
        return projects.filter(p => {
          const stats = getProjectStats(p.id);
          return stats && stats.taskCount > 0 && !stats.isCompleted;
        });
      default:
        return projects;
    }
  };

  // ✨ NEW: Get all projects (for dropdowns and selection)
  const getAllProjects = () => {
    return projects.filter(p => !p.archived); // Only active projects for selection
  };

  // ✨ NEW: Get project by ID
  const getProjectById = (projectId) => {
    return projects.find(p => p.id === projectId);
  };

  return {
    projects,
    loading,
    createProject,
    updateProject,
    deleteProject,
    addBookmarkToProject,
    createBookmarkInProject, // ✨ NEW
    removeBookmarkFromProject,
    addNoteToProject,
    createNoteInProject, // ✨ NEW
    updateNoteInProject,
    deleteNoteFromProject,
    addTaskToProject,
    createTaskInProject, // ✨ NEW
    updateTaskInProject,
    toggleTaskInProject,
    deleteTaskFromProject,
    duplicateProject,
    archiveProject,
    unarchiveProject,
    getProjectStats,
    exportProject,
    importProject,
    searchProjects,
    getProjectsByStatus,
    getAllProjects, // ✨ NEW
    getProjectById // ✨ NEW
  };
};