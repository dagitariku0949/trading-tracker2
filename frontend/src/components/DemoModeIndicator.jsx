import React from 'react';

const DemoModeIndicator = () => {
  const isDemoMode = import.meta.env.PROD && !import.meta.env.VITE_API_BASE;
  
  if (!isDemoMode) return null;
  
  return (
    <div className="bg-yellow-600 text-black px-4 py-2 text-center text-sm">
      🎯 Demo Mode: This is a live demo of LEAP Trading Dashboard. 
      <a 
        href="https://github.com/dagitariku0949/trading-tracker2" 
        target="_blank" 
        rel="noopener noreferrer"
        className="underline ml-2 font-semibold"
      >
        View Source Code
      </a>
    </div>
  );
};

export default DemoModeIndicator;