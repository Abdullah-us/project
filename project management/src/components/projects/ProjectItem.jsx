import TaskItem from '../TaskItem';

function ProjectItem({ project, onDeleteProject, onToggleTask, onDeleteTask }) {
  return (
    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{project.name}</h2>
          <p className="text-gray-600 mt-1">{project.description}</p>
        </div>
        <button
          onClick={() => onDeleteProject(project.id)}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
        >
          Delete
        </button>
      </div>
      
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Tasks</h3>
        <div className="space-y-3">
          {project.tasks.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No tasks yet</p>
          ) : (
            project.tasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                projectId={project.id}
                onToggleTask={onToggleTask}
                onDeleteTask={onDeleteTask}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ProjectItem;