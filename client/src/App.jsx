import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import { Navbar } from './components/Navbar.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';

import { Login } from './pages/Login.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { Inventory } from './pages/Inventory.jsx';
import { AddItem } from './pages/AddItem.jsx';
import { ItemDetail } from './pages/ItemDetail.jsx';
import { EditItem } from './pages/EditItem.jsx';
import { CollectionLog } from './pages/CollectionLog.jsx';
import { DisposalLog } from './pages/DisposalLog.jsx';
import { Volunteers } from './pages/Volunteers.jsx';
import { Privacy } from './pages/Privacy.jsx';
import { Terms } from './pages/Terms.jsx';
import { NotFound } from './pages/NotFound.jsx';
import { Footer } from './components/Footer.jsx';

export const App = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F4] text-[#1C1B19]">
      {isAuthenticated && <Navbar />}

      <main id="main-content" className="flex-1">
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Navigate to="/dashboard" replace />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <Inventory />
              </ProtectedRoute>
            }
          />

          <Route
            path="/inventory/:id"
            element={
              <ProtectedRoute>
                <ItemDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/inventory/:id/edit"
            element={
              <ProtectedRoute>
                <EditItem />
              </ProtectedRoute>
            }
          />

          <Route
            path="/add-item"
            element={
              <ProtectedRoute>
                <AddItem />
              </ProtectedRoute>
            }
          />

          <Route
            path="/collections"
            element={
              <ProtectedRoute>
                <CollectionLog />
              </ProtectedRoute>
            }
          />

          <Route
            path="/disposals"
            element={
              <ProtectedRoute>
                <DisposalLog />
              </ProtectedRoute>
            }
          />

          <Route
            path="/volunteers"
            element={
              <ProtectedRoute requireAdmin={true}>
                <Volunteers />
              </ProtectedRoute>
            }
          />

          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
};

export default App;
