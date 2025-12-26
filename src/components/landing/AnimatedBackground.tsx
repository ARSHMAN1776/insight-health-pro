import React from 'react';

const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Mesh Gradient Background */}
      <div className="absolute inset-0 bg-mesh opacity-50"></div>
      
      {/* Animated Gradient Blobs */}
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-primary/30 via-info/20 to-transparent rounded-full blur-3xl blob blob-1 animate-float-slow"></div>
      <div className="absolute top-1/2 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-info/25 via-primary/15 to-transparent rounded-full blur-3xl blob blob-2 animate-float-reverse"></div>
      <div className="absolute -bottom-40 right-1/4 w-[400px] h-[400px] bg-gradient-to-br from-success/20 via-primary/10 to-transparent rounded-full blur-3xl blob blob-3 animate-float"></div>
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-dots opacity-30"></div>
      
      {/* Floating Medical Elements */}
      <div className="absolute top-20 left-[10%] animate-float stagger-1">
        <div className="w-4 h-4 rounded-full bg-primary/40 blur-sm"></div>
      </div>
      <div className="absolute top-40 right-[15%] animate-float-slow stagger-2">
        <div className="w-6 h-6 rounded-full bg-info/30 blur-sm"></div>
      </div>
      <div className="absolute bottom-40 left-[20%] animate-float-reverse stagger-3">
        <div className="w-3 h-3 rounded-full bg-success/40 blur-sm"></div>
      </div>
      <div className="absolute top-1/3 right-[25%] animate-float stagger-4">
        <div className="w-5 h-5 rounded-full bg-primary/20 blur-sm"></div>
      </div>
      <div className="absolute bottom-1/4 right-[10%] animate-float-slow stagger-5">
        <div className="w-4 h-4 rounded-full bg-info/25 blur-sm"></div>
      </div>
      
      {/* Gradient Lines */}
      <div className="absolute top-0 left-1/4 w-px h-40 bg-gradient-to-b from-primary/20 to-transparent"></div>
      <div className="absolute top-0 right-1/3 w-px h-60 bg-gradient-to-b from-info/20 to-transparent"></div>
      <div className="absolute bottom-0 left-1/3 w-px h-40 bg-gradient-to-t from-primary/20 to-transparent"></div>
    </div>
  );
};

export default AnimatedBackground;
