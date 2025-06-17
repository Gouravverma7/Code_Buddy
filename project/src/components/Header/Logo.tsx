import React from 'react';
import { Link } from 'react-router-dom';
import { PlaySquare } from 'lucide-react';

const Logo: React.FC = () => {
  return (
    <Link to="/" className="flex items-center">
      <PlaySquare className="h-8 w-8 text-red-600 mr-1" />
      <span className="text-xl font-semibold hidden sm:inline-block">
        ViewTube
      </span>
    </Link>
  );
};

export default Logo;