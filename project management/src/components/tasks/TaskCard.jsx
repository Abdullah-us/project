// src/components/TaskCard.jsx
import { useState } from 'react';
import { FiEdit2, FiTrash2, FiClock, FiUser } from 'react-icons/fi';
import { STATUS_CONFIG } from '../../constants/status';
import { useTeam } from '../../contexts/TeamContext';

function TaskCard({ task, onEdit, onDelete, onStatusChange, projectId }) {
  const [isHovered, setIsHovered] = useState(false);
  const statusConfig = STATUS_CONFIG[task.status] || STATUS_CONFIG['not-started'];
  const { getMember } = useTeam();
  
  // Get team member info from context using assigneeId
  const assignee = task.assigneeId ? getMember(task.assigneeId) : null;

  const handleDragStart = (e) => {
    e.dataTransfer.setData('taskId', task.id.toString());
    e.dataTransfer.setData('projectId', projectId);
    e.dataTransfer.setData('currentStatus', task.status);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`${statusConfig.bgColor} ${statusConfig.borderColor} border rounded-xl p-4 mb-3 cursor-move transition-all duration-200 hover:shadow-md hover:scale-[1.02] group`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{statusConfig.icon}</span>
            <h4 className="font-medium text-gray-900">{task.title}</h4>
          </div>
          
          {task.description && (
            <p className="text-sm text-gray-600 mb-3">{task.description}</p>
          )}

          {/* Task Meta Info */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {assignee && (
              <div className="flex items-center gap-1 text-gray-600" title={`Assigned to: ${assignee.name} (${assignee.role})`}>
                <FiUser className="h-3 w-3" />
                <span>{assignee.name}</span>
              </div>
            )}
            
            {task.dueDate && (
              <div className="flex items-center gap-1 text-gray-600">
                <FiClock className="h-3 w-3" />
                <span>{task.dueDate}</span>
              </div>
            )}
            
            {task.priority && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                task.priority === 'high' ? 'bg-red-100 text-red-800' :
                task.priority === 'medium' ? 'bg-amber-100 text-amber-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {task.priority}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`flex items-center gap-1 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <button
            onClick={() => onEdit(task.id)}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
            title="Edit task"
          >
            <FiEdit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
            title="Delete task"
          >
            <FiTrash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar (for In Progress tasks) */}
      {task.status === 'in-progress' && task.progress !== undefined && (
        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium">{task.progress}%</span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${task.progress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskCard;