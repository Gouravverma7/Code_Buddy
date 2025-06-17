import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, Share, Download, Plus, Flag } from 'lucide-react';
import VideoPlayer from '../components/Video/VideoPlayer';
import VideoSuggestions from '../components/Video/VideoSuggestions';
import CommentSection from '../components/Video/CommentSection';
import { MOCK_VIDEOS, MOCK_COMMENTS } from '../data/mockData';
import { VideoData } from '../types/video';
import { formatTimeAgo, formatViewCount } from '../utils/formatters';

const VideoPage: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const [video, setVideo] = useState<VideoData | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  
  useEffect(() => {
    // In a real app, this would be an API call
    const foundVideo = MOCK_VIDEOS.find(v => v.id === videoId);
    if (foundVideo) {
      setVideo(foundVideo);
      // Set page title
      document.title = `${foundVideo.title} - ViewTube`;
    }
    
    // Reset UI state when video changes
    setIsLiked(false);
    setIsDisliked(false);
    setIsDescriptionExpanded(false);
    
    // Scroll to top when video changes
    window.scrollTo(0, 0);
  }, [videoId]);
  
  if (!video) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  const relatedVideos = MOCK_VIDEOS.filter(v => v.id !== videoId)
    .sort(() => Math.random() - 0.5)
    .slice(0, 10);
  
  const handleLike = () => {
    setIsLiked(!isLiked);
    if (isDisliked) setIsDisliked(false);
  };
  
  const handleDislike = () => {
    setIsDisliked(!isDisliked);
    if (isLiked) setIsLiked(false);
  };
  
  const toggleSubscription = () => {
    setIsSubscribed(!isSubscribed);
  };

  return (
    <div className="max-w-screen-2xl mx-auto p-4 pt-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:flex-1">
          {/* Video Player */}
          <VideoPlayer 
            videoUrl={video.videoUrl || "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"} 
            poster={video.thumbnail}
          />
          
          {/* Video Info */}
          <div className="mt-4">
            <h1 className="text-xl font-bold leading-tight">{video.title}</h1>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2 py-2">
              <div className="flex items-center">
                <img 
                  src={video.channelThumbnail} 
                  alt={video.channelTitle}
                  className="w-10 h-10 rounded-full object-cover mr-3"
                />
                <div>
                  <a href={`/channel/${video.channelId}`} className="font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    {video.channelTitle}
                  </a>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {video.subscriberCount && `${formatViewCount(video.subscriberCount)} subscribers`}
                  </div>
                </div>
                <button
                  onClick={toggleSubscription}
                  className={`ml-4 px-4 py-2 rounded-full text-sm font-medium ${
                    isSubscribed
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  } transition-colors`}
                >
                  {isSubscribed ? 'Subscribed' : 'Subscribe'}
                </button>
              </div>
              
              <div className="flex items-center mt-4 sm:mt-0">
                <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mr-2">
                  <button
                    onClick={handleLike}
                    className={`flex items-center px-4 py-2 ${
                      isLiked ? 'text-blue-600 dark:text-blue-400' : ''
                    }`}
                  >
                    <ThumbsUp size={18} className="mr-2" />
                    {video.likeCount && formatViewCount(video.likeCount)}
                  </button>
                  <div className="h-10 w-px bg-gray-300 dark:bg-gray-700"></div>
                  <button
                    onClick={handleDislike}
                    className={`px-4 py-2 ${
                      isDisliked ? 'text-blue-600 dark:text-blue-400' : ''
                    }`}
                  >
                    <ThumbsDown size={18} />
                  </button>
                </div>
                
                <button className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full mr-2">
                  <Share size={18} className="mr-2" />
                  <span className="hidden sm:inline">Share</span>
                </button>
                
                <button className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full mr-2">
                  <Download size={18} className="mr-2" />
                  <span className="hidden sm:inline">Download</span>
                </button>
                
                <button className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                  <Plus size={18} />
                </button>
              </div>
            </div>
            
            {/* Video description */}
            <div
              className={`mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg ${
                isDescriptionExpanded ? '' : 'cursor-pointer'
              }`}
              onClick={() => !isDescriptionExpanded && setIsDescriptionExpanded(true)}
            >
              <div className="flex items-center text-sm mb-2">
                <span className="font-medium">{formatViewCount(video.viewCount)} views</span>
                <span className="mx-2">•</span>
                <span>{formatTimeAgo(video.publishedAt)}</span>
              </div>
              
              <div className={`text-sm whitespace-pre-line ${!isDescriptionExpanded && 'line-clamp-2'}`}>
                {video.description}
              </div>
              
              {!isDescriptionExpanded && (
                <button 
                  className="text-sm font-medium mt-1 text-gray-600 dark:text-gray-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDescriptionExpanded(true);
                  }}
                >
                  Show more
                </button>
              )}
              
              {isDescriptionExpanded && (
                <>
                  {video.tags && video.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {video.tags.map((tag, index) => (
                        <a 
                          key={index}
                          href={`/results?search_query=${encodeURIComponent(tag)}`}
                          className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
                        >
                          #{tag}
                        </a>
                      ))}
                    </div>
                  )}
                  
                  <button 
                    className="text-sm font-medium mt-2 text-gray-600 dark:text-gray-300"
                    onClick={() => setIsDescriptionExpanded(false)}
                  >
                    Show less
                  </button>
                </>
              )}
            </div>
            
            {/* Comments section */}
            <CommentSection 
              comments={MOCK_COMMENTS} 
              totalComments={MOCK_COMMENTS.length} 
            />
          </div>
        </div>
        
        {/* Recommended videos */}
        <div className="lg:w-80 xl:w-96">
          <VideoSuggestions videos={relatedVideos} />
        </div>
      </div>
    </div>
  );
};

export default VideoPage;