import { useNavigate } from 'react-router-dom';
import { ArrowRight, LayoutDashboard, ShieldCheck, CheckSquare, Command, Zap, Activity, TrendingUp } from 'lucide-react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

const Landing = () => {
  const navigate = useNavigate();
  
  const { scrollY } = useScroll();
  
  // FIXED LAG: Apply a physics-based spring to smooth out the raw scroll value
  // This removes the "chipak chipak" (stuttering) feel
  const smoothScrollY = useSpring(scrollY, {
    stiffness: 60,
    damping: 20,
    mass: 0.5,
    restDelta: 0.001
  });
  
  // Smooth Parallax Layer Speeds
  const yBg = useTransform(smoothScrollY, [0, 1000], [0, 200]);
  
  // Hero Text
  const yText = useTransform(smoothScrollY, [0, 600], [0, 80]);
  const opacityText = useTransform(smoothScrollY, [0, 400], [1, 0]);
  
  // Main Mockup
  const yMainMockup = useTransform(smoothScrollY, [0, 1000], [0, -60]);
  const rotateXMockup = useTransform(smoothScrollY, [0, 1000], [10, 2]);
  
  // Floating Cards (Cleaned up distances so they don't mix into a mess)
  const yFloatingCard1 = useTransform(smoothScrollY, [0, 1000], [0, -180]); // Velocity Card (Top Right)
  const yFloatingCard2 = useTransform(smoothScrollY, [0, 1000], [0, -250]); // Tasks Card (Bottom Left)
  const yFloatingCard3 = useTransform(smoothScrollY, [0, 1000], [0, -320]); // Admin Card (Bottom Right)

  const titleWords = "Master your enterprise workflow.".split(" ");

  return (
    <div className="bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-emerald-500 selection:text-white overflow-x-hidden relative min-h-screen">
      
      {/* --- PARALLAX LAYER 0: Background --- */}
      <motion.div style={{ y: yBg }} className="absolute inset-0 z-0 h-[150vh] w-full pointer-events-none origin-top will-change-transform">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(#0f172a 1px, transparent 1px), linear-gradient(90deg, #0f172a 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        <div className="absolute top-0 inset-x-0 h-[800px] bg-gradient-to-b from-white to-transparent z-0"></div>
        {/* Ambient Glows */}
        <div className="absolute top-[-5%] right-[-5%] w-[800px] h-[800px] rounded-full bg-emerald-400 opacity-[0.12] blur-[120px] mix-blend-multiply"></div>
        <div className="absolute top-[10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-400 opacity-[0.1] blur-[100px] mix-blend-multiply"></div>
      </motion.div>

      {/* Navbar */}
      <nav className="bg-white/70 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-2xl tracking-tight text-slate-900">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-md">
              <Command size={20} strokeWidth={2.5} />
            </div>
            TeamManager
          </div>
          <button onClick={() => navigate('/login')} className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 shadow-sm px-6 py-2.5 rounded-xl font-bold transition-all text-sm flex items-center gap-2 hover:shadow-md hover:border-slate-300">
            Login <ArrowRight size={16} className="hidden sm:block" />
          </button>
        </div>
      </nav>

      {/* --- PARALLAX HERO SECTION --- */}
      <main className="w-full relative h-[100vh] min-h-[700px] flex items-center z-10">
        <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center relative h-full">
          
          {/* LEFT: Copy & CTA */}
          <motion.div style={{ y: yText, opacity: opacityText }} className="relative z-20 pt-10 lg:pt-0 will-change-transform">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-slate-600 text-xs font-bold mb-6 border border-slate-200 shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Enterprise Class SaaS V10
            </motion.div>
            
            <h1 className="text-5xl md:text-6xl lg:text-[76px] font-black tracking-tight mb-6 leading-[1.05] drop-shadow-sm flex flex-wrap gap-x-4 gap-y-2">
              {titleWords.map((word, i) => (
                <motion.span 
                  key={i} 
                  initial={{ opacity: 0, y: 40, rotateX: -90 }} 
                  animate={{ opacity: 1, y: 0, rotateX: 0 }} 
                  transition={{ delay: i * 0.15 + 0.1, type: "spring", stiffness: 120, damping: 10 }}
                  className={`inline-block origin-bottom ${i >= 2 ? 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500' : 'text-slate-900'}`}
                >
                  {word}
                </motion.span>
              ))}
            </h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-lg lg:text-xl text-slate-500 mb-10 max-w-md lg:max-w-lg leading-relaxed font-medium"
            >
              Experience smooth parallax workflows. Secure your data, analyze team velocity, and execute tasks with zero clutter.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="flex flex-col sm:flex-row items-start gap-4"
            >
              <button onClick={() => navigate('/login')} className="w-full sm:w-auto bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-xl shadow-slate-900/20 hover:-translate-y-1 whitespace-nowrap">
                Start Managing For Free
              </button>
              <button onClick={() => navigate('/login')} className="w-full sm:w-auto bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-sm flex items-center justify-center gap-2 hover:-translate-y-0.5 whitespace-nowrap">
                <Zap size={20} className="text-amber-500" /> Book a Demo
              </button>
            </motion.div>
          </motion.div>

          {/* RIGHT: Smooth Clean Parallax Mockups */}
          <div className="relative w-full h-[500px] lg:h-[600px] perspective-[1500px] hidden lg:block mt-10 lg:mt-0">
            
            {/* Base Mockup - Neatly aligned to the right */}
            <motion.div 
              style={{ y: yMainMockup, rotateX: rotateXMockup, rotateY: -10 }}
              className="absolute top-[10%] left-[5%] w-[95%] h-[75%] bg-white/70 backdrop-blur-2xl rounded-[2rem] border border-white shadow-[0_20px_60px_rgba(15,23,42,0.06)] flex overflow-hidden origin-center z-10 will-change-transform"
            >
              {/* Fake Sidebar */}
              <div className="w-48 bg-slate-50/80 border-r border-slate-100/50 p-5 flex flex-col gap-4">
                <div className="w-full h-8 bg-slate-200 rounded-xl mb-4"></div>
                <div className="w-full h-5 bg-slate-200/60 rounded-md"></div>
                <div className="w-3/4 h-5 bg-slate-200/60 rounded-md"></div>
                <div className="w-5/6 h-5 bg-emerald-100/50 text-emerald-600 rounded-md mt-4"></div>
                <div className="w-full h-5 bg-slate-200/60 rounded-md"></div>
              </div>
              {/* Fake Content */}
              <div className="flex-1 p-6 flex flex-col gap-6">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100/50">
                  <div className="w-32 h-6 bg-slate-200/80 rounded-full"></div>
                  <div className="w-8 h-8 rounded-full bg-slate-900"></div>
                </div>
                <div className="flex-1 rounded-2xl bg-slate-50/50 border border-slate-100/50"></div>
              </div>
            </motion.div>

            {/* Velocity Card - Top Right, clean offset */}
            <motion.div 
              style={{ y: yFloatingCard1 }}
              className="absolute top-[-5%] right-[-5%] bg-white p-5 rounded-3xl shadow-[0_30px_60px_rgba(15,23,42,0.12)] border border-slate-100 w-72 z-20 flex flex-col gap-4 will-change-transform"
            >
              <div className="flex justify-between items-center">
                <p className="text-sm font-black text-slate-800">Team Velocity</p>
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                  <TrendingUp size={16} className="text-emerald-500" />
                </div>
              </div>
              <div className="flex items-end gap-2 h-24 pt-4 border-b border-slate-100 relative">
                <div className="absolute top-1/2 w-full h-[1px] border-t border-dashed border-slate-200"></div>
                <motion.div initial={{ height: 0 }} animate={{ height: '40%' }} transition={{ duration: 1, delay: 0.5 }} className="w-full bg-blue-100 rounded-t-lg relative z-10"></motion.div>
                <motion.div initial={{ height: 0 }} animate={{ height: '70%' }} transition={{ duration: 1, delay: 0.6 }} className="w-full bg-emerald-200 rounded-t-lg relative z-10"></motion.div>
                <motion.div initial={{ height: 0 }} animate={{ height: '50%' }} transition={{ duration: 1, delay: 0.7 }} className="w-full bg-teal-300 rounded-t-lg relative z-10"></motion.div>
                <motion.div initial={{ height: 0 }} animate={{ height: '100%' }} transition={{ duration: 1, delay: 0.8 }} className="w-full bg-emerald-500 rounded-t-lg shadow-[0_10px_20px_rgba(16,185,129,0.4)] relative z-20"></motion.div>
              </div>
            </motion.div>

            {/* Tasks Done - Bottom Left, nicely overlapping the sidebar */}
            <motion.div 
              style={{ y: yFloatingCard2 }}
              className="absolute bottom-[20%] left-[-10%] bg-white p-5 rounded-3xl shadow-[0_40px_100px_rgba(15,23,42,0.15)] border border-slate-100 w-64 z-30 flex flex-col gap-4 will-change-transform"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 shrink-0">
                  <CheckSquare size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tasks Done</p>
                  <p className="text-2xl font-black text-slate-900 tracking-tight">1,204</p>
                </div>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-1">
                <motion.div initial={{ width: 0 }} animate={{ width: '75%' }} transition={{ duration: 1.5, delay: 1 }} className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"></motion.div>
              </div>
            </motion.div>

            {/* Admin Profile - Bottom Right */}
            <motion.div 
              style={{ y: yFloatingCard3 }}
              className="absolute bottom-[10%] right-[10%] bg-slate-900 p-4 rounded-2xl shadow-[0_30px_80px_rgba(15,23,42,0.4)] border border-slate-800 w-48 z-40 flex items-center gap-3 text-white will-change-transform"
            >
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 border-2 border-slate-900 flex items-center justify-center font-black text-sm shadow-inner">H</div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full"></div>
              </div>
              <div>
                <p className="text-sm font-bold tracking-wide">Harsh U.</p>
                <p className="text-[10px] text-emerald-400 font-bold tracking-widest uppercase mt-0.5">Admin Online</p>
              </div>
            </motion.div>
            
          </div>
        </div>
      </main>

      {/* --- FEATURE SECTION --- */}
      <div className="bg-white border-t border-slate-200 py-32 relative z-20 shadow-[0_-30px_80px_rgba(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="text-4xl lg:text-5xl font-black text-slate-900 mb-6"
            >
              Engineered for Velocity.
            </motion.h2>
            <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl mx-auto">Manage enterprise-scale projects without the bloat of traditional corporate software. Fluid animations and pure performance.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 0.1, type: "spring", stiffness: 50 }}
              className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-4 hover:border-emerald-200 transition-all duration-500 group"
            >
              <div className="w-16 h-16 bg-white rounded-2xl shadow-md border border-slate-200 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <LayoutDashboard className="text-emerald-600" size={30} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4">Pure Interface</h3>
              <p className="text-slate-500 font-medium leading-relaxed text-lg">No distracting themes. Just a clean, highly legible dashboard optimized for speed and daily workflows.</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 0.2, type: "spring", stiffness: 50 }}
              className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-4 hover:border-blue-200 transition-all duration-500 group"
            >
              <div className="w-16 h-16 bg-white rounded-2xl shadow-md border border-slate-200 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                <ShieldCheck className="text-blue-600" size={30} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4">Strict Security</h3>
              <p className="text-slate-500 font-medium leading-relaxed text-lg">Built-in Admin redirection, JWT validation, and secure endpoints to keep your enterprise data safe.</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 0.3, type: "spring", stiffness: 50 }}
              className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-4 hover:border-indigo-200 transition-all duration-500 group"
            >
              <div className="w-16 h-16 bg-white rounded-2xl shadow-md border border-slate-200 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <Activity className="text-indigo-600" size={30} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4">Automated Logs</h3>
              <p className="text-slate-500 font-medium leading-relaxed text-lg">Every action is tracked. Monitor task completions and status changes via the interactive timeline.</p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Modern Footer */}
      <footer className="py-16 bg-white border-t border-slate-200 flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white mb-6 shadow-xl">
          <Command size={24} strokeWidth={2.5} />
        </div>
        <p className="text-slate-600 font-black tracking-wide text-lg">&copy; {new Date().getFullYear()} TeamManager Inc.</p>
        <p className="text-slate-400 text-sm mt-2 font-bold tracking-widest uppercase">Engineered for productivity</p>
      </footer>

    </div>
  );
};

export default Landing;
