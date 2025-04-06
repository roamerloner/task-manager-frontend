import React, { useState, useEffect, useCallback } from 'react';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import apiService from './services/api';
import Swal from 'sweetalert2';
import './App.css';

function App() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingDeletes, setPendingDeletes] = useState(new Set());

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  // Fetch tasks when selected project changes
  useEffect(() => {
    if (selectedProject) {
      fetchTasks();
    } else {
      setTasks([]);
    }
  }, [selectedProject]);

  // Fetch all projects
  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getProjects();
      setProjects(response.data);
      
      // Select the first project by default if available
      if (response.data.length > 0 && !selectedProject) {
        setSelectedProject(response.data[0].id);
      }
    } catch (err) {
      setError('Failed to load projects. Please try again.');
      Swal.fire({
        title: 'Error!',
        text: 'Failed to load projects. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
        background: '#333',
        color: '#fff'
      });
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch tasks for the selected project
  const fetchTasks = async () => {
    if (!selectedProject) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getTasks(selectedProject);
      setTasks(response.data);
    } catch (err) {
      setError('Failed to load tasks. Please try again.');
      Swal.fire({
        title: 'Error!',
        text: 'Failed to load tasks. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
        background: '#333',
        color: '#fff'
      });
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission (create or update task)
  const handleSubmitTask = async (formData) => {
    try {
      setError(null);
      
      if (editingTask) {
        // Update existing task
        const response = await apiService.updateTask(editingTask.id, formData);
        setTasks(prevTasks => 
          prevTasks.map(task => task.id === editingTask.id ? response.data : task)
        );
        Swal.fire({
          title: 'Success!',
          text: 'Task updated successfully',
          icon: 'success',
          confirmButtonText: 'OK',
          background: '#333',
          color: '#fff'
        });
      } else {
        // Create new task
        const response = await apiService.createTask(formData);
        setTasks(prevTasks => [...prevTasks, response.data]);
        Swal.fire({
          title: 'Success!',
          text: 'Task created successfully',
          icon: 'success',
          confirmButtonText: 'OK',
          background: '#333',
          color: '#fff'
        });
      }
      
      // Clear form and editing state
      setEditingTask(null);
    } catch (err) {
      setError('Failed to save task. Please try again.');
      Swal.fire({
        title: 'Error!',
        text: 'Failed to save task. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
        background: '#333',
        color: '#fff'
      });
      console.error('Error saving task:', err);
    }
  };

  // Handle task deletion with protection against duplicate calls
  const handleDeleteTask = useCallback(async (id) => {
    // Prevent duplicate delete requests (important for StrictMode)
    if (pendingDeletes.has(id)) {
      console.log('Delete already in progress for task:', id);
      return;
    }
    
    try {
      // Mark this task as being deleted
      setPendingDeletes(prev => new Set(prev).add(id));
      setError(null);
      
      await apiService.deleteTask(id);
      
      // Remove the deleted task from state
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
      
      Swal.fire({
        title: 'Deleted!',
        text: 'Task has been deleted.',
        icon: 'success',
        confirmButtonText: 'OK',
        background: '#333',
        color: '#fff'
      });
    } catch (err) {
      setError('Failed to delete task. Please try again.');
      Swal.fire({
        title: 'Error!',
        text: 'Failed to delete task. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
        background: '#333',
        color: '#fff'
      });
      console.error('Error deleting task:', err);
    } finally {
      // Remove this task from the pending deletes set
      setPendingDeletes(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  }, [pendingDeletes]);

  // Handle task reordering
  const handleReorderTasks = async (oldIndex, newIndex) => {
    // Create a new array with the updated order
    const newTasks = [...tasks];
    const [movedTask] = newTasks.splice(oldIndex, 1);
    newTasks.splice(newIndex, 0, movedTask);
    
    // Update the UI immediately
    setTasks(newTasks);
    
    try {
      // Send the reorder request to the backend
      await apiService.reorderTasks({
        tasks: newTasks.map(task => task.id),
        project_id: selectedProject
      });
    } catch (err) {
      setError('Failed to reorder tasks. Please try again.');
      Swal.fire({
        title: 'Error!',
        text: 'Failed to reorder tasks. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
        background: '#333',
        color: '#fff'
      });
      console.error('Error reordering tasks:', err);
      // Revert to the original order if there's an error
      fetchTasks();
    }
  };

  // Get the selected project name
  const getSelectedProjectName = () => {
    const project = projects.find(p => p.id === selectedProject);
    return project ? project.name : '';
  };

  // Show loading indicator
  if (loading && projects.length === 0) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="app-container">
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}
      
      <div className="main-content">
        <TaskList 
          tasks={tasks}
          projectName={getSelectedProjectName()}
          onEdit={setEditingTask}
          onDelete={handleDeleteTask}
          onReorder={handleReorderTasks}
        />
        
        <TaskForm 
          projects={projects}
          selectedProject={selectedProject}
          onProjectChange={setSelectedProject}
          editingTask={editingTask}
          onSubmit={handleSubmitTask}
          onClear={() => setEditingTask(null)}
        />
      </div>
    </div>
  );
}

export default App;