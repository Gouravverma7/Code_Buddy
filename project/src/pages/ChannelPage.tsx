import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';
import VideoGrid from '../components/Video/VideoGrid';
import { MOCK_VIDEOS } from '../data/mockData';
import { VideoData } from '../types/video';
import { formatViewCount } from '../utils/formatters';

const tabs = ['Home', 'Videos', 'Playlists', 'Channels', 'About'];

const ChannelPage: React.FC = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const [activeTab, setActiveTab] = useState('Home');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [channelVideos, setChannelVideos] = useState<VideoData[]>([]);
  
  useEffect(() => {
    // Filter videos by channel ID
    // In a real app, this would be an API call
    const videos = MOCK_VIDEOS.filter(video => video.channelId === channelId);
    setChannelVideos(videos);
    
    // Set the page title
    if (videos.length > 0) {
      document.title = `${videos[0].channelTitle} - ViewTube`;
    }
  }, [channelId]);
  
  // Early return if no videos (or channel not found)
  if (channelVideos.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  const channelInfo = {
    name: channelVideos[0].channelTitle,
    thumbnail: channelVideos[0].channelThumbnail,
    subscribers: channelVideos[0].subscriberCount || 100000,
    videoCount: channelVideos.length,
    description: "This is a channel description that would typically be fetched from the API. It describes the content creator and what kind of content they create.",
    bannerImage: "https://images.pexels.com/photos/1252890/pexels-photo-1252890.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
  };
  
  const toggleSubscription = () => {
    setIsSubscribed(!isSubscribed);
  };

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      {/* Channel banner */}
      <div className="w-full h-44 sm:h-56 md:h-64 bg-gray-200 dark:bg-gray-800 overflow-hidden">
        <img 
          src={channelInfo.bannerImage} 
          alt="Channel banner"
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Channel info */}
      <div className="max-w-screen-2xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center">
          <img 
            src={channelInfo.thumbnail} 
            alt={channelInfo.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover mr-4"
          />
          
          <div className="mt-4 sm:mt-0">
            <h1 className="text-2xl font-bold">{channelInfo.name}</h1>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              <span>{formatViewCount(channelInfo.subscribers)} subscribers</span>
              <span className="mx-1">•</span>
              <span>{channelInfo.videoCount} videos</span>
            </div>
          </div>
          
          <div className="flex items-center mt-4 sm:mt-0 sm:ml-auto">
            <button 
              onClick={toggleSubscription}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isSubscribed
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {isSubscribed ? 'Subscribed' : 'Subscribe'}
            </button>
            
            {isSubscribed && (
              <button className="ml-2 p-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                <Bell size={18} />
              </button>
            )}
          </div>
        </div>
        
        {/* Tabs */}
        <div className="mt-8 border-b border-gray-200 dark:border-gray-800">
          <div className="flex overflow-x-auto hide-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-b-2 border-gray-900 dark:border-white text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                } transition-colors`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        
        {/* Tab content */}
        <div className="mt-6">
          {activeTab === 'Home' && (
            <div>
              <VideoGrid 
                videos={channelVideos.slice(0, 8)} 
                title="Uploads" 
              />
            </div>
          )}
          
          {activeTab === 'Videos' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Videos</h2>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search channel"
                    className="py-2 pl-10 pr-4 bg-gray-100 dark:bg-gray-800 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-5 w-5" />
                </div>
              </div>
              <VideoGrid videos={channelVideos} />
            </div>
          )}
          
          {activeTab === 'About' && (
            <div className="max-w-3xl">
              <h2 className="text-xl font-bold mb-4">About</h2>
              <p className="whitespace-pre-line">{channelInfo.description}</p>
              
              <div className="mt-8">
                <h3 className="font-bold mb-2">Stats</h3>
                <div className="text-sm">
                  <p className="mb-1">Joined ViewTube: January 1, 2020</p>
                  <p className="mb-1">{formatViewCount(10000000)} views</p>
                </div>
              </div>
            </div>
          )}
          
          {(activeTab === 'Playlists' || activeTab === 'Channels') && (
            <div className="flex items-center justify-center py-16">
              <p className="text-gray-500 dark:text-gray-400">No {activeTab.toLowerCase()} available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChannelPage;