import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Filter } from 'lucide-react';
import VideoCard from '../components/Video/VideoCard';
import { MOCK_VIDEOS } from '../data/mockData';
import { VideoData } from '../types/video';

const SearchResults: React.FC = () => {
  const { query } = useParams<{ query: string }>();
  const [results, setResults] = useState<VideoData[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  useEffect(() => {
    // In a real app, this would be an API call
    if (query) {
      const decodedQuery = decodeURIComponent(query).toLowerCase();
      const filteredVideos = MOCK_VIDEOS.filter(
        video => 
          video.title.toLowerCase().includes(decodedQuery) ||
          video.channelTitle.toLowerCase().includes(decodedQuery) ||
          video.description?.toLowerCase().includes(decodedQuery) ||
          video.tags?.some(tag => tag.toLowerCase().includes(decodedQuery))
      );
      
      setResults(filteredVideos);
      document.title = `${query} - ViewTube Search`;
    }
  }, [query]);
  
  if (!query) {
    return <div>No search query provided</div>;
  }
  
  return (
    <div className="max-w-screen-xl mx-auto p-4 pt-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-medium">Results for "{decodeURIComponent(query)}"</h1>
        <button 
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-medium"
        >
          <Filter size={16} className="mr-2" />
          Filter
        </button>
      </div>
      
      {isFilterOpen && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-4 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-medium mb-2">Upload date</h3>
              <div className="space-y-1">
                <FilterOption label="Last hour" />
                <FilterOption label="Today" />
                <FilterOption label="This week" />
                <FilterOption label="This month" />
                <FilterOption label="This year" />
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Type</h3>
              <div className="space-y-1">
                <FilterOption label="Video" />
                <FilterOption label="Channel" />
                <FilterOption label="Playlist" />
                <FilterOption label="Movie" />
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Duration</h3>
              <div className="space-y-1">
                <FilterOption label="Under 4 minutes" />
                <FilterOption label="4-20 minutes" />
                <FilterOption label="Over 20 minutes" />
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-lg font-medium mb-2">No results found</p>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
              Try different keywords or check for spelling errors
            </p>
          </div>
        ) : (
          results.map(video => (
            <div key={video.id} className="w-full">
              <VideoCard video={video} horizontal />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

interface FilterOptionProps {
  label: string;
}

const FilterOption: React.FC<FilterOptionProps> = ({ label }) => {
  return (
    <div className="flex items-center">
      <input 
        type="checkbox" 
        id={label.replace(/\s+/g, '-').toLowerCase()} 
        className="mr-2"
      />
      <label htmlFor={label.replace(/\s+/g, '-').toLowerCase()} className="text-sm">
        {label}
      </label>
    </div>
  );
};

export default SearchResults;