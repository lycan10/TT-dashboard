import React from 'react';
import ReactDOM from 'react-dom/client'; // 👈 use this instead
import App from './App';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { SidebarProvider } from './context/SideBarContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <SidebarProvider>
      <App />
    </SidebarProvider >
  </BrowserRouter>
);