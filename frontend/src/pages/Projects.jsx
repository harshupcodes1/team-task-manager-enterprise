import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, Plus, Trash2, ShieldAlert, X } from 'lucide-react';

const Projects = () => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (error) {
      console.error("Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/projects', formData);
      setIsCreateModalOpen(false);
      setFormData({ name: '', description: '' });
      fetchProjects();
    } catch (err) {
      alert("Failed to create project");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await api.delete(`/projects/${id}`);
        setProjects(projects.filter(p => p._id !== id));
      } catch (error) {
        alert("Failed to delete project");
      }
    }
  };

  if (loading) return <div className="flex h-full items-center justify-center p-12 text-slate-500 animate-pulse">Loading Projects...</div>;

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-slate-50 relative">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1">Projects</h1>
          <p className="text-slate-500">Manage your team's initiatives and folders.</p>
        </div>
        {user.role === 'ADMIN' && (
          <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors shadow-sm font-medium">
            <Plus size={16} /> New Project
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 ? (
          <div className="col-span-full bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center">
            <Folder className="mx-auto text-slate-300 mb-3" size={48} />
            <h3 className="text-lg font-medium text-slate-700">No Projects Found</h3>
            <p className="text-slate-500 mt-1">Get started by creating a new project.</p>
          </div>
        ) : (
          projects.map((project, index) => (
            <motion.div 
              key={project._id}
              onClick={() => setSelectedProject(project)}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * index }}
              className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 cursor-pointer transition-all group relative"
            >
              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center mb-4 text-indigo-600 border border-indigo-100">
                <Folder size={20} />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">{project.name}</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">{project.description}</p>
              
              {user.role === 'ADMIN' && (
                <button 
                  onClick={() => handleDelete(project._id)}
                  className="absolute top-4 right-4 text-slate-300 hover:text-red-500 p-2 rounded-md hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* CREATE PROJECT MODAL */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-lg font-bold text-slate-900">Create New Project</h3>
                <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1"><X size={20} /></button>
              </div>
              <form onSubmit={handleCreateProject} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Project Name</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="e.g., Marketing Q4 Campaign" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                  <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all min-h-[100px]" placeholder="Brief description of the project goals..."></textarea>
                </div>
                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                  <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                  <button type="submit" disabled={submitting} className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm disabled:opacity-50">
                    {submitting ? 'Creating...' : 'Create Project'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* VIEW PROJECT MODAL */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-start bg-slate-50">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                    <Folder className="text-indigo-600" size={24} /> {selectedProject.name}
                  </h3>
                  <p className="text-sm font-semibold text-slate-500 mt-1">Project Overview & Company Details</p>
                </div>
                <button onClick={() => setSelectedProject(null)} className="text-slate-400 hover:text-slate-800 p-2 bg-white rounded-full shadow-sm border border-slate-200"><X size={20} /></button>
              </div>
              <div className="p-8 bg-white flex flex-col gap-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Project Description</h4>
                  <p className="text-slate-700 text-lg leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">{selectedProject.description}</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <ShieldAlert size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Company Access Level</h4>
                      <p className="font-bold text-slate-800">Tier-1 Enterprise</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Status</h4>
                      <p className="font-bold text-slate-800 text-emerald-700">Active</p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button onClick={() => setSelectedProject(null)} className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors">Close View</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Projects;
