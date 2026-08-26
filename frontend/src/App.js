import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import JobList from './pages/JobList';
import MyApplications from './pages/MyApplications';
import RecruiterDashboard from './pages/RecruiterDashboard';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<JobList />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/my-applications"
            element={
              <ProtectedRoute allowedRoles={['candidate']}>
                <MyApplications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/dashboard"
            element={
              <ProtectedRoute allowedRoles={['recruiter']}>
                <RecruiterDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
