import React, { useState, useEffect } from 'react';
import { Compass, Gamepad2, Code, Music, Coffee, BookOpen, Shirt, Zap } from 'lucide-react';
import VideoGrid from '../components/Video/VideoGrid';
import { MOCK_VIDEOS } from '../data/mockData';
import { VideoData } from '../types/video';

const categories = [
  { name: 'All', icon: <Compass /> },
  { name: 'Gaming', icon: <Gamepad2 /> },
  { name: 'Programming', icon: <Code /> },
  { name: 'Music', icon: <Music /> },
  { name: 'Coffee', icon: <Coffee /> },
  { name: 'Education', icon: <BookOpen /> },
  { name: 'Fashion', icon: <Shirt /> },
  { name: 'Trending', icon: <Zap /> },
];

const HomePage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [filteredVideos, setFilteredVideos] = useState<VideoData[]>(MOCK_VIDEOS);

  useEffect(() => {
    if (activeCategory === 'All') {
      setFilteredVideos(MOCK_VIDEOS);
    } else {
      setFilteredVideos(MOCK_VIDEOS.filter(video => 
        video.categories?.includes(activeCategory)
      ));
    }
  }, [activeCategory]);

  return (
    <div className="py-4 px-5">
      {/* Categories horizontal scroll */}
      <div className="relative mb-6">
        <div className="flex space-x-2 overflow-x-auto pb-2 hide-scrollbar">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => setActiveCategory(category.name)}
              className={`flex items-center px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === category.name
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
        
        {/* Fade effect on the right */}
        <div className="absolute top-0 right-0 bottom-0 w-16 bg-gradient-to-l from-white dark:from-gray-900 to-transparent pointer-events-none"></div>
      </div>

      <VideoGrid videos={filteredVideos} />
    </div>
  );
};

export default HomePage;