import { FiFolder, FiUsers, FiCalendar, FiCheckCircle } from 'react-icons/fi';
import { useProjects } from '../../contexts/ProjectContext';

function Projects() {
  const { projects } = useProjects();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Active Projects</h2>
        <p className="text-gray-600 text-sm">Track and manage your project progress</p>
      </div>

      <div className="space-y-4">
        {projects.map((project) => (
          <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <div className="p-2 bg-blue-50 rounded-lg mr-4">
                  <FiFolder className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{project.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                  
                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-700">Progress</span>
                      <span className="font-medium">{project.progress || 0}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${project.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Project Stats */}
                  <div className="flex items-center space-x-4 mt-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <FiUsers className="h-4 w-4 mr-1" />
                      {project.team || 0}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FiCheckCircle className="h-4 w-4 mr-1" />
                      {project.tasks || 0} tasks
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FiCalendar className="h-4 w-4 mr-1" />
                      {project.dueDate ? `Due ${project.dueDate}` : 'No due date'}
                    </div>
                  </div>
                </div>
              </div>
              <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                View
              </button>
            </div>
          </div>
        ))}

        {projects.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <FiFolder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-600 mb-4">Create your first project to get started</p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Create Project
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Projects;