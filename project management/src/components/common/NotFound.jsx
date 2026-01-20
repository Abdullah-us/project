import { Link } from 'react-router-dom';
import { FiHome, FiSearch } from 'react-icons/fi';

function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="h-48 w-48 mx-auto relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute inset-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
              <span className="text-6xl font-bold text-white">404</span>
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-4xl font-bold text-white mb-4">Page Not Found</h1>
        <p className="text-gray-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Actions */}
        <div className="space-y-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <FiHome className="h-5 w-5" />
            Back to Dashboard
          </Link>
          
          <Link
            to="/login"
            className="inline-flex items-center gap-2 border border-gray-700 text-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-all duration-200"
          >
            <FiSearch className="h-5 w-5" />
            Go to Login
          </Link>
        </div>

        {/* Support */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <p className="text-sm text-gray-500">
            Need help?{' '}
            <button className="text-blue-400 hover:text-blue-300">
              Contact Support
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default NotFound;