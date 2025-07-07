import React from 'react';
import LeftNavigation from './LeftNavigation';

const LayoutWrapper = ({ children, showNavigation = true }) => {
  return (
    <div className="relative">
      {showNavigation && <LeftNavigation />}
      <div className="md:ml-24">
        {children}
      </div>
    </div>
  );
};

export default LayoutWrapper;