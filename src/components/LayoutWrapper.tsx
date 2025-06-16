import React from 'react';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-neutral">
      {/* TBWA Header */}
      <header className="tbwa-header">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <div>
                <h1 className="text-xl font-bold tbwa-text-gradient">Scout Analytics</h1>
                <p className="text-xs text-gray-500">Philippine Retail Intelligence</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="tbwa-badge">
                Live Production
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Powered by</span>
                <span className="font-semibold text-primary">TBWA</span>
                <span className="text-accent">×</span>
                <span className="font-semibold text-primary">InsightPulse AI</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6">
        {children}
      </main>

      {/* TBWA Footer */}
      <footer className="border-t border-gray-200 bg-white mt-12">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span>© 2025 TBWA Philippines</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span>Scout Analytics Platform</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="tbwa-badge-yellow">Retail Intelligence</span>
              <span>v2.0.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};