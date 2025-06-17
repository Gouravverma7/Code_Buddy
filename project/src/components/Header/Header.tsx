import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, Video, User, Moon, Sun, X, Mic } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import Logo from './Logo';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search/${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 z-50 flex items-center px-4 shadow-sm dark:shadow-gray-800/20 transition-colors duration-200">
      <div className="flex items-center mr-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 mr-2 transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>
        <Logo />
      </div>

      <div className="flex-1 max-w-2xl mx-auto">
        <form onSubmit={handleSearch} className="relative">
          <div className={`flex items-center border ${isFocused ? 'border-blue-500 shadow-md' : 'border-gray-300 dark:border-gray-600'} rounded-full overflow-hidden transition-all duration-150`}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Search"
              className="py-2 px-4 w-full bg-transparent focus:outline-none"
            />
            {searchQuery && isFocused && (
              <button 
                type="button" 
                onClick={() => setSearchQuery('')}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 pr-2"
              >
                <X size={18} />
              </button>
            )}
            <button 
              type="button"
              className="h-full px-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
            >
              <Search className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </form>
        <button className="hidden sm:flex absolute right-[-50px] top-[8px] p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700">
          <Mic className="h-5 w-5" />
        </button>
      </div>

      <div className="flex items-center ml-4 space-x-1 sm:space-x-2">
        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          {theme === 'dark' ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <Video className="h-6 w-6" />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <Bell className="h-6 w-6" />
        </button>
        <button className="ml-2 w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center">
          <User className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};

export default Header;