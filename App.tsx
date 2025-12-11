import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import Transcriber from './components/Transcriber';
import { AppMode } from './types';

const App: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<AppMode>(AppMode.CHAT);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-200">
      <Sidebar 
        currentMode={currentMode} 
        onModeChange={setCurrentMode}
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      <main className="flex-1 flex flex-col relative w-full lg:ml-64 transition-all duration-300">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 border-b border-slate-800 flex items-center px-4 bg-slate-900/90 backdrop-blur-sm z-30 sticky top-0">
          <button onClick={toggleSidebar} className="text-slate-400 hover:text-white mr-4">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-white">
            {currentMode === AppMode.CHAT ? 'Gemini Chat' : 'Hinglish Transcriber'}
          </h1>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative">
          {currentMode === AppMode.CHAT ? (
            <ChatInterface />
          ) : (
            <Transcriber />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;