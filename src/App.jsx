import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

const HomePage = lazy(() => import('./pages/HomePage'));
const MapsPage = lazy(() => import('./pages/MapsPage'));
const CommunityPage = lazy(() => import('./pages/CommunityPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));

export function App() {
  return (
    <Suspense fallback={<div className="route-loading">Chargement de l'atelier...</div>}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/maps" element={<MapsPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
