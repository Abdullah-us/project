// src/components/tasks/TeamMemberTasks.jsx
import { useTeam } from '../../contexts/TeamContext';
import { STATUS_CONFIG } from '../../constants/status';
import { FiUser } from 'react-icons/fi';

function TeamMemberTasks({ 
  projectId, 
  tasks = [], 
  onEditTask, 
  onDeleteTask,
  onMoveTask 
}) {
  const { teamMembers } = useTeam();
  
  // Get team members assigned to this project
  const projectTeamMembers = teamMembers.filter(member => 
    member.assignedProjects?.includes(projectId)
  );
  
  // Group tasks by assignee
  const tasksByAssignee = {};
  projectTeamMembers.forEach(member => {
    tasksByAssignee[member.id] = tasks.filter(task => task.assigneeId === member.id);
  });
  
  // Get unassigned tasks
  const unassignedTasks = tasks.filter(task => !task.assigneeId);
  
  if (projectTeamMembers.length === 0 && unassignedTasks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No team members assigned to this project.</p>
        <p className="text-sm text-gray-500 mt-1">
          Add team members to the project on the Dashboard first.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Unassigned Tasks Section */}
      {unassignedTasks.length > 0 && (
        <div className="border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center">
              <FiUser className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Unassigned Tasks</h3>
              <p className="text-sm text-gray-600">Tasks not assigned to any team member</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {['not-started', 'in-progress', 'testing', 'completed'].map(status => {
              const statusTasks = unassignedTasks.filter(task => task.status === status);
              if (statusTasks.length === 0) return null;
              
              const config = STATUS_CONFIG[status] || STATUS_CONFIG['not-started'];
              
              return (
                <div key={status} className={`${config.bgColor} ${config.borderColor} border rounded-lg p-3`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{config.icon}</span>
                      <span className="text-sm font-medium text-gray-700 capitalize">{config.label}</span>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                      {statusTasks.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {statusTasks.slice(0, 3).map(task => (
                      <div key={task.id} className="bg-white rounded p-2 text-sm shadow-sm">
                        <div className="font-medium truncate">{task.title}</div>
                        {task.priority && (
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            task.priority === 'high' ? 'bg-red-100 text-red-800' :
                            task.priority === 'medium' ? 'bg-amber-100 text-amber-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {task.priority}
                          </span>
                        )}
                      </div>
                    ))}
                    {statusTasks.length > 3 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{statusTasks.length - 3} more tasks
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Team Members Sections */}
      {projectTeamMembers.map(member => {
        const memberTasks = tasksByAssignee[member.id] || [];
        
        return (
          <div key={member.id} className="border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <span className="text-white font-medium">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{member.name}</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-600">{member.role}</p>
                    {member.projectRole && member.projectRole !== member.role && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-blue-600">Project: {member.projectRole}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">{memberTasks.length}</div>
                <div className="text-sm text-gray-600">tasks assigned</div>
              </div>
            </div>
            
            {memberTasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {['not-started', 'in-progress', 'testing', 'completed'].map(status => {
                  const statusTasks = memberTasks.filter(task => task.status === status);
                  if (statusTasks.length === 0) return null;
                  
                  const config = STATUS_CONFIG[status] || STATUS_CONFIG['not-started'];
                  
                  return (
                    <div key={status} className={`${config.bgColor} ${config.borderColor} border rounded-lg p-3`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{config.icon}</span>
                          <span className="text-sm font-medium text-gray-700 capitalize">{config.label}</span>
                        </div>
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                          {statusTasks.length}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {statusTasks.slice(0, 3).map(task => (
                          <div 
                            key={task.id} 
                            className="bg-white rounded p-2 text-sm shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => onEditTask?.(task.id)}
                          >
                            <div className="font-medium truncate">{task.title}</div>
                            <div className="flex items-center justify-between mt-1">
                              {task.priority && (
                                <span className={`text-xs px-1.5 py-0.5 rounded ${
                                  task.priority === 'high' ? 'bg-red-100 text-red-800' :
                                  task.priority === 'medium' ? 'bg-amber-100 text-amber-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {task.priority}
                                </span>
                              )}
                              {task.dueDate && (
                                <span className="text-xs text-gray-500">{task.dueDate}</span>
                              )}
                            </div>
                          </div>
                        ))}
                        {statusTasks.length > 3 && (
                          <div className="text-xs text-gray-500 text-center">
                            +{statusTasks.length - 3} more tasks
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No tasks assigned to {member.name}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default TeamMemberTasks;