import React from 'react';
import { MessageSquare, Mic, Menu, X, Sparkles } from 'lucide-react';
import { AppMode } from '../types';

interface SidebarProps {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentMode, onModeChange, isOpen, toggleSidebar }) => {
  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={toggleSidebar}
      />

      {/* Sidebar Content */}
      <aside 
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-xl">
            <Sparkles className="w-6 h-6" />
            <span>Gemini Omni</span>
          </div>
          <button onClick={toggleSidebar} className="lg:hidden text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          <button
            onClick={() => {
              onModeChange(AppMode.CHAT);
              if (window.innerWidth < 1024) toggleSidebar();
            }}
            className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${
              currentMode === AppMode.CHAT 
                ? 'bg-blue-600/20 text-blue-400 border border-blue-600/50' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="font-medium">Chat Assistant</span>
          </button>

          <button
            onClick={() => {
              onModeChange(AppMode.TRANSCRIBE);
              if (window.innerWidth < 1024) toggleSidebar();
            }}
            className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${
              currentMode === AppMode.TRANSCRIBE 
                ? 'bg-purple-600/20 text-purple-400 border border-purple-600/50' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
            }`}
          >
            <Mic className="w-5 h-5" />
            <span className="font-medium">Hinglish Transcriber</span>
          </button>
        </nav>

        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-slate-800">
          <div className="text-xs text-slate-500 text-center">
            Powered by Gemini 3 Pro & Flash
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;