import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useFilterStore } from './store/useFilterStore';
import { LayoutWrapper } from './components/LayoutWrapper';
import Sidebar from './components/layout/Sidebar';
import GlobalFilterBar from './components/filters/GlobalFilterBar';
import Overview from './pages/Overview';
import TransactionTrends from './pages/TransactionTrends';
import ProductMix from './pages/ProductMix';
import ConsumerInsights from './pages/ConsumerInsights';
import RetailBot from './pages/RetailBot';
// SnowWhite Sanitized Components
import { ClientSanitizer } from './utils/client-sanitizer';

function App() {
  const { initializeFromURL } = useFilterStore();

  // Initialize SnowWhite client sanitization
  useEffect(() => {
    ClientSanitizer.initializeClientMode();
  }, []);

  // Demo: Deliberate console error for testing auto-issue workflow
  useEffect(() => {
    if (import.meta.env.VITE_SCOUT_DEMO === 'test-error') {
      console.error('demo-fail: Testing auto-issue creation workflow');
    }
  }, []);

  useEffect(() => {
    initializeFromURL();
  }, [initializeFromURL]);

  return (
    <LayoutWrapper>
      <div className="dashboard-container">
        <div className="filter-bar">
          <GlobalFilterBar />
        </div>
        
        <div className="flex">
          <Sidebar />
          
          <main className="flex-1 lg:ml-64 p-6">
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/trends" element={<TransactionTrends />} />
              <Route path="/products" element={<ProductMix />} />
              <Route path="/consumers" element={<ConsumerInsights />} />
              <Route path="/retailbot" element={<RetailBot />} />
            </Routes>
          </main>
        </div>
      </div>
    </LayoutWrapper>
  );
}

export default App;