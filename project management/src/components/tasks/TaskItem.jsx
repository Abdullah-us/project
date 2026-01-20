function TaskItem({ task, projectId, onToggleTask, onDeleteTask }) {
  return (
    <div className={`flex items-center p-4 rounded-lg border transition-all duration-200 hover:shadow-sm ${
      task.completed 
        ? 'bg-green-50 border-green-200' 
        : 'bg-white border-gray-200 hover:border-gray-300'
    }`}>
      <div className="flex items-center flex-1 min-w-0">
        <div className="relative">
          <input 
            type="checkbox" 
            checked={task.completed}
            onChange={() => onToggleTask(projectId, task.id)}
            className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
          {task.completed && (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>
        
        <span className={`ml-4 text-gray-800 truncate ${task.completed ? 'line-through text-gray-500' : ''}`}>
          {task.text}
        </span>
      </div>
      
      <button 
        className="ml-3 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors duration-200"
        onClick={() => onDeleteTask(projectId, task.id)}
        title="Delete task"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}

export default TaskItem;