import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import LiveVisitors from './pages/LiveVisitors';
import VisitorSessions from './pages/VisitorSessions';
import ClickAnalysis from './pages/ClickAnalysis';
import Heatmap from './pages/Heatmap';
import SessionReplay from './pages/SessionReplay';
import FraudDetection from './pages/FraudDetection';
import BotDetection from './pages/BotDetection';
import DeviceAnalytics from './pages/DeviceAnalytics';
import GeoAnalytics from './pages/GeoAnalytics';
import CampaignAnalytics from './pages/CampaignAnalytics';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import { useAppStore } from './store/useAppStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30000, // 30s cache
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const autoLogin = useAppStore(s => s.autoLogin);

  // Auto-login on mount
  useEffect(() => {
    autoLogin();
  }, [autoLogin]);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/live" element={<LiveVisitors />} />
          <Route path="/sessions" element={<VisitorSessions />} />
          <Route path="/click-analysis" element={<ClickAnalysis />} />
          <Route path="/heatmap" element={<Heatmap />} />
          <Route path="/replay" element={<SessionReplay />} />
          <Route path="/fraud-detection" element={<FraudDetection />} />
          <Route path="/bot-detection" element={<BotDetection />} />
          <Route path="/device-analytics" element={<DeviceAnalytics />} />
          <Route path="/geo-analytics" element={<GeoAnalytics />} />
          <Route path="/campaign-analytics" element={<CampaignAnalytics />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
