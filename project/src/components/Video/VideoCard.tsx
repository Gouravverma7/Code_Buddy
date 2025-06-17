import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MoreVertical } from 'lucide-react';
import { formatTimeAgo, formatDuration, formatViewCount } from '../../utils/formatters';
import { VideoData } from '../../types/video';

interface VideoCardProps {
  video: VideoData;
  horizontal?: boolean;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, horizontal = false }) => {
  const [isHovering, setIsHovering] = useState(false);

  const containerClasses = horizontal 
    ? "flex gap-4 w-full" 
    : "flex flex-col w-full";

  const thumbnailClasses = horizontal 
    ? "w-40 sm:w-60 h-24 sm:h-32 flex-shrink-0" 
    : "w-full pt-[56.25%]"; // 16:9 aspect ratio

  return (
    <div className={containerClasses}>
      <div 
        className={`relative ${thumbnailClasses} bg-gray-200 dark:bg-gray-800 rounded-xl overflow-hidden group`}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <Link to={`/video/${video.id}`}>
          <img 
            src={isHovering && video.previewThumbnail ? video.previewThumbnail : video.thumbnail} 
            alt={video.title}
            className={`${horizontal ? 'absolute inset-0 w-full h-full' : 'absolute inset-0 w-full h-full'} object-cover transition duration-300 ease-in-out transform ${isHovering ? 'scale-105' : 'scale-100'}`}
          />
          {video.duration && (
            <div className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1 py-0.5 rounded">
              {formatDuration(video.duration)}
            </div>
          )}
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
        </Link>
      </div>

      <div className={`flex ${horizontal ? 'mt-0 flex-1' : 'mt-3'}`}>
        {!horizontal && (
          <Link to={`/channel/${video.channelId}`} className="flex-shrink-0 mr-3">
            <img 
              src={video.channelThumbnail} 
              alt={video.channelTitle}
              className="w-9 h-9 rounded-full object-cover"
            />
          </Link>
        )}
        
        <div className="flex-1 min-w-0">
          <Link to={`/video/${video.id}`} className="block">
            <h3 className="font-medium text-sm sm:text-base line-clamp-2 leading-tight">
              {video.title}
            </h3>
          </Link>
          
          <Link to={`/channel/${video.channelId}`} className="mt-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
            {video.channelTitle}
          </Link>
          
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>{formatViewCount(video.viewCount)} views</span>
            <span className="mx-1">•</span>
            <span>{formatTimeAgo(video.publishedAt)}</span>
          </div>
        </div>
        
        <button className="flex-shrink-0 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <MoreVertical size={16} />
        </button>
      </div>
    </div>
  );
};

export default VideoCard;