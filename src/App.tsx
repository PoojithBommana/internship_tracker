import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import AuthPage from './pages/loginpage/index.tsx';
import Dashboard from './pages/dashboard/index.tsx';
import ViewApplications from './pages/viewApplications/index.tsx';
import Analytics from './pages/analytics/index.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<AuthPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute children={<Dashboard />} />
            } 
          />
          <Route 
            path="/applications" 
            element={
              <ProtectedRoute children={<ViewApplications />} />
            } 
          />
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute children={<Analytics />} />
            } 
          />
         
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
