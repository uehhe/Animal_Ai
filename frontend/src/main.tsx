import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext.js';
import { AuthProvider } from './contexts/AuthContext.js';
import { PetProvider } from './contexts/PetContext.js';
import { App } from './App.js';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Không tìm thấy root element để gắn kết ứng dụng React');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <PetProvider>
            <App />
          </PetProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
);
