import React, { useState } from 'react';
import { UserRound, ThumbsUp, ThumbsDown, MoreVertical } from 'lucide-react';
import { formatTimeAgo } from '../../utils/formatters';
import { CommentData } from '../../types/video';

interface CommentSectionProps {
  comments: CommentData[];
  totalComments: number;
}

const CommentSection: React.FC<CommentSectionProps> = ({ comments, totalComments }) => {
  const [commentText, setCommentText] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="mt-6">
      <h3 className="font-bold text-lg mb-4">{totalComments.toLocaleString()} Comments</h3>
      
      {/* Add comment form */}
      <div className="flex mb-8">
        <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0 mr-3">
          <UserRound className="text-white" size={20} />
        </div>
        <div className="flex-1">
          <div className={`border-b ${isFocused ? 'border-blue-500' : 'border-gray-300 dark:border-gray-700'} transition-colors pb-1`}>
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Add a comment..."
              className="w-full bg-transparent focus:outline-none py-1"
            />
          </div>
          
          {isFocused && (
            <div className="flex justify-end mt-2 space-x-2">
              <button 
                className="px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
                onClick={() => {
                  setIsFocused(false);
                  setCommentText('');
                }}
              >
                Cancel
              </button>
              <button 
                disabled={!commentText.trim()}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  commentText.trim() 
                    ? 'bg-blue-500 text-white hover:bg-blue-600' 
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                } transition-colors`}
              >
                Comment
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Comments list */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <Comment key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
};

interface CommentProps {
  comment: CommentData;
}

const Comment: React.FC<CommentProps> = ({ comment }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [likesCount, setLikesCount] = useState(comment.likeCount);

  const handleLike = () => {
    if (isLiked) {
      setLikesCount(likesCount - 1);
      setIsLiked(false);
    } else {
      setLikesCount(likesCount + 1);
      setIsLiked(true);
      if (isDisliked) {
        setIsDisliked(false);
      }
    }
  };

  const handleDislike = () => {
    if (isDisliked) {
      setIsDisliked(false);
    } else {
      setIsDisliked(true);
      if (isLiked) {
        setIsLiked(false);
        setLikesCount(likesCount - 1);
      }
    }
  };

  return (
    <div className="flex">
      <img 
        src={comment.authorProfileImageUrl} 
        alt={comment.authorDisplayName}
        className="w-10 h-10 rounded-full object-cover flex-shrink-0 mr-3"
      />
      <div className="flex-1">
        <div className="flex items-center">
          <a href="#" className="font-medium text-sm hover:underline">{comment.authorDisplayName}</a>
          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{formatTimeAgo(comment.publishedAt)}</span>
        </div>
        <p className="mt-1 text-sm whitespace-pre-line">{comment.textDisplay}</p>
        <div className="flex items-center mt-2 text-sm">
          <button 
            className={`flex items-center mr-3 ${isLiked ? 'text-blue-500' : 'text-gray-600 dark:text-gray-400'}`}
            onClick={handleLike}
          >
            <ThumbsUp size={16} className="mr-1" />
            {likesCount > 0 && <span>{likesCount}</span>}
          </button>
          <button 
            className={`flex items-center mr-3 ${isDisliked ? 'text-blue-500' : 'text-gray-600 dark:text-gray-400'}`}
            onClick={handleDislike}
          >
            <ThumbsDown size={16} />
          </button>
          <button className="text-gray-600 dark:text-gray-400 font-medium">Reply</button>
        </div>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            <button className="text-blue-500 text-sm font-medium flex items-center">
              View {comment.replies.length} replies
            </button>
          </div>
        )}
      </div>
      <button className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0">
        <MoreVertical size={16} />
      </button>
    </div>
  );
};

export default CommentSection;