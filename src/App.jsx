import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './Layout';

// Importar suas páginas
import Login from './pages/Login';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Goals from './pages/Goals';
import Marathons from './pages/Marathons';
import MarathonDetail from './pages/MarathonDetail';
import Cronometro from './pages/Lista'; // Era Calendar
import Sprint from './pages/Sprint';         // Era Ranking
import Settings from './pages/Settings';
import AdminProgress from './pages/AdminProgress'; // <--- Importe aqui

const queryClient = new QueryClient();

// --- NOVO COMPONENTE: ROTA PROTEGIDA ---
// Ele verifica se existe um token. Se não existir, manda para o login.
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const location = useLocation();

  if (!token) {
    // Redireciona para /login, mas lembra de onde a pessoa veio (state)
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* --- ROTAS PÚBLICAS (Qualquer um acessa) --- */}
          <Route path="/login" element={<Login />} />
          
          {/* A Home e o Layout base continuam públicos para a "vitrine" do site */}
          <Route path="/" element={<Layout currentPageName="Home"><Home /></Layout>} />
          <Route path="/home" element={<Layout currentPageName="Home"><Home /></Layout>} />

          {/* --- ROTAS PROTEGIDAS (Só logado acessa) --- */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout currentPageName="Dashboard"><Dashboard /></Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/goals" element={
            <ProtectedRoute>
              <Layout currentPageName="Goals"><Goals /></Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/marathons" element={
            <ProtectedRoute>
              <Layout currentPageName="Marathons"><Marathons /></Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/marathondetail" element={
            <ProtectedRoute>
              <Layout currentPageName="Marathons"><MarathonDetail /></Layout>
            </ProtectedRoute>
          } />
          
            <Route path="/lista" element={
            <ProtectedRoute>
              {/* Note que o currentPageName mudou para 'Cronometro' */}
              <Layout currentPageName="Lista"><Cronometro /></Layout>
            </ProtectedRoute>
          } />
          
            <Route path="/sprint" element={
            <ProtectedRoute>
              {/* Note que o currentPageName mudou para 'Sprint' */}
              <Layout currentPageName="Sprint"><Sprint /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute>
              <Layout currentPageName="Admin"><AdminProgress /></Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/settings" element={
            <ProtectedRoute>
              <Layout currentPageName="Settings"><Settings /></Layout>
            </ProtectedRoute>
          } />

          {/* Rota padrão: redireciona para a Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;