import React, { useState, useEffect, useRef } from 'react';
import { Activity, AlertTriangle, TrendingUp, TrendingDown, Volume2, VolumeX, Radio, Crosshair, ShieldAlert, Zap, Globe } from 'lucide-react';
import { motion } from 'motion/react';

// Mock data for the chart
const generateChartData = () => {
  let current = 40;
  return Array.from({ length: 50 }).map((_, i) => {
    current += (Math.random() - 0.4) * 5; // Upward bias
    if (current > 99) current = 99;
    if (current < 10) current = 10;
    return {
      id: i,
      value: current,
    };
  });
};

const initialData = generateChartData();

export default function App() {
  const [chartData, setChartData] = useState(initialData);
  const [price, setPrice] = useState(0.0042069);
  const [isMuted, setIsMuted] = useState(true);
  const [votes, setVotes] = useState({ escalate: 1420, deescalate: 890 });
  const [userVote, setUserVote] = useState<'escalate' | 'deescalate' | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Simulate live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setChartData(prev => {
        const lastValue = prev[prev.length - 1].value;
        let newValue = lastValue + (Math.random() - 0.45) * 4;
        if (newValue > 99) newValue = 99;
        if (newValue < 10) newValue = 10;
        
        const newData = [...prev.slice(1), { id: Date.now(), value: newValue }];
        return newData;
      });

      setPrice(p => p * (1 + (Math.random() - 0.48) * 0.05));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.play().catch(e => console.log("Audio play failed:", e));
      } else {
        audioRef.current.pause();
      }
      setIsMuted(!isMuted);
    }
  };

  const handleVote = (type: 'escalate' | 'deescalate') => {
    if (userVote === type) return;
    
    setVotes(prev => ({
      ...prev,
      [type]: prev[type] + 1,
      ...(userVote ? { [userVote]: prev[userVote] - 1 } : {})
    }));
    setUserVote(type);
  };

  const currentProbability = chartData[chartData.length - 1].value;
  const isHighRisk = currentProbability > 75;

  // SVG Chart Calculations
  const chartWidth = 800;
  const chartHeight = 300;
  const minVal = 0;
  const maxVal = 100;
  
  const points = chartData.map((d, i) => {
    const x = (i / (chartData.length - 1)) * chartWidth;
    const y = chartHeight - ((d.value - minVal) / (maxVal - minVal)) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="min-h-screen bg-[#050505] text-[#e5e5e5] font-sans selection:bg-red-900 selection:text-white overflow-x-hidden">
      {/* Background Grid & Glow */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20" 
           style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>
      <div className={`fixed inset-0 z-0 pointer-events-none transition-opacity duration-1000 ${isHighRisk ? 'opacity-10' : 'opacity-0'}`}
           style={{ background: 'radial-gradient(circle at 50% 50%, rgba(255,0,0,0.2) 0%, transparent 70%)' }}>
      </div>

      {/* Audio Element (Wagner's Ride of the Valkyries - Public Domain) */}
      <audio 
        ref={audioRef} 
        src="https://upload.wikimedia.org/wikipedia/commons/c/c8/Richard_Wagner_-_Ride_of_the_Valkyries.ogg" 
        loop 
      />

      <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-6 flex flex-col gap-6">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShieldAlert className={`w-10 h-10 ${isHighRisk ? 'text-red-500' : 'text-orange-500'}`} />
              {isHighRisk && (
                <span className="absolute top-0 left-0 w-full h-full bg-red-500 rounded-full blur-md opacity-50 animate-pulse"></span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tighter uppercase flex items-center gap-2">
                $WW3 <span className="text-sm font-normal text-gray-500 tracking-widest">Terminal</span>
              </h1>
              <div className="text-xs text-gray-400 font-mono flex items-center gap-2">
                <Radio className="w-3 h-3 text-green-500 animate-pulse" />
                LIVE FEED SECURE
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-xs text-gray-500 uppercase tracking-wider">Current Price</div>
              <div className="font-mono text-xl font-bold text-green-400">
                ${price.toFixed(7)}
              </div>
            </div>
            <button 
              onClick={toggleAudio}
              className="p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              title={isMuted ? "Play Theme" : "Mute Theme"}
            >
              {isMuted ? <VolumeX className="w-5 h-5 text-gray-400" /> : <Volume2 className="w-5 h-5 text-red-400" />}
            </button>
          </div>
        </header>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Chart & Stats */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Probability Index Chart */}
            <div className="bg-black/40 border border-white/10 rounded-xl p-6 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
              
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-lg font-semibold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Middle East Tension Index
                  </h2>
                  <p className="text-sm text-gray-500 font-mono mt-1">PROBABILITY OF ESCALATION</p>
                </div>
                <div className="text-right">
                  <div className={`text-4xl font-mono font-bold ${isHighRisk ? 'text-red-500' : 'text-orange-400'}`}>
                    {currentProbability.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">Threat Level</div>
                </div>
              </div>

              {/* Custom SVG Chart */}
              <div className="relative w-full h-[300px] border-l border-b border-white/20">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                  {/* Grid lines */}
                  {[0, 25, 50, 75, 100].map(val => (
                    <g key={val}>
                      <line 
                        x1="0" y1={chartHeight - (val/100)*chartHeight} 
                        x2={chartWidth} y2={chartHeight - (val/100)*chartHeight} 
                        stroke="rgba(255,255,255,0.05)" strokeWidth="1" 
                      />
                      <text 
                        x="-10" y={chartHeight - (val/100)*chartHeight + 4} 
                        fill="rgba(255,255,255,0.3)" fontSize="12" fontFamily="monospace" textAnchor="end"
                      >
                        {val}
                      </text>
                    </g>
                  ))}
                  
                  {/* Danger Zone Background */}
                  <rect x="0" y="0" width={chartWidth} height={chartHeight * 0.25} fill="rgba(239, 68, 68, 0.05)" />
                  
                  {/* Data Line */}
                  <polyline
                    points={points}
                    fill="none"
                    stroke={isHighRisk ? "#ef4444" : "#f97316"}
                    strokeWidth="3"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  
                  {/* Area under line */}
                  <polygon
                    points={`0,${chartHeight} ${points} ${chartWidth},${chartHeight}`}
                    fill={`url(#gradient-${isHighRisk ? 'red' : 'orange'})`}
                    opacity="0.2"
                  />

                  <defs>
                    <linearGradient id="gradient-red" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                    <linearGradient id="gradient-orange" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f97316" />
                      <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                </svg>
                
                {/* Scanning line animation */}
                <motion.div 
                  className="absolute top-0 bottom-0 w-[2px] bg-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.8)]"
                  animate={{ left: ['0%', '100%', '0%'] }}
                  transition={{ duration: 8, ease: "linear", repeat: Infinity }}
                />
              </div>
            </div>

            {/* Intel Photos */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { seed: 'radar', label: 'RADAR SCAN' },
                { seed: 'satellite', label: 'SAT IMAGERY' },
                { seed: 'conflict', label: 'GROUND INTEL' },
                { seed: 'military', label: 'ASSET TRACKING' }
              ].map((img, idx) => (
                <div key={idx} className="relative group overflow-hidden rounded-lg border border-white/10 bg-black aspect-video">
                  <img 
                    src={`https://picsum.photos/seed/${img.seed}/400/300?grayscale`} 
                    alt={img.label}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500 mix-blend-luminosity"
                  />
                  {/* Scanline overlay */}
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] pointer-events-none"></div>
                  <div className="absolute bottom-2 left-2 text-[10px] font-mono bg-black/80 px-1.5 py-0.5 text-red-400 border border-red-500/30">
                    {img.label}
                  </div>
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                </div>
              ))}
            </div>

          </div>

          {/* Right Column: Trading & Voting */}
          <div className="flex flex-col gap-6">
            
            {/* Trading Panel */}
            <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6 relative">
              <div className="absolute top-0 right-0 p-2 opacity-20">
                <Crosshair className="w-24 h-24" />
              </div>
              
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6 border-b border-white/10 pb-2">
                Market Sentiment
              </h3>

              <div className="space-y-6 relative z-10">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-2">
                    <span className="text-red-400">ESCALATE (LONG)</span>
                    <span className="text-green-400">DE-ESCALATE (SHORT)</span>
                  </div>
                  <div className="h-4 bg-gray-900 rounded-full overflow-hidden flex">
                    <div 
                      className="h-full bg-red-500 transition-all duration-500"
                      style={{ width: `${(votes.escalate / (votes.escalate + votes.deescalate)) * 100}%` }}
                    ></div>
                    <div 
                      className="h-full bg-green-500 transition-all duration-500"
                      style={{ width: `${(votes.deescalate / (votes.escalate + votes.deescalate)) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-2 font-mono">
                    <span>{votes.escalate.toLocaleString()} votes</span>
                    <span>{votes.deescalate.toLocaleString()} votes</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                  <button 
                    onClick={() => handleVote('escalate')}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg border transition-all ${
                      userVote === 'escalate' 
                        ? 'bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                        : 'bg-black border-white/10 hover:border-red-500/50 hover:bg-red-500/10 text-gray-400'
                    }`}
                  >
                    <TrendingUp className="w-6 h-6" />
                    <span className="font-bold tracking-wider text-sm">BUY $WW3</span>
                    <span className="text-[10px] uppercase opacity-70">Predict Escalation</span>
                  </button>

                  <button 
                    onClick={() => handleVote('deescalate')}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg border transition-all ${
                      userVote === 'deescalate' 
                        ? 'bg-green-500/20 border-green-500 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.2)]' 
                        : 'bg-black border-white/10 hover:border-green-500/50 hover:bg-green-500/10 text-gray-400'
                    }`}
                  >
                    <TrendingDown className="w-6 h-6" />
                    <span className="font-bold tracking-wider text-sm">SELL $WW3</span>
                    <span className="text-[10px] uppercase opacity-70">Predict Peace</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Terminal Output */}
            <div className="bg-black border border-white/10 rounded-xl p-4 flex-1 min-h-[200px] font-mono text-xs flex flex-col">
              <div className="flex items-center gap-2 text-gray-500 border-b border-white/10 pb-2 mb-2">
                <Activity className="w-4 h-4" />
                <span>SYSTEM LOGS</span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 text-gray-400 flex flex-col justify-end">
                <div className="opacity-50">&gt; Initializing secure connection... OK</div>
                <div className="opacity-60">&gt; Fetching global sentiment data... OK</div>
                <div className="opacity-70">&gt; Calibrating probability matrix... OK</div>
                <div className="opacity-80">&gt; Listening for geopolitical events...</div>
                <div className="text-orange-400">&gt; WARNING: Elevated tension detected in sector 7G</div>
                {chartData.slice(-3).map((d, i) => (
                  <div key={d.id} className={d.value > 75 ? 'text-red-400' : 'text-green-400'}>
                    &gt; UPDATE: Index shifted to {d.value.toFixed(2)}%
                  </div>
                ))}
                <div className="animate-pulse text-white">&gt; _</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
