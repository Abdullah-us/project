import ProjectItem from './ProjectItem';

function ProjectList({ projects, selectedProject, onDeleteProject, onToggleTask, onDeleteTask }) {
  const selectedProjectData = projects.find(p => p.id === selectedProject);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Current Project</h2>
        {selectedProjectData ? (
          <ProjectItem 
            project={selectedProjectData} 
            onDeleteProject={onDeleteProject}
            onToggleTask={onToggleTask}
            onDeleteTask={onDeleteTask}
          />
        ) : (
          <p className="text-gray-500 text-center py-8">No project selected</p>
        )}
      </div>
    </div>
  );
}

export default ProjectList;