// src/constants/status.js
export const STATUS_TYPES = {
  NOT_STARTED: 'not-started',
  IN_PROGRESS: 'in-progress',
  TESTING: 'testing',
  COMPLETED: 'completed',
};

export const STATUS_CONFIG = {
  [STATUS_TYPES.NOT_STARTED]: {
    label: 'Not Started',
    color: 'bg-gray-100 border-gray-300 text-gray-800',
    icon: '⏳',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    textColor: 'text-gray-700',
    columnColor: 'from-gray-100 to-gray-200',
  },
  [STATUS_TYPES.IN_PROGRESS]: {
    label: 'In Progress',
    color: 'bg-blue-100 border-blue-300 text-blue-800',
    icon: '🚀',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    columnColor: 'from-blue-100 to-blue-200',
  },
  [STATUS_TYPES.TESTING]: {
    label: 'Testing',
    color: 'bg-amber-100 border-amber-300 text-amber-800',
    icon: '🧪',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-700',
    columnColor: 'from-amber-100 to-amber-200',
  },
  [STATUS_TYPES.COMPLETED]: {
    label: 'Completed',
    color: 'bg-emerald-100 border-emerald-300 text-emerald-800',
    icon: '✅',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700',
    columnColor: 'from-emerald-100 to-emerald-200',
  },
};

export const STATUS_ORDER = [
  STATUS_TYPES.NOT_STARTED,
  STATUS_TYPES.IN_PROGRESS,
  STATUS_TYPES.TESTING,
  STATUS_TYPES.COMPLETED,
];