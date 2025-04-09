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

  
  useEffect(() => {
    fetchProjects();
  }, []);

  
  useEffect(() => {
    if (selectedProject) {
      fetchTasks();
    } else {
      setTasks([]);
    }
  }, [selectedProject]);

  
  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getProjects();
      setProjects(response.data);
      
      
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

  
  const handleSubmitTask = async (formData) => {
    try {
      setError(null);
      
      if (editingTask) {
        
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

  
  const handleDeleteTask = useCallback(async (id) => {
    
    if (pendingDeletes.has(id)) {
      console.log('Delete already in progress for task:', id);
      return;
    }
    
    try {
      
      setPendingDeletes(prev => new Set(prev).add(id));
      setError(null);
      
      await apiService.deleteTask(id);
      
      
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
      
      setPendingDeletes(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  }, [pendingDeletes]);

  
  const handleReorderTasks = async (oldIndex, newIndex) => {
    
    const newTasks = [...tasks];
    const [movedTask] = newTasks.splice(oldIndex, 1);
    newTasks.splice(newIndex, 0, movedTask);
    
    
    setTasks(newTasks);
    
    try {
      
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
      
      fetchTasks();
    }
  };

  
  const getSelectedProjectName = () => {
    const project = projects.find(p => p.id === selectedProject);
    return project ? project.name : '';
  };

  
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