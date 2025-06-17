import React from 'react';
import VideoCard from './VideoCard';
import { VideoData } from '../../types/video';

interface VideoGridProps {
  videos: VideoData[];
  title?: string;
  columns?: number;
}

const VideoGrid: React.FC<VideoGridProps> = ({ videos, title, columns = 4 }) => {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }[columns] || 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

  return (
    <div>
      {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}
      <div className={`grid ${gridClasses} gap-4`}>
        {videos.map((video) => (
          <div key={video.id} className="w-full">
            <VideoCard video={video} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoGrid;