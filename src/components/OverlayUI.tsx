import React, { useEffect, useRef, useState } from 'react';
import { Scroll } from '@react-three/drei';
import { ChevronRight, Flame, Timer, ShieldCheck, Zap } from 'lucide-react';

export function OverlayUI() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Scroll html style={{ width: '100%' }}>
      {/* 1. HERO — "Start Your Engine" */}
      <section className="h-[150vh] flex flex-col items-center justify-center text-center px-4 relative z-10 pointer-events-none">
        <div className={`pointer-events-auto transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
          <h1 className="font-display text-7xl md:text-9xl tracking-tighter uppercase leading-none mb-6 text-white drop-shadow-[0_0_30px_rgba(255,42,0,0.8)]">
            <span className="text-[#FF2A00]">Start</span> Your Engine.<br />
            Collect The <span className="text-[#FFD500]">Legends.</span>
          </h1>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <button className="bg-[#FF2A00] hover:bg-[#FF6A00] text-white font-display text-xl px-8 py-4 uppercase tracking-wider transition-all duration-300 transform hover:scale-105 hover:-rotate-2 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,42,0,0.5)]">
              <Zap size={24} /> Shop Now
            </button>
            <button className="bg-transparent border-2 border-[#FFD500] text-[#FFD500] hover:bg-[#FFD500] hover:text-black font-display text-xl px-8 py-4 uppercase tracking-wider transition-all duration-300 transform hover:scale-105 hover:rotate-2 flex items-center justify-center gap-2">
              <Timer size={24} /> View Live Auction
            </button>
          </div>
        </div>
      </section>

      {/* SPACER — Maintains track length after removing sections */}
      <div className="h-[490vh] pointer-events-none"></div>

      {/* 6. TRUST — "Garage Approved" */}
      <section className="h-[70vh] flex items-center justify-center bg-[#0D0D0F]/80 backdrop-blur-md border-y border-white/10 pointer-events-none">
        <div className="w-full max-w-6xl px-4 pointer-events-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full border-2 border-[#FF6A00] flex items-center justify-center mb-6 text-[#FF6A00]">
                <ShieldCheck size={40} />
              </div>
              <h3 className="font-display text-2xl uppercase mb-2">Verified Authentic</h3>
              <p className="font-sans text-gray-400 text-sm">Every collectible is inspected and verified by our expert mechanics.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full border-2 border-[#FFD500] flex items-center justify-center mb-6 text-[#FFD500]">
                <Zap size={40} />
              </div>
              <h3 className="font-display text-2xl uppercase mb-2">Lightning Shipping</h3>
              <p className="font-sans text-gray-400 text-sm">Orders ship within 24 hours in secure, collector-grade packaging.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full border-2 border-[#FF2A00] flex items-center justify-center mb-6 text-[#FF2A00]">
                <Flame size={40} />
              </div>
              <h3 className="font-display text-2xl uppercase mb-2">Exclusive Drops</h3>
              <p className="font-sans text-gray-400 text-sm">Access to limited editions and member-only pre-orders.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. DROP ALERT — "Finish Line" */}
      <section className="h-[100vh] flex flex-col items-center justify-center text-center px-4 relative pointer-events-none">
        <div className="absolute top-1/2 left-0 w-full h-4 bg-white transform -translate-y-1/2 -skew-y-2 opacity-20"></div>
        <div className="absolute top-1/2 left-0 w-full h-4 bg-white transform -translate-y-1/2 skew-y-2 opacity-20"></div>
        
        <div className="relative z-10 pointer-events-auto bg-black/60 p-12 border-4 border-white backdrop-blur-sm transform -rotate-1 hover:rotate-0 transition-transform duration-500">
          <h2 className="font-display text-6xl md:text-8xl uppercase tracking-tighter text-white mb-6">
            🏁 Don't Miss The <span className="text-[#FF2A00]">Next Drop.</span>
          </h2>
          <p className="font-sans text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join the pit crew. Get SMS alerts 15 minutes before limited editions hit the track.
          </p>
          
          <form className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="ENTER YOUR EMAIL" 
              className="bg-white/10 border-2 border-white/30 text-white font-display text-xl px-6 py-4 outline-none focus:border-[#FFD500] transition-colors w-full sm:w-auto flex-grow uppercase placeholder-gray-500"
            />
            <button type="submit" className="bg-[#FFD500] hover:bg-white text-black font-display text-xl px-8 py-4 uppercase tracking-wider transition-colors duration-300 whitespace-nowrap">
              Join Crew
            </button>
          </form>
        </div>
      </section>
    </Scroll>
  );
}
