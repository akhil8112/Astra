import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

const ProtectedRoute = () => {
    const { isAuthenticated, token } = useAuthStore();

    // The app is still initializing if we have a token but no user yet.
    // We can show a loading state in this case.
    const isInitializing = !!token && !isAuthenticated;

    if (isInitializing) {
        return <div className="container py-12 text-center">Initializing session...</div>;
    }

    // If the user is authenticated, render the page they are trying to access.
    // Otherwise, redirect them to the login page.
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;