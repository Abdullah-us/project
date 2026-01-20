// components/Modals/AddProjectModal.jsx
import { FiX } from 'react-icons/fi';

const AddProjectModal = ({ isOpen, onClose, projectData, onProjectDataChange, teamMembers, onSubmit }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 transition-opacity duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl w-full max-w-md border border-slate-200 shadow-2xl transform transition-all duration-300 scale-100 opacity-100">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-800">Create New Project</h3>
              <p className="text-sm text-slate-600 mt-1">Add a new project to your dashboard</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Project Name *</label>
              <input
                type="text"
                value={projectData.name}
                onChange={(e) => onProjectDataChange({...projectData, name: e.target.value})}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50"
                placeholder="Enter project name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Project Description</label>
              <textarea
                value={projectData.description}
                onChange={(e) => onProjectDataChange({...projectData, description: e.target.value})}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50"
                rows="3"
                placeholder="Brief project description..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Assign Team Members ({teamMembers.length} available)
              </label>
              <div className="max-h-40 overflow-y-auto border border-slate-300 rounded-lg p-2 bg-white/50">
                {teamMembers.length === 0 ? (
                  <div className="text-center py-4 text-slate-500">
                    <p>No team members available</p>
                    <p className="text-sm">Add team members first</p>
                  </div>
                ) : (
                  teamMembers.map(member => (
                    <div key={member.id} className="flex items-center gap-3 p-2 hover:bg-slate-100 rounded">
                      <input
                        type="checkbox"
                        id={`member-${member.id}`}
                        checked={projectData.assignedMembers?.includes(member.id) || false}
                        onChange={(e) => {
                          if (e.target.checked) {
                            onProjectDataChange({
                              ...projectData,
                              assignedMembers: [...(projectData.assignedMembers || []), member.id]
                            });
                          } else {
                            onProjectDataChange({
                              ...projectData,
                              assignedMembers: projectData.assignedMembers?.filter(id => id !== member.id) || []
                            });
                          }
                        }}
                        className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <label htmlFor={`member-${member.id}`} className="flex-1 cursor-pointer">
                        <div className="font-medium text-slate-800">{member.name}</div>
                        <div className="text-xs text-slate-600">{member.role}</div>
                      </label>
                    </div>
                  ))
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Select team members to assign to this project
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-200">
            <button 
              onClick={onClose}
              className="px-5 py-2.5 text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition-colors border border-slate-300"
            >
              Cancel
            </button>
            <button 
              onClick={onSubmit}
              disabled={!projectData.name.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-md shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProjectModal;