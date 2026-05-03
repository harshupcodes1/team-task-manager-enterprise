import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import { ShieldAlert, UserCog, Trash2, Mail, Shield, ShieldOff, Folder, ListTodo, Award, Edit3, X, Check, Activity, Target, Clock, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminPanel = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [editProject, setEditProject] = useState(null);
  const [editTask, setEditTask] = useState(null);
  
  // Project Insights State
  const [viewProject, setViewProject] = useState(null);
  const [projectTasks, setProjectTasks] = useState([]);
  const [loadingInsights, setLoadingInsights] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, projectsRes, tasksRes] = await Promise.all([
          api.get('/auth/users'),
          api.get('/projects'),
          api.get('/tasks')
        ]);
        setUsers(usersRes.data);
        setProjects(projectsRes.data);
        setTasks(tasksRes.data);
      } catch (error) {
        console.error("Failed to fetch admin data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDeleteUser = async (id, role) => {
    if (role === 'ADMIN') return alert("System Error: Cannot delete an Administrator account.");
    if (window.confirm("Are you sure you want to permanently delete this user?")) {
      try {
        await api.delete(`/auth/users/${id}`);
        setUsers(users.filter(u => u._id !== id));
      } catch (error) {
        alert("Failed to delete user.");
      }
    }
  };

  const handlePromoteUser = async (id) => {
    if (window.confirm("Are you sure you want to grant this user full Administrator privileges?")) {
      try {
        const res = await api.patch(`/auth/users/${id}/role`);
        setUsers(users.map(u => u._id === id ? { ...u, role: 'ADMIN' } : u));
      } catch (error) {
        alert("Failed to promote user.");
      }
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/projects/${editProject._id}`, editProject);
      const res = await api.get('/projects');
      setProjects(res.data);
      setEditProject(null);
    } catch (err) {
      alert('Failed to update project');
    }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/tasks/${editTask._id}`, editTask);
      const res = await api.get('/tasks');
      setTasks(res.data);
      setEditTask(null);
    } catch (err) {
      alert('Failed to update task');
    }
  };

  const toggleTaskAssignee = (userId) => {
    setEditTask(prev => {
      const assigned = prev.assignedTo || [];
      if (assigned.includes(userId)) {
        return { ...prev, assignedTo: assigned.filter(id => id !== userId) };
      } else {
        return { ...prev, assignedTo: [...assigned, userId] };
      }
    });
  };

  const toggleProjectMember = (userId) => {
    setEditProject(prev => {
      const members = prev.members || [];
      const memberIds = members.map(m => typeof m === 'object' ? m._id : m);
      if (memberIds.includes(userId)) {
        return { ...prev, members: memberIds.filter(id => id !== userId) };
      } else {
        return { ...prev, members: [...memberIds, userId] };
      }
    });
  };

  const openProjectInsights = async (project) => {
    setViewProject(project);
    setLoadingInsights(true);
    try {
      const res = await api.get(`/projects/${project._id}`);
      setProjectTasks(res.data.tasks || []);
    } catch (err) {
      alert("Failed to load project insights");
      setViewProject(null);
    } finally {
      setLoadingInsights(false);
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-12 bg-white">
        <ShieldAlert size={64} className="text-red-500 mb-6" />
        <h2 className="text-3xl font-black text-gray-900 mb-3">Access Denied</h2>
        <p className="text-gray-500 max-w-md text-center font-medium">Administrative privileges are required to access this system panel.</p>
      </div>
    );
  }

  // Calculate stats for Insights Dashboard
  const totalProjectTasks = projectTasks.length;
  const completedProjectTasks = projectTasks.filter(t => t.status === 'COMPLETED').length;
  const projectProgress = totalProjectTasks === 0 ? 0 : Math.round((completedProjectTasks / totalProjectTasks) * 100);

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-slate-50 border-l border-gray-100">
      <div className="mb-8">
        <h1 className="text-4xl font-black tracking-tight text-gray-900 mb-2">Admin Control Center</h1>
        <p className="text-gray-500 font-medium">Manage enterprise users, global permissions, projects, and tasks.</p>
      </div>

      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center"><UserCog size={24} /></div>
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Users</p>
              <h3 className="text-2xl font-black text-gray-900">{users.length}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center"><Folder size={24} /></div>
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Active Projects</p>
              <h3 className="text-2xl font-black text-gray-900">{projects.length}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center"><ListTodo size={24} /></div>
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">System Tasks</p>
              <h3 className="text-2xl font-black text-gray-900">{tasks.length}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 mb-6">
        {['users', 'projects', 'tasks'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-2 font-bold text-sm uppercase tracking-wide transition-colors border-b-2 ${activeTab === tab ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 font-medium animate-pulse">Synchronizing directory data...</div>
        ) : (
          <div className="overflow-x-auto">
            {activeTab === 'users' && (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-100">
                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Security Role</th>
                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map(u => (
                    <tr key={u._id} className="hover:bg-slate-50 transition-colors group">
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-black text-sm shadow-sm">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-gray-900">{u.name}</span>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                          <Mail size={16} className="text-gray-400" /> {u.email}
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        {u.role === 'ADMIN' ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200"><Shield size={14} /> ADMIN</span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200"><ShieldOff size={14} /> MEMBER</span>
                        )}
                      </td>
                      <td className="py-5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          {u.role !== 'ADMIN' ? (
                            <>
                              <button onClick={() => handlePromoteUser(u._id)} className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors border border-indigo-200"><Award size={14} /> PROMOTE</button>
                              <button onClick={() => handleDeleteUser(u._id, u.role)} className="flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors border border-red-200"><Trash2 size={14} /> DELETE</button>
                            </>
                          ) : <span className="text-xs font-bold text-slate-400 italic">No Actions</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'projects' && (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-100">
                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Project Name</th>
                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Members</th>
                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {projects.map(p => (
                    <tr key={p._id} onClick={() => openProjectInsights(p)} className="hover:bg-indigo-50/50 transition-colors group cursor-pointer">
                      <td className="py-5 px-6">
                        <div className="font-bold text-slate-900 text-base">{p.name}</div>
                        <div className="text-xs text-indigo-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-1">
                          <Activity size={12} /> Click to view Insights
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex -space-x-2">
                          {p.members && p.members.map(m => (
                            <div key={m._id} className="w-8 h-8 rounded-full border-2 border-white bg-slate-900 text-white flex items-center justify-center text-xs font-bold" title={m.name}>
                              {m.name.charAt(0).toUpperCase()}
                            </div>
                          ))}
                          {(!p.members || p.members.length === 0) && <span className="text-sm text-gray-400 font-medium">No members</span>}
                        </div>
                      </td>
                      <td className="py-5 px-6 text-right">
                        <button onClick={(e) => { e.stopPropagation(); setEditProject(p); }} className="flex items-center ml-auto gap-1.5 text-xs font-bold text-gray-700 bg-white border border-gray-200 shadow-sm hover:bg-gray-50 hover:text-indigo-600 px-3 py-1.5 rounded-lg transition-colors">
                          <Edit3 size={14} /> Modify Setup
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'tasks' && (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-100">
                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Task Title</th>
                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Project</th>
                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Issued By</th>
                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Completed By</th>
                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tasks.map(t => (
                    <tr key={t._id} className="hover:bg-slate-50 transition-colors group">
                      <td className="py-4 px-6 font-bold text-gray-900">{t.title}</td>
                      <td className="py-4 px-6 text-sm text-gray-500 font-medium">{t.project?.name}</td>
                      <td className="py-4 px-6">
                        <span className="inline-block bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-bold border border-slate-200">
                          {t.createdBy?.name || 'Unknown'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {t.status === 'COMPLETED' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                            <CheckCircle2 size={12} /> {t.completedBy?.name || 'Unknown'}
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-slate-400 italic">Pending Completion</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button onClick={() => setEditTask(t)} className="flex items-center ml-auto gap-1.5 text-xs font-bold text-gray-700 bg-white border border-gray-200 shadow-sm hover:bg-gray-50 hover:text-indigo-600 px-3 py-1.5 rounded-lg transition-colors">
                          <Edit3 size={14} /> Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </motion.div>

      {/* Project Insights Modal (Dashboard) */}
      <AnimatePresence>
        {viewProject && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-100 bg-slate-50 flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <Target size={28} className="text-indigo-600" /> {viewProject.name}
                  </h2>
                  <p className="text-sm font-semibold text-slate-500 mt-1">Project Insights & Execution Audit</p>
                </div>
                <button onClick={() => setViewProject(null)} className="text-slate-400 hover:text-slate-900 bg-white shadow-sm border border-slate-200 rounded-full p-2 transition-colors"><X size={20} /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                {/* Progress Overview */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
                  <div className="flex justify-between items-end mb-3">
                    <div>
                      <h3 className="text-lg font-black text-slate-800">Overall Progress</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{completedProjectTasks} of {totalProjectTasks} Tasks Completed</p>
                    </div>
                    <span className="text-3xl font-black text-indigo-600">{projectProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden border border-slate-200/60">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${projectProgress}%` }} 
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full ${projectProgress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                    ></motion.div>
                  </div>
                </div>

                {/* Tasks Audit Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-sm">Execution Breakdown</h3>
                  </div>
                  {loadingInsights ? (
                    <div className="p-12 text-center text-slate-400 font-bold animate-pulse">Loading execution data...</div>
                  ) : projectTasks.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 font-medium">No tasks have been issued for this project yet.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-white border-b border-slate-100">
                            <th className="py-3 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Task</th>
                            <th className="py-3 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                            <th className="py-3 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Issued By</th>
                            <th className="py-3 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Completed By</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {projectTasks.map(t => (
                            <tr key={t._id} className="hover:bg-slate-50/50">
                              <td className="py-4 px-6 font-bold text-slate-800 text-sm">{t.title}</td>
                              <td className="py-4 px-6">
                                <span className={`px-2 py-1 text-[10px] font-black tracking-widest uppercase rounded-md border ${t.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : t.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                  {t.status}
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                                  {t.createdBy?.name || 'Unknown'}
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                {t.status === 'COMPLETED' ? (
                                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                                    <CheckCircle2 size={14} /> {t.completedBy?.name || 'Unknown'}
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 italic">
                                    <Clock size={14} /> Incomplete
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Project Modal */}
      <AnimatePresence>
        {editProject && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-gray-900 text-lg">Modify Project Setup</h3>
                <button onClick={() => setEditProject(null)} className="text-gray-400 hover:text-gray-900"><X size={20} /></button>
              </div>
              <form onSubmit={handleUpdateProject} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Project Name</label>
                  <input type="text" value={editProject.name} onChange={e => setEditProject({...editProject, name: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Project Members</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-slate-50/50">
                    {users.map(u => {
                      const isMember = (editProject.members || []).map(m => typeof m === 'object' ? m._id : m).includes(u._id);
                      return (
                        <div key={u._id} onClick={() => toggleProjectMember(u._id)} className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors border ${isMember ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'hover:bg-white bg-transparent border-transparent'}`}>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-800 text-white text-xs flex items-center justify-center font-bold">{u.name.charAt(0)}</div>
                            <span className="text-sm font-bold text-slate-700">{u.name}</span>
                          </div>
                          {isMember && <Check size={16} className="text-indigo-600" strokeWidth={3} />}
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="flex-1 bg-indigo-600 text-white font-bold py-2.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">Save Configuration</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Task Modal */}
      <AnimatePresence>
        {editTask && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-gray-900 text-lg">Modify Task Assignees</h3>
                <button onClick={() => setEditTask(null)} className="text-gray-400 hover:text-gray-900"><X size={20} /></button>
              </div>
              <form onSubmit={handleUpdateTask} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Task Title</label>
                  <input type="text" value={editTask.title} onChange={e => setEditTask({...editTask, title: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-bold text-gray-700">Assigned To (Multiple Select)</label>
                    <button type="button" onClick={() => setEditTask({...editTask, assignedTo: users.map(u => u._id)})} className="text-xs font-black text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded">SELECT ALL</button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                    {users.map(u => {
                      const isAssigned = (editTask.assignedTo || []).map(id => typeof id === 'object' ? id._id : id).includes(u._id);
                      return (
                        <div key={u._id} onClick={() => toggleTaskAssignee(u._id)} className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all border ${isAssigned ? 'bg-indigo-50 border-indigo-200 shadow-sm text-indigo-900' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                          <div className={`w-4 h-4 rounded border flex items-center justify-center ${isAssigned ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'}`}>
                            {isAssigned && <Check size={12} strokeWidth={4} />}
                          </div>
                          <span className="text-sm font-bold truncate">{u.name}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="flex-1 bg-indigo-600 text-white font-bold py-2.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">Update Task Configuration</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminPanel;
