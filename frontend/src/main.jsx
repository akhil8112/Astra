import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';

import App from './App';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import ScreenerPage from './pages/ScreenerPage';
import ResultsPage from './pages/ScreenerResultsPage.jsx';
import MagicCanvasPage from './pages/MagicCanvasPage';
import EmotionMirrorPage from './pages/EmotionMirrorPage';
import ResourceHubPage from './pages/ResourceHubPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AboutUsPage from './pages/AboutUsPage';
import SensoryGymPage from './pages/SensoryGymPage';
import ResourceLibraryPage from './pages/ResourceLibraryPage';
import ForumPage from './pages/ForumPage';
import PostDetailPage from './pages/PostDetailPage';
import ProtectedRoute from './components/common/ProtectedRoute';
import MagicDrumsPage from './pages/MagicDrumsPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      { path: 'about', element: <AboutUsPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage /> },

      {
        element: <ProtectedRoute />,
        children: [
          {
            path: 'dashboard',
            element: <DashboardPage />,
          },
        ]
      },

      {
        path: 'gym',
        children: [
          {
            index: true,
            element: <SensoryGymPage />,
          },
          { path: 'magic-canvas', element: <MagicCanvasPage /> },
          { path: 'emotion-mirror', element: <EmotionMirrorPage /> },
          { path: 'magic-drums', element: <MagicDrumsPage /> },
        ],
      },
      {
        path: 'resources',
        children: [
          {
            index: true,
            element: <ResourceHubPage />,
          },
          {
            path: 'library',
            element: <ResourceLibraryPage />,
          },
        ]
      },
      { path: 'forum', element: <ForumPage /> },
      { path: 'forum/:postId', element: <PostDetailPage /> },
      {
        path: 'screener',
        children: [
          {
            index: true,
            element: <ScreenerPage />,
          },
          {
            path: 'results',
            element: <ResultsPage />,
          },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);