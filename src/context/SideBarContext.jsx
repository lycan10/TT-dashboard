import React, { createContext, useContext, useState } from 'react';

const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  const [sidebarShow, setSidebarShow] = useState(false);
  const toggleSidebar = () => setSidebarShow(prev => !prev);

  return (
    <SidebarContext.Provider value={{ sidebarShow, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => useContext(SidebarContext);
