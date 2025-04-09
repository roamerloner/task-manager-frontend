import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Swal from 'sweetalert2';

function TaskItem({ task, projectName, onEdit, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: '#555', // Darker background for task items
    color: 'white',
    padding: '10px 15px',
    margin: '5px 0',
    borderRadius: '4px',
    cursor: 'grab'
  };

  const formatCreationTime = (createdAt) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffInSeconds = Math.floor((now - created) / 1000);
    
    if (diffInSeconds < 60) {
      return `Created ${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`;
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `Created ${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `Created ${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    }
    
    return `Created on ${created.toLocaleDateString()}`;
  };

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(task);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete "${task.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      background: '#333',
      color: '#fff'
    }).then((result) => {
      if (result.isConfirmed) {
        onDelete(task.id);
      }
    });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="task-item"
    >
      
      <div {...attributes} {...listeners} className="task-draggable-area">
        <div className="task-info">
          <div className="task-project">{projectName}</div>
          <div className="task-created">{formatCreationTime(task.created_at)}</div>
        </div>
        <div className="task-content">
          <div className="task-title">{task.name}</div>
        </div>
      </div>
      
      
      <div className="task-actions">
        <button 
          className="edit-btn"
          onClick={handleEdit}
        >
          Edit
        </button>
        <button 
          className="delete-btn"
          onClick={handleDelete}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default TaskItem;