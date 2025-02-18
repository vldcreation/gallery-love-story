import { Link } from 'react-router-dom';
import { Camera } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function Navbar() {
  const { user } = useAuth();

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Camera className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Gallery</span>
            </Link>
          </div>
          
          <div className="flex items-center">
            {user ? (
              <Link
                to="/admin"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                to="/admin/login"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Admin Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}