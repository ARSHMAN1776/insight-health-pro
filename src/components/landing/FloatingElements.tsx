import React from 'react';
import { Heart, Activity, Pill, Stethoscope, Shield, Cross } from 'lucide-react';

const FloatingElements = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating Icons */}
      <div className="absolute top-[15%] left-[8%] animate-float stagger-1">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 backdrop-blur-xl border border-primary/20 flex items-center justify-center shadow-lg">
          <Heart className="w-8 h-8 text-primary" />
        </div>
      </div>
      
      <div className="absolute top-[25%] right-[12%] animate-float-slow stagger-2">
        <div className="w-14 h-14 rounded-xl bg-success/10 backdrop-blur-xl border border-success/20 flex items-center justify-center shadow-lg">
          <Activity className="w-7 h-7 text-success" />
        </div>
      </div>
      
      <div className="absolute bottom-[30%] left-[5%] animate-float-reverse stagger-3">
        <div className="w-12 h-12 rounded-xl bg-info/10 backdrop-blur-xl border border-info/20 flex items-center justify-center shadow-lg">
          <Pill className="w-6 h-6 text-info" />
        </div>
      </div>
      
      <div className="absolute top-[60%] right-[8%] animate-float stagger-4">
        <div className="w-14 h-14 rounded-2xl bg-warning/10 backdrop-blur-xl border border-warning/20 flex items-center justify-center shadow-lg">
          <Stethoscope className="w-7 h-7 text-warning" />
        </div>
      </div>
      
      <div className="absolute bottom-[20%] right-[20%] animate-float-slow stagger-5">
        <div className="w-10 h-10 rounded-lg bg-primary/10 backdrop-blur-xl border border-primary/20 flex items-center justify-center shadow-lg">
          <Shield className="w-5 h-5 text-primary" />
        </div>
      </div>
      
      <div className="absolute top-[45%] left-[3%] animate-float stagger-6">
        <div className="w-12 h-12 rounded-xl bg-destructive/10 backdrop-blur-xl border border-destructive/20 flex items-center justify-center shadow-lg">
          <Cross className="w-6 h-6 text-destructive" />
        </div>
      </div>
      
      {/* Decorative Circles */}
      <div className="absolute top-[10%] left-[40%] w-2 h-2 rounded-full bg-primary animate-pulse"></div>
      <div className="absolute top-[30%] left-[70%] w-3 h-3 rounded-full bg-info/50 animate-pulse stagger-2"></div>
      <div className="absolute bottom-[40%] left-[15%] w-2 h-2 rounded-full bg-success animate-pulse stagger-3"></div>
      <div className="absolute bottom-[25%] right-[35%] w-2 h-2 rounded-full bg-warning animate-pulse stagger-4"></div>
    </div>
  );
};

export default FloatingElements;
