import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext.jsx';
import App from './App.jsx';
import './index.css';

// Toast configuration
const toastConfig = {
  position: 'top-right',
  duration: 4000,
  style: {
    background: '#111114',
    color: '#F5F0E8',
    border: '1px solid #2A2A32',
    borderRadius: '8px',
    padding: '12px 16px',
  },
  success: {
    iconTheme: {
      primary: '#C9A96E',
      secondary: '#111114',
    },
  },
  error: {
    iconTheme: {
      primary: '#F87171',
      secondary: '#111114',
    },
  },
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster {...toastConfig} />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
