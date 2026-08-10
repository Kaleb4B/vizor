import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
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
      staleTime: 1000, // 1s stale time for live responsiveness
      refetchOnWindowFocus: true,
    },
  },
});

function AppContent() {
  const autoLogin = useAppStore(s => s.autoLogin);
  const qc = useQueryClient();

  // Auto-login & Socket.io setup on mount
  useEffect(() => {
    autoLogin();

    // Connect to Socket.io backend for 0ms latency updates
    const socket = io('/', { transports: ['websocket', 'polling'] });
    socket.emit('subscribe_site', 'site-001');

    const handleRealtimeEvent = () => {
      qc.invalidateQueries({ queryKey: ['live-visitors'] });
      qc.invalidateQueries({ queryKey: ['dashboard-summary'] });
      qc.invalidateQueries({ queryKey: ['dashboard-alerts'] });
      qc.invalidateQueries({ queryKey: ['dashboard-timeseries'] });
    };

    socket.on('visitor:activity', handleRealtimeEvent);
    socket.on('visitor:new', handleRealtimeEvent);
    socket.on('alert', handleRealtimeEvent);
    socket.on('stats:update', handleRealtimeEvent);

    return () => {
      socket.off('visitor:activity', handleRealtimeEvent);
      socket.off('visitor:new', handleRealtimeEvent);
      socket.off('alert', handleRealtimeEvent);
      socket.off('stats:update', handleRealtimeEvent);
      socket.disconnect();
    };
  }, [autoLogin, qc]);

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
