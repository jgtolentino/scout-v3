import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Minimize2, Maximize2, Bot } from 'lucide-react';
import { clsx } from 'clsx';
import { EnhancedRetailBot } from './EnhancedRetailBot';

interface PersistentChatWidgetProps {
  className?: string;
}

const PersistentChatWidget: React.FC<PersistentChatWidgetProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Hide widget on scroll to avoid interference with content
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollingDown = currentScrollY > lastScrollY;
      
      // Hide when scrolling down, show when scrolling up or stopped
      if (scrollingDown && currentScrollY > 200) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      lastScrollY = currentScrollY;
      
      // Show after scroll stops
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  const toggleChat = () => {
    if (!isOpen) {
      setIsOpen(true);
      setIsMinimized(false);
    } else {
      setIsOpen(false);
    }
  };

  const minimizeChat = () => {
    setIsMinimized(true);
  };

  const maximizeChat = () => {
    setIsMinimized(false);
  };

  const closeChat = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  return (
    <div className={clsx("fixed bottom-6 right-6 z-50 transition-all duration-300", className)}>
      {/* Chat Window */}
      {isOpen && (
        <div
          ref={widgetRef}
          className={clsx(
            "mb-4 bg-white rounded-2xl shadow-2xl border border-gray-200 transition-all duration-300 overflow-hidden",
            isMinimized
              ? "w-80 h-16"
              : "w-96 h-[600px] lg:w-[450px] lg:h-[650px]"
          )}
          style={{
            transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
          }}
        >
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-tbwa-navy to-tbwa-navy-800">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-tbwa-yellow rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-tbwa-navy" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Scout AI</h3>
                <p className="text-xs text-tbwa-navy-100">Retail Intelligence Assistant</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              {!isMinimized && (
                <button
                  onClick={minimizeChat}
                  className="p-1.5 hover:bg-tbwa-navy-700 rounded-lg transition-colors"
                  title="Minimize"
                >
                  <Minimize2 className="w-4 h-4 text-white" />
                </button>
              )}
              {isMinimized && (
                <button
                  onClick={maximizeChat}
                  className="p-1.5 hover:bg-tbwa-navy-700 rounded-lg transition-colors"
                  title="Maximize"
                >
                  <Maximize2 className="w-4 h-4 text-white" />
                </button>
              )}
              <button
                onClick={closeChat}
                className="p-1.5 hover:bg-red-600 rounded-lg transition-colors"
                title="Close"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Chat Content */}
          {!isMinimized && (
            <div className="h-full">
              <EnhancedRetailBot 
                className="h-full border-0 rounded-none" 
                isEmbedded={true}
                showHeader={false}
              />
            </div>
          )}
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={toggleChat}
        className={clsx(
          "group relative bg-gradient-to-r from-tbwa-navy to-tbwa-navy-800 hover:from-tbwa-navy-700 hover:to-tbwa-navy-900 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110",
          isOpen ? "w-14 h-14" : "w-16 h-16",
          isVisible ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"
        )}
        title="Open Scout AI Assistant"
      >
        <div className="flex items-center justify-center">
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <>
              <MessageCircle className="w-7 h-7 transition-transform group-hover:scale-110" />
              {/* Notification Badge */}
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-tbwa-yellow rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-tbwa-navy rounded-full animate-pulse"></div>
              </div>
            </>
          )}
        </div>

        {/* Tooltip */}
        {!isOpen && (
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
            Ask Scout AI anything about your data
            <div className="absolute top-full right-4 w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        )}
      </button>

      {/* Quick Actions Bubble */}
      {!isOpen && isVisible && (
        <div className="absolute bottom-20 right-0 w-48 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-3 space-y-2">
            <div className="text-xs font-semibold text-tbwa-navy mb-2">Quick Questions:</div>
            <div className="space-y-1 text-xs text-gray-600">
              <div>💰 "Show me today's revenue"</div>
              <div>📊 "Top performing brands"</div>
              <div>🗺️ "Best regions for TBWA"</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersistentChatWidget;