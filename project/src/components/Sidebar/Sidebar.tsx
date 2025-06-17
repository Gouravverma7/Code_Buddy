import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, Compass, Clock, ThumbsUp, PlaySquare, 
  Film, Zap, Music, Gamepad2, Trophy, Flame, 
  ShoppingBag, Radio, Newspaper, Plus
} from 'lucide-react';
import SubscriptionItem from './SubscriptionItem';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  return (
    <aside 
      className={`fixed left-0 top-16 bottom-0 bg-white dark:bg-gray-900 z-40 transition-all duration-300 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 ${
        isOpen ? 'w-64' : 'w-20'
      } border-r border-gray-200 dark:border-gray-800`}
    >
      <nav className="py-4">
        <div className="px-4 mb-2">
          <SidebarSection>
            <SidebarItem icon={<Home />} text="Home" to="/" />
            <SidebarItem icon={<Compass />} text="Explore" to="/explore" />
            <SidebarItem icon={<Zap />} text="Shorts" to="/shorts" />
            <SidebarItem icon={<PlaySquare />} text="Subscriptions" to="/subscriptions" />
          </SidebarSection>

          <SidebarSection title={isOpen ? "Library" : ""}>
            <SidebarItem icon={<Clock />} text="History" to="/history" />
            <SidebarItem icon={<PlaySquare />} text="Your videos" to="/your-videos" />
            <SidebarItem icon={<ThumbsUp />} text="Liked videos" to="/liked-videos" />
          </SidebarSection>

          {isOpen && (
            <>
              <SidebarSection title="Subscriptions">
                <SubscriptionItem name="TechChannel" image="https://images.pexels.com/photos/2102416/pexels-photo-2102416.jpeg?auto=compress&cs=tinysrgb&w=30&h=30&dpr=1" />
                <SubscriptionItem name="MusicVids" image="https://images.pexels.com/photos/3756766/pexels-photo-3756766.jpeg?auto=compress&cs=tinysrgb&w=30&h=30&dpr=1" />
                <SubscriptionItem name="GamingPro" image="https://images.pexels.com/photos/3370379/pexels-photo-3370379.jpeg?auto=compress&cs=tinysrgb&w=30&h=30&dpr=1" />
                <SubscriptionItem name="Cooking" image="https://images.pexels.com/photos/1599019/pexels-photo-1599019.jpeg?auto=compress&cs=tinysrgb&w=30&h=30&dpr=1" />
                <SubscriptionItem name="TravelVlogs" image="https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=30&h=30&dpr=1" />
              </SidebarSection>

              <SidebarSection title="Explore">
                <SidebarItem icon={<Flame />} text="Trending" to="/trending" />
                <SidebarItem icon={<Music />} text="Music" to="/music" />
                <SidebarItem icon={<Film />} text="Movies & TV" to="/movies" />
                <SidebarItem icon={<Radio />} text="Live" to="/live" />
                <SidebarItem icon={<Gamepad2 />} text="Gaming" to="/gaming" />
                <SidebarItem icon={<Newspaper />} text="News" to="/news" />
                <SidebarItem icon={<Trophy />} text="Sports" to="/sports" />
                <SidebarItem icon={<ShoppingBag />} text="Shopping" to="/shopping" />
              </SidebarSection>
            </>
          )}
        </div>
      </nav>
    </aside>
  );
};

interface SectionProps {
  children: React.ReactNode;
  title?: string;
}

const SidebarSection: React.FC<SectionProps> = ({ children, title }) => {
  return (
    <div className="mb-4">
      {title && <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 px-4 pb-1 pt-4">{title}</h3>}
      <div className="space-y-1">{children}</div>
    </div>
  );
};

interface ItemProps {
  icon: React.ReactNode;
  text: string;
  to: string;
}

const SidebarItem: React.FC<ItemProps> = ({ icon, text, to }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center py-2 px-3 rounded-lg transition-colors ${
          isActive
            ? 'bg-gray-100 dark:bg-gray-800 font-medium'
            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
        }`
      }
    >
      <span className="w-6 h-6">{icon}</span>
      <span className="ml-5 whitespace-nowrap md:inline">{text}</span>
    </NavLink>
  );
};

export default Sidebar;