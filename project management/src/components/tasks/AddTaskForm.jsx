import { useState } from 'react';

function AddTaskForm({ onAddTask, selectedProject, projects }) {
  const [taskText, setTaskText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (taskText.trim()) {
      onAddTask(taskText);
      setTaskText('');
    }
  };

  const selectedProjectName = projects.find(p => p.id === selectedProject)?.name || '';

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 h-fit">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Add New Task</h2>
        <p className="text-gray-600">
          Adding to: <span className="font-semibold text-indigo-600">{selectedProjectName}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Task Description
          </label>
          <input
            type="text"
            value={taskText}
            onChange={(e) => setTaskText(e.target.value)}
            placeholder="Enter task description..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
          />
        </div>

        <button 
          type="submit" 
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          Add Task
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-100">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Tips</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            Be specific and clear in your task description
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            Break large tasks into smaller ones
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            Set priorities for important tasks
          </li>
        </ul>
      </div>
    </div>
  );
}

export default AddTaskForm;