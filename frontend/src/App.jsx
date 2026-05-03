import { BrowserRouter as Router, Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext, useState } from 'react';
import { LayoutDashboard, CheckSquare, Folder, Users, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import AdminPanel from './pages/AdminPanel';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Loading Workspace...</div>;
  return user ? children : <Navigate to="/login" />;
};

const Topbar = () => {
  const { user } = useContext(AuthContext);
  const [showProfile, setShowProfile] = useState(false);
  
  return (
    <>
      <div className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex justify-end items-center px-10 z-10 sticky top-0">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowProfile(true)}
          className="flex items-center gap-4 cursor-pointer bg-white border border-slate-100 shadow-sm hover:shadow-md px-3 py-2 rounded-2xl transition-all"
        >
          <div className="text-right">
            <div className="font-bold text-sm text-slate-900">{user.name}</div>
            <div className="text-[11px] text-indigo-600 font-bold uppercase tracking-wider">{user.role}</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center font-black text-lg shadow-inner">
            {user.name.charAt(0).toUpperCase()}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showProfile && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-black text-xl text-slate-800">User Profile</h3>
                <button onClick={() => setShowProfile(false)} className="text-slate-400 hover:text-slate-800 transition-colors">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
              <div className="p-8 flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center font-black text-4xl shadow-lg mb-6">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-2xl font-black text-slate-900">{user.name}</h2>
                <p className="text-indigo-600 font-bold tracking-widest uppercase text-sm mb-6">{user.role}</p>
                
                <div className="w-full space-y-3">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Corporate Email</p>
                    <p className="font-semibold text-slate-800">{user.email}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">System Account ID</p>
                    <p className="font-mono text-sm font-semibold text-slate-600 bg-slate-200/50 px-2 py-1 rounded inline-block">{user._id || user.id}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Company Level</p>
                      <p className="font-semibold text-slate-800">Enterprise Access Tier</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <CheckSquare size={16} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const SidebarLayout = ({ children }) => {
  const { logout, user } = useContext(AuthContext);
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <aside className="w-72 bg-white border-r border-slate-100 flex flex-col z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="h-20 flex items-center gap-3 px-8 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center text-white shadow-md">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
          </div>
          <span className="font-black text-2xl tracking-tight text-slate-900">TeamManager</span>
        </div>
        
        <div className="px-6 mt-8 text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Main Menu</div>
        <nav className="flex flex-col gap-2 px-4 flex-1">
          <NavLink to="/dashboard" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`} end><LayoutDashboard size={20} /> Dashboard</NavLink>
          <NavLink to="/dashboard/tasks" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}><CheckSquare size={20} /> My Tasks</NavLink>
          <NavLink to="/dashboard/projects" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}><Folder size={20} /> Projects</NavLink>
          
          {user?.role === 'ADMIN' && (
            <>
              <div className="px-2 text-xs font-black text-slate-400 uppercase tracking-widest mt-8 mb-4">Administration</div>
              <NavLink to="/dashboard/admin" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive ? 'bg-amber-50 text-amber-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}><Users size={20} /> Team & Roles</NavLink>
            </>
          )}
        </nav>
        
        <div className="p-6 bg-slate-50/50 mt-auto">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={logout} 
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all font-bold shadow-sm mb-6"
          >
            <LogOut size={18} /> Sign Out
          </motion.button>
          
          <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-5 text-center text-white shadow-lg relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="relative z-10">
              <p className="text-[10px] uppercase tracking-widest font-bold text-indigo-200 mb-1">Engineered By</p>
              <h4 className="text-lg font-black tracking-tight group-hover:scale-105 transition-transform">Harsh Upadhyay</h4>
            </div>
            <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white opacity-10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
          </div>
        </div>
      </aside>
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50/50">
        <Topbar />
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          
          <Route path="/dashboard" element={<PrivateRoute><SidebarLayout><Dashboard filter="all" /></SidebarLayout></PrivateRoute>} />
          <Route path="/dashboard/tasks" element={<PrivateRoute><SidebarLayout><Dashboard filter="mine" /></SidebarLayout></PrivateRoute>} />
          <Route path="/dashboard/projects" element={<PrivateRoute><SidebarLayout><Projects /></SidebarLayout></PrivateRoute>} />
          <Route path="/dashboard/admin" element={<PrivateRoute><SidebarLayout><AdminPanel /></SidebarLayout></PrivateRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
