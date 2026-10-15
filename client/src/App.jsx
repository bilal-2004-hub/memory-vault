import { Navigate, Outlet, Route, Routes, BrowserRouter } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import CreateMemory from './pages/CreateMemory';
import Dashboard from './pages/Dashboard';
import Favorites from './pages/Favorites';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Memories from './pages/Memories';
import MemoryDetails from './pages/MemoryDetails';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Signup from './pages/Signup';
import Timeline from './pages/Timeline';

const AppLayout = () => (
  <div className="min-h-screen bg-[#F8F7F4] p-4 md:p-6">
    <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row">
      <Sidebar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  </div>
);

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/memories" element={<Memories />} />
                <Route path="/memories/create" element={<CreateMemory />} />
                <Route path="/memories/:id" element={<MemoryDetails />} />
                <Route path="/memories/:id/edit" element={<CreateMemory />} />
                <Route path="/timeline" element={<Timeline />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  </ThemeProvider>
  );

export default App;
