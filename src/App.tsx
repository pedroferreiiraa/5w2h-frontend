// src/App.tsx
import React, { ReactNode } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/NavBar';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import AddProject from './pages/AddProjectPage';


// Layout para rotas que terão a Navbar
const Layout: React.FC<{ children: ReactNode }> = ({ children }) => (
  <>
    <Navbar />
    <div className="container mx-auto p-4">{children}</div>
  </>
);

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/home"
          element={
            <Layout>
              <HomePage />
            </Layout>
          }
        />

        <Route
          path="/adicionar-projeto" // Adicione esta rota
          element={
            <Layout>
              <AddProject />
            </Layout>
          }
        />

        {/* Corrigindo a rota de detalhes do projeto */}

      </Routes>
    </Router>
  );
};

export default App;
