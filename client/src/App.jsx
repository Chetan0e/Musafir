import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';
import ChatWidget from './components/ai/ChatWidget.jsx';
import { SkeletonCard } from './components/ui/index.js';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home.jsx'));
const Auth = lazy(() => import('./pages/Auth.jsx'));
const PlanTrip = lazy(() => import('./pages/PlanTrip.jsx'));
const TripDetail = lazy(() => import('./pages/TripDetail.jsx'));
const TripHistory = lazy(() => import('./pages/TripHistory.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Stories = lazy(() => import('./pages/Stories.jsx'));
const StoryDetail = lazy(() => import('./pages/StoryDetail.jsx'));
const PlaceScanner = lazy(() => import('./pages/PlaceScanner.jsx'));
const Settings = lazy(() => import('./pages/Settings.jsx'));

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <SkeletonCard />
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/auth" replace />;
};

// Layout wrapper with navbar and footer
const Layout = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      {isAuthenticated && <ChatWidget />}
    </div>
  );
};

// Page wrapper with loading state
const PageWrapper = ({ children }) => (
  <Suspense 
    fallback={
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="w-full max-w-4xl space-y-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    }
  >
    {children}
  </Suspense>
);

function App() {
  return (
    <Routes>
      {/* Auth route - no layout */}
      <Route 
        path="/auth" 
        element={
          <PageWrapper>
            <Auth />
          </PageWrapper>
        } 
      />
      
      {/* Public routes with layout */}
      <Route 
        path="/" 
        element={
          <Layout>
            <PageWrapper><Home /></PageWrapper>
          </Layout>
        } 
      />
      <Route 
        path="/stories" 
        element={
          <Layout>
            <PageWrapper><Stories /></PageWrapper>
          </Layout>
        } 
      />
      <Route 
        path="/stories/:id" 
        element={
          <Layout>
            <PageWrapper><StoryDetail /></PageWrapper>
          </Layout>
        } 
      />
      
      {/* Protected routes */}
      <Route 
        path="/plan" 
        element={
          <Layout>
            <PageWrapper>
              <ProtectedRoute><PlanTrip /></ProtectedRoute>
            </PageWrapper>
          </Layout>
        } 
      />
      <Route 
        path="/trips/:id" 
        element={
          <Layout>
            <PageWrapper>
              <ProtectedRoute><TripDetail /></ProtectedRoute>
            </PageWrapper>
          </Layout>
        } 
      />
      <Route 
        path="/trips" 
        element={
          <Layout>
            <PageWrapper>
              <ProtectedRoute><TripHistory /></ProtectedRoute>
            </PageWrapper>
          </Layout>
        } 
      />
      <Route 
        path="/scan" 
        element={
          <Layout>
            <PageWrapper>
              <ProtectedRoute><PlaceScanner /></ProtectedRoute>
            </PageWrapper>
          </Layout>
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          <Layout>
            <PageWrapper>
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            </PageWrapper>
          </Layout>
        } 
      />
      <Route 
        path="/dashboard/settings" 
        element={
          <Layout>
            <PageWrapper>
              <ProtectedRoute><Settings /></ProtectedRoute>
            </PageWrapper>
          </Layout>
        } 
      />
      
      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
