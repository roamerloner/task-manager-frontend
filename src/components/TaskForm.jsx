import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

function TaskForm({ projects, selectedProject, onProjectChange, editingTask, onSubmit, onClear }) {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  // Update form when editingTask changes
  useEffect(() => {
    if (editingTask) {
      setFormData({
        name: editingTask.name || '',
        description: editingTask.description || ''
      });
    } else {
      setFormData({
        name: '',
        description: ''
      });
    }
  }, [editingTask]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedProject) {
      Swal.fire({
        title: 'Warning!',
        text: 'Please select a project',
        icon: 'warning',
        confirmButtonText: 'OK',
        background: '#333',
        color: '#fff'
      });
      return;
    }
    
    if (!formData.name.trim()) {
      Swal.fire({
        title: 'Warning!',
        text: 'Task title is required',
        icon: 'warning',
        confirmButtonText: 'OK',
        background: '#333',
        color: '#fff'
      });
      return;
    }
    
    onSubmit({
      ...formData,
      project_id: selectedProject
    });
  };

  const handleClear = () => {
    setFormData({
      name: '',
      description: ''
    });
    onClear();
  };

  return (
    <div className="task-form">
      <div className="form-header">
        <select 
          value={selectedProject || ''}
          onChange={(e) => onProjectChange(e.target.value ? Number(e.target.value) : null)}
          className="project-select"
        >
          <option value="">Select Project</option>
          {projects.map(project => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>
      
      <h2 className="form-title">{editingTask ? 'Edit Task' : 'Add Task'}</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="form-control"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="form-control"
            rows="4"
          ></textarea>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="clear-btn"
            onClick={handleClear}
          >
            Clear
          </button>
          <button 
            type="submit" 
            className="add-btn"
          >
            {editingTask ? 'Update' : 'Add'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TaskForm;