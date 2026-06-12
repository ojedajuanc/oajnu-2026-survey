import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createHashRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ActiveSurveyProvider } from './context/ActiveSurveyContext.jsx';
import { ToastProvider } from './components/ui/Toast.jsx';

import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/cover.css';
import './styles/survey.css';
import './styles/ranking.css';
import './styles/thankyou.css';
import './styles/results.css';
import './styles/admin-login.css';
import './styles/admin-panel.css';
import './styles/admin-dashboard.css';

// Hash router for GitHub Pages compatibility. App renders <Routes> inside.
const router = createHashRouter([{ path: '*', element: <App /> }]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ActiveSurveyProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </ActiveSurveyProvider>
    </AuthProvider>
  </React.StrictMode>
);
