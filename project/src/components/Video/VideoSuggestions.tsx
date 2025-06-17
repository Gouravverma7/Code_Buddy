import React from 'react';
import VideoCard from './VideoCard';
import { VideoData } from '../../types/video';

interface VideoSuggestionsProps {
  videos: VideoData[];
}

const VideoSuggestions: React.FC<VideoSuggestionsProps> = ({ videos }) => {
  return (
    <div className="space-y-3">
      <h3 className="font-medium text-lg mb-3">Up next</h3>
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} horizontal />
      ))}
    </div>
  );
};

export default VideoSuggestions;