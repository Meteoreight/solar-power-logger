
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChartBarIcon, TableCellsIcon } from '@heroicons/react/24/outline'; // Using Heroicons

const Navbar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard & Input', icon: ChartBarIcon },
    { path: '/table', label: 'Data Table & CSV', icon: TableCellsIcon },
  ];

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className="font-bold text-xl">Solar Logger</span>
          </div>
          <div className="flex space-x-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out
                    ${isActive ? 'bg-blue-700 text-white' : 'text-blue-100 hover:bg-blue-500 hover:text-white'}`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
