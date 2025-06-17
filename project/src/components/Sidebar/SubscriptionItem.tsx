import React from 'react';
import { Link } from 'react-router-dom';

interface SubscriptionItemProps {
  name: string;
  image: string;
}

const SubscriptionItem: React.FC<SubscriptionItemProps> = ({ name, image }) => {
  return (
    <Link
      to={`/channel/${name.toLowerCase()}`}
      className="flex items-center py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
    >
      <img
        src={image}
        alt={name}
        className="w-6 h-6 rounded-full object-cover"
      />
      <span className="ml-5 whitespace-nowrap">{name}</span>
    </Link>
  );
};

export default SubscriptionItem;