
import React from 'react';
import { AppSection } from '../types';
import { Home, User, Briefcase, Heart, MessageCircle, LogOut, Code } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeSection: AppSection;
  onSectionChange: (section: AppSection) => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeSection, onSectionChange, onLogout }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'projects', icon: Briefcase, label: 'Projects' },
    { id: 'likes', icon: Heart, label: 'Likes' },
    { id: 'chats', icon: MessageCircle, label: 'Chats' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col p-6 space-y-8 shadow-sm">
        <div className="flex items-center space-x-3 text-blue-600">
          <Code size={32} />
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">DevDate</h1>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id as AppSection)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon size={20} />
                <span className="font-bold">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <button 
          onClick={onLogout}
          className="flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all font-medium"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-slate-50/50 relative">
        {children}
      </main>
    </div>
  );
};

export default Layout;
