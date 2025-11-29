import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './Layout';

// Importar suas páginas
import Login from './pages/Login';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Goals from './pages/Goals';
import Marathons from './pages/Marathons';
import MarathonDetail from './pages/MarathonDetail';
import Calendar from './pages/Calendar';
import Ranking from './pages/Ranking';
import Settings from './pages/Settings';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout currentPageName="Home"><Home /></Layout>} />
          <Route path="/home" element={<Layout currentPageName="Home"><Home /></Layout>} />
          <Route path="/dashboard" element={<Layout currentPageName="Dashboard"><Dashboard /></Layout>} />
          <Route path="/goals" element={<Layout currentPageName="Goals"><Goals /></Layout>} />
          <Route path="/marathons" element={<Layout currentPageName="Marathons"><Marathons /></Layout>} />
          <Route path="/marathondetail" element={<Layout currentPageName="Marathons"><MarathonDetail /></Layout>} />
          <Route path="/calendar" element={<Layout currentPageName="Calendar"><Calendar /></Layout>} />
          <Route path="/ranking" element={<Layout currentPageName="Ranking"><Ranking /></Layout>} />
          <Route path="/settings" element={<Layout currentPageName="Settings"><Settings /></Layout>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;