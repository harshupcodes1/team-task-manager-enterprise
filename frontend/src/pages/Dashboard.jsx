import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, Clock, Plus, Activity, ListTodo, TrendingUp, X, User, FileText, Calendar, GitCommit, Send, Check } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

const Dashboard = ({ filter }) => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  
  // Commits State
  const [commits, setCommits] = useState([]);
  const [newCommit, setNewCommit] = useState('');
  const [loadingCommits, setLoadingCommits] = useState(false);

  // Form State
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ title: '', description: '', priority: 'Medium', dueDate: '', project: '', assignedTo: [] });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [taskRes, analyticsRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/analytics/dashboard')
      ]);
      setTasks(taskRes.data);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter]);

  useEffect(() => {
    if (selectedTask) {
      setLoadingCommits(true);
      api.get(`/tasks/${selectedTask._id}/commits`)
        .then(res => setCommits(res.data))
        .catch(err => console.error("Failed to load commits"))
        .finally(() => setLoadingCommits(false));
    } else {
      setCommits([]);
    }
  }, [selectedTask]);

  const openCreateModal = async () => {
    try {
      const [projRes, userRes] = await Promise.all([api.get('/projects'), api.get('/auth/users')]);
      setProjects(projRes.data);
      setUsers(userRes.data);
      setFormData({ title: '', description: '', priority: 'Medium', dueDate: '', project: projRes.data[0]?._id || '', assignedTo: [] });
      setIsCreateModalOpen(true);
    } catch (err) {
      alert("Failed to load dependencies");
    }
  };

  const toggleAssignee = (userId) => {
    setFormData(prev => {
      const assigned = prev.assignedTo || [];
      if (assigned.includes(userId)) {
        return { ...prev, assignedTo: assigned.filter(id => id !== userId) };
      } else {
        return { ...prev, assignedTo: [...assigned, userId] };
      }
    });
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/tasks', formData);
      setIsCreateModalOpen(false);
      fetchData();
    } catch (err) {
      alert("Failed to create task");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
      const analyticsRes = await api.get('/analytics/dashboard');
      setAnalytics(analyticsRes.data);
      if (selectedTask && selectedTask._id === taskId) {
        setSelectedTask({ ...selectedTask, status: newStatus });
      }
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const handlePostCommit = async (e) => {
    e.preventDefault();
    if (!newCommit.trim()) return;
    try {
      const res = await api.post(`/tasks/${selectedTask._id}/commits`, { message: newCommit });
      setCommits([res.data, ...commits]);
      setNewCommit('');
    } catch (err) {
      alert("Failed to push commit");
    }
  };

  // Safe check for assignedTo array
  const isAssignedToMe = (task) => {
    if (!task.assignedTo) return false;
    if (Array.isArray(task.assignedTo)) {
      return task.assignedTo.some(u => u._id === user._id);
    }
    return task.assignedTo._id === user._id;
  };

  const displayedTasks = filter === 'mine' ? tasks.filter(t => isAssignedToMe(t)) : tasks;

  const chartData = analytics ? [
    { name: 'Pending', value: analytics.statusCounts.PENDING, color: '#F59E0B' },
    { name: 'In Progress', value: analytics.statusCounts.IN_PROGRESS, color: '#3B82F6' },
    { name: 'Completed', value: analytics.statusCounts.COMPLETED, color: '#10B981' }
  ] : [];

  if (loading) return (
    <div className="flex h-full items-center justify-center p-12 text-muted-foreground animate-pulse">
      <Activity className="animate-spin mr-2" /> Loading Workspace Data...
    </div>
  );

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-slate-50 relative">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1">
            {filter === 'mine' ? 'My Tasks' : 'Workspace Overview'}
          </h1>
          <p className="text-slate-500">
            {filter === 'mine' ? 'Tasks assigned specifically to you.' : "High-level overview of team progress and analytics."}
          </p>
        </div>
        {user.role === 'ADMIN' && (
          <button onClick={openCreateModal} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors shadow-sm font-medium">
            <Plus size={16} /> New Task
          </button>
        )}
      </div>

      {filter !== 'mine' && analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* Chart Section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col min-h-[400px]">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white shadow-md"><TrendingUp size={22} /></div>
                <div>
                  <h2 className="text-xl font-black text-slate-800 tracking-tight">Task Completion Metrics</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">Real-time status overview</p>
                </div>
              </div>
            </div>
            <div className="flex-1 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 10, left: -25, bottom: 20 }} barSize={55}>
                  <defs>
                    <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#FBBF24" stopOpacity={0.6}/>
                    </linearGradient>
                    <linearGradient id="colorInProgress" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#60A5FA" stopOpacity={0.6}/>
                    </linearGradient>
                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#34D399" stopOpacity={0.6}/>
                    </linearGradient>
                  </defs>
                  
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontWeight: 700, fontSize: 13}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontWeight: 600, fontSize: 12}} dx={-10}/>
                  <Tooltip cursor={{fill: '#F8FAFC', radius: 12}} contentStyle={{borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}} />
                  <Bar dataKey="value" radius={[12, 12, 0, 0]} animationDuration={1500} animationEasing="ease-out">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`url(#color${entry.name.replace(/\s+/g, '')})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* GitHub Style Activity Log */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col h-[400px]">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl text-indigo-700 shadow-sm"><Activity size={22} /></div>
              <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">Activity Timeline</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">Global Actions</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto pr-4 space-y-5 custom-scrollbar">
              {analytics.recentActivity.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 font-bold">No recent activity.</div>
              ) : (
                analytics.recentActivity.map(log => (
                  <div key={log._id} className="relative pl-7 border-l-2 border-indigo-100/50 pb-2 last:pb-0 group">
                    <div className="absolute w-4 h-4 rounded-full bg-white -left-[9px] top-0.5 border-[3px] border-indigo-500 shadow-sm group-hover:scale-125 transition-transform"></div>
                    <p className="text-sm font-black text-slate-900 leading-none mb-1">{log.user?.name}</p>
                    <p className="text-[13px] text-slate-500 font-medium leading-snug">{log.details}</p>
                    <p className="text-[10px] text-indigo-400 mt-1.5 uppercase tracking-widest font-bold">{new Date(log.createdAt).toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Task List */}
      <div className="flex items-center gap-3 mb-6 mt-4">
        <div className="p-2.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl text-white shadow-md"><ListTodo size={22} /></div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Action Items</h2>
      </div>
      
      <div className="space-y-3">
        {displayedTasks.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center">
            <CheckSquare className="mx-auto text-slate-300 mb-3" size={48} />
            <h3 className="text-lg font-medium text-slate-700">Inbox Zero!</h3>
            <p className="text-slate-500 mt-1">You're all caught up. Great job.</p>
          </div>
        ) : (
          displayedTasks.map((task, index) => {
            const assignees = Array.isArray(task.assignedTo) ? task.assignedTo : (task.assignedTo ? [task.assignedTo] : []);
            
            return (
              <motion.div 
                key={task._id} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * index }}
                onClick={() => setSelectedTask(task)}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer group"
              >
                <div>
                  <h3 className="text-base font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">{task.title}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mt-2">
                    <span className="flex items-center gap-1.5"><Clock size={14} className="text-slate-400" /> {new Date(task.dueDate).toLocaleDateString()}</span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded-md text-slate-600 font-medium border border-slate-200">Project: {task.project?.name || 'N/A'}</span>
                    {task.priority && (
                      <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${task.priority === 'High' ? 'bg-red-50 text-red-700 border-red-100' : task.priority === 'Medium' ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                        {task.priority} Priority
                      </span>
                    )}
                    <span className="flex items-center ml-auto">
                      <div className="flex -space-x-2">
                        {assignees.map(a => (
                          <div key={a._id} className="w-6 h-6 rounded-full border border-white bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold" title={a.name}>
                            {a.name.charAt(0).toUpperCase()}
                          </div>
                        ))}
                        {assignees.length === 0 && <span className="text-xs text-gray-400 font-medium ml-2">Unassigned</span>}
                      </div>
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                  <select 
                    className={`px-3 py-1.5 text-sm font-bold rounded-lg border outline-none cursor-pointer transition-colors shadow-sm
                      ${task.status === 'COMPLETED' ? 'bg-green-50 border-green-200 text-green-700' : 
                        task.status === 'IN_PROGRESS' ? 'bg-blue-50 border-blue-200 text-blue-700' : 
                        'bg-amber-50 border-amber-200 text-amber-700'}`}
                    value={task.status}
                    onChange={(e) => handleStatusChange(task._id, e.target.value)}
                    disabled={user.role !== 'ADMIN' && !isAssignedToMe(task)}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      {/* CREATE TASK MODAL */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-lg font-bold text-slate-900">Create New Task</h3>
                <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1"><X size={20} /></button>
              </div>
              <form onSubmit={handleCreateTask} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Task Title</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="e.g., Design Landing Page" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                  <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all min-h-[100px]" placeholder="Detailed description..."></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Due Date</label>
                    <input required type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Project</label>
                    <select required value={formData.project} onChange={e => setFormData({...formData, project: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white">
                      {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Assign Team Members</label>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-gray-100 p-2 rounded-lg">
                    {users.map(u => {
                      const isSelected = formData.assignedTo.includes(u._id);
                      return (
                        <div key={u._id} onClick={() => toggleAssignee(u._id)} className={`flex items-center gap-2 p-1.5 rounded cursor-pointer ${isSelected ? 'bg-indigo-50 border border-indigo-200' : 'bg-gray-50 border border-transparent hover:bg-gray-100'}`}>
                          <div className={`w-3 h-3 rounded flex items-center justify-center ${isSelected ? 'bg-indigo-600' : 'border border-gray-400'}`}>
                            {isSelected && <Check size={10} color="white" />}
                          </div>
                          <span className="text-xs font-bold text-gray-700 truncate">{u.name}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                  <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                  <button type="submit" disabled={submitting} className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm">
                    {submitting ? 'Creating...' : 'Create Task'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* VIEW TASK & GITHUB COMMITS MODAL */}
      <AnimatePresence>
        {selectedTask && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedTask(null)}>
            <motion.div initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.98 }} onClick={e => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col md:flex-row h-[80vh]">
              
              {/* Left Side: Task Details */}
              <div className="w-full md:w-3/5 flex flex-col border-r border-slate-100">
                <div className="px-8 py-6 border-b border-slate-100 bg-slate-50 flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 text-[10px] font-black tracking-widest uppercase rounded-md ${selectedTask.status === 'COMPLETED' ? 'bg-green-100 text-green-700 border border-green-200' : selectedTask.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>
                        {selectedTask.status}
                      </span>
                      {selectedTask.priority && (
                        <span className="px-3 py-1 text-[10px] font-black tracking-widest uppercase rounded-md border bg-slate-100 text-slate-700 border-slate-300">
                          {selectedTask.priority} PRIORITY
                        </span>
                      )}
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">{selectedTask.title}</h2>
                  </div>
                  <button onClick={() => setSelectedTask(null)} className="text-slate-400 hover:text-slate-700 bg-white shadow-sm border border-slate-200 rounded-full p-2"><X size={18} /></button>
                </div>
                
                <div className="p-8 flex-1 overflow-y-auto">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                    <FileText size={16} /> Task Objectives
                  </h4>
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-slate-800 text-base font-medium leading-relaxed whitespace-pre-wrap mb-8 shadow-inner">
                    {selectedTask.description}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-white border border-slate-100 shadow-sm p-5 rounded-xl">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                        <User size={14} /> Assignees
                      </h4>
                      <div className="flex flex-col gap-3">
                        {Array.isArray(selectedTask.assignedTo) && selectedTask.assignedTo.length > 0 ? (
                          selectedTask.assignedTo.map(u => (
                            <div key={u._id} className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold border border-indigo-200">
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-bold text-slate-800 text-sm">{u.name}</span>
                            </div>
                          ))
                        ) : (
                          <span className="font-bold text-slate-400 text-sm italic">Unassigned</span>
                        )}
                      </div>
                    </div>
                    <div className="bg-white border border-slate-100 shadow-sm p-5 rounded-xl flex flex-col gap-4">
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-1">
                          <Calendar size={14} /> Deadline
                        </h4>
                        <span className="font-bold text-slate-800 text-lg">{new Date(selectedTask.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="pt-3 border-t border-slate-100">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-1">
                          Issued By
                        </h4>
                        <span className="font-bold text-slate-700 text-sm bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 inline-block">{selectedTask.createdBy?.name || 'Unknown'}</span>
                      </div>
                      {selectedTask.status === 'COMPLETED' && (
                        <div className="pt-3 border-t border-slate-100">
                          <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                            <Check size={14} /> Completed By
                          </h4>
                          <span className="font-bold text-emerald-700 text-sm bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 inline-block">{selectedTask.completedBy?.name || 'Unknown'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: GitHub Style Commits */}
              <div className="w-full md:w-2/5 bg-slate-50 flex flex-col">
                <div className="px-6 py-4 border-b border-slate-200 bg-white">
                  <h3 className="font-black text-slate-800 flex items-center gap-2">
                    <GitCommit size={18} className="text-slate-500" /> Commit History
                  </h3>
                </div>
                
                {/* Timeline */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {loadingCommits ? (
                    <div className="text-center text-slate-400 font-bold animate-pulse text-sm mt-10">Fetching commits...</div>
                  ) : commits.length === 0 ? (
                    <div className="text-center text-slate-400 font-bold text-sm mt-10">No commits yet. Be the first to push an update!</div>
                  ) : (
                    commits.map((commit, idx) => (
                      <div key={commit._id} className="relative pl-6">
                        {/* Timeline line */}
                        {idx !== commits.length - 1 && (
                          <div className="absolute left-[7px] top-6 bottom-[-24px] w-0.5 bg-slate-200"></div>
                        )}
                        {/* Timeline dot */}
                        <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-slate-100 border-[3px] border-slate-400 z-10"></div>
                        
                        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-3">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                              {commit.user?.name}
                            </span>
                            <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                              #{commit.commitHash}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-slate-700 mb-2 whitespace-pre-wrap">{commit.message}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            {new Date(commit.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Commit Input Box */}
                <div className="p-4 bg-white border-t border-slate-200">
                  <form onSubmit={handlePostCommit} className="relative">
                    <input 
                      type="text" 
                      value={newCommit}
                      onChange={e => setNewCommit(e.target.value)}
                      placeholder="Write a commit message..." 
                      className="w-full bg-slate-50 border border-slate-300 text-sm font-medium rounded-lg pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-shadow"
                    />
                    <button 
                      type="submit" 
                      disabled={!newCommit.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-slate-900 text-white rounded-md disabled:bg-slate-300 disabled:cursor-not-allowed hover:bg-black transition-colors"
                    >
                      <Send size={16} />
                    </button>
                  </form>
                  <p className="text-center text-[10px] text-slate-400 font-bold uppercase mt-2 tracking-widest">Push to task branch</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Dashboard;
