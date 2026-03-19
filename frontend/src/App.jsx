import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import { useAuthStore } from './store/authStore';

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const token = useAuthStore((state) => state.token);
  const isInitializing = useAuthStore((state) => state.isInitializing);

  // This effect runs only once to check the initial auth status
  useEffect(() => {
    // If a token exists from storage, validate it.
    if (token) {
      checkAuth();
    } else {

      useAuthStore.setState({ isInitializing: false });
    }
  }, [checkAuth, token]);

  return (
    <div className="min-h-screen bg-background font-sans antialiased flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default App;