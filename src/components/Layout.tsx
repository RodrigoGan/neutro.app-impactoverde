import React from 'react';
import AppFooter from './AppFooter';
// import TopNavBar from './ui/TopNavBar'; // Removido

interface LayoutProps {
  children: React.ReactNode;
  hideFooter?: boolean;
  hideHeader?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  hideFooter = false, 
  hideHeader = false 
}) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* TopNavBar removido */}
      <main className="flex-1">{children}</main>
      {!hideFooter && <AppFooter />}
    </div>
  );
};

export default Layout;
