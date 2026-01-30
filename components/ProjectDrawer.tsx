'use client';

import { useState, useEffect } from 'react';
import { X, Globe, Twitter, Linkedin, Send, Edit2, Trash2, Save, Plus, AlertCircle } from 'lucide-react';
import { Project, TeamMember } from '@/types';
import { supabase } from '@/lib/supabase';

interface ProjectDrawerProps {
  project: Project | null;
  onClose: () => void;
  onUpdate: () => void;
}

export default function ProjectDrawer({ project, onClose, onUpdate }: ProjectDrawerProps) {
  const [localProject, setLocalProject] = useState<Project | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState<Partial<Project>>({});

  useEffect(() => {
    if (project) {
      setLocalProject(project);
      setFormData(JSON.parse(JSON.stringify(project)));
      setIsEditing(false);
      setShowDeleteConfirm(false);
    }
  }, [project]);

  if (!localProject) return null;

  const ensureUrl = (url: string | undefined) => {
    if (!url) return '#';
    return url.startsWith('http') ? url : `https://${url}`;
  };

  const confirmDelete = async () => {
    setLoading(true);
    await supabase.from('projects').delete().eq('id', localProject.id);
    onUpdate();
    onClose();
    setLoading(false);
  };

  const handleSave = async () => {
    if (!formData.name) return;
    setLoading(true);
    const { error } = await supabase
      .from('projects')
      .update({
        name: formData.name,
        website: formData.website,
        project_x: formData.project_x,
        discord_ticket: formData.discord_ticket,
        notes: formData.notes,
        team_members: formData.team_members,
        additional_links: formData.additional_links
      })
      .eq('id', localProject.id);

    if (!error) {
      setLocalProject({ ...localProject, ...formData } as Project);
      onUpdate();
      setIsEditing(false);
    }
    setLoading(false);
  };

  const hasTeam = localProject.team_members && localProject.team_members.length > 0;

  // -- RENDER --
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-[#0E1A22]/20 dark:bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white dark:bg-[#0B1116] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-transparent dark:border-gray-800">
        
        {/* DELETE MODAL */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 z-50 bg-white/95 dark:bg-[#0B1116]/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-200">
             <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4 text-red-500">
                <AlertCircle size={32} />
             </div>
             <h3 className="text-xl font-bold text-[#0E1A22] dark:text-white mb-2">Delete {localProject.name}?</h3>
             <div className="flex flex-col gap-3 w-full max-w-[260px] mt-6">
                <button onClick={confirmDelete} disabled={loading} className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl">{loading ? 'Deleting...' : 'Delete Project'}</button>
                <button onClick={() => setShowDeleteConfirm(false)} className="w-full py-3 bg-white dark:bg-transparent border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
             </div>
          </div>
        )}

        {/* HEADER */}
        <div className="flex-none px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-[#0B1116] z-10">
          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <button onClick={() => setIsEditing(true)} className="p-2 text-gray-400 hover:text-[#0E1A22] dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition"><Edit2 size={18} /></button>
                <button onClick={() => setShowDeleteConfirm(true)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"><Trash2 size={18} /></button>
              </>
            ) : (
              <button onClick={handleSave} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-[#00E0FF] text-[#0E1A22] text-xs font-bold rounded-lg hover:brightness-105 transition"><Save size={14} /> Save</button>
            )}
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-600 dark:hover:text-gray-400 transition"><X size={20} /></button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-white dark:bg-[#0B1116]">
          {/* Identity */}
          <div>
            {isEditing ? (
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Project Name</label>
                  <input value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full mt-1 p-2 bg-[#F8FAFC] dark:bg-[#151F26] border border-gray-100 dark:border-gray-700 rounded text-lg font-bold text-[#0E1A22] dark:text-white focus:outline-none focus:border-[#00E0FF]" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input value={formData.website || ''} onChange={e => setFormData({...formData, website: e.target.value})} placeholder="Website" className="p-2 bg-[#F8FAFC] dark:bg-[#151F26] border border-gray-100 dark:border-gray-700 rounded text-sm text-[#0E1A22] dark:text-gray-300" />
                  <input value={formData.project_x || ''} onChange={e => setFormData({...formData, project_x: e.target.value})} placeholder="X Handle" className="p-2 bg-[#F8FAFC] dark:bg-[#151F26] border border-gray-100 dark:border-gray-700 rounded text-sm text-[#0E1A22] dark:text-gray-300" />
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-3xl font-bold text-[#0E1A22] dark:text-white mb-2">{localProject.name}</h2>
                <div className="flex gap-4">
                  {/* CHANGED: Replaced "Link" text with domain name logic */}
                  {localProject.website && (
                    <a href={ensureUrl(localProject.website)} target="_blank" className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-[#00E0FF]">
                      <Globe size={14} /> {localProject.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
                    </a>
                  )}
                  {localProject.project_x && (
                    <a href={`https://x.com/${localProject.project_x.replace('@', '')}`} target="_blank" className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-[#00E0FF]">
                      <Twitter size={14} /> {localProject.project_x}
                    </a>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Contact */}
          {(isEditing || hasTeam) && (
            <div>
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Contact & Outreach</h3>
              <div className="space-y-3">
                {(formData.team_members || []).map((member) => (
                  <div key={member.id} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-[#F8FAFC] dark:bg-[#151F26]">
                    {isEditing ? (
                       <div className="space-y-3">
                         <div className="grid grid-cols-2 gap-3">
                            <input value={member.fullName} onChange={(e) => {
                               const updated = formData.team_members?.map(m => m.id === member.id ? {...m, fullName: e.target.value} : m);
                               setFormData({...formData, team_members: updated});
                            }} className="bg-white dark:bg-[#0B1116] border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-sm text-[#0E1A22] dark:text-white" placeholder="Name" />
                            <input value={member.role} onChange={(e) => {
                               const updated = formData.team_members?.map(m => m.id === member.id ? {...m, role: e.target.value} : m);
                               setFormData({...formData, team_members: updated});
                            }} className="bg-white dark:bg-[#0B1116] border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-sm text-[#0E1A22] dark:text-white" placeholder="Role" />
                         </div>
                         <div className="grid grid-cols-3 gap-2">
                           <input value={member.xUsername} onChange={(e) => {
                              const updated = formData.team_members?.map(m => m.id === member.id ? {...m, xUsername: e.target.value} : m);
                              setFormData({...formData, team_members: updated});
                           }} placeholder="X" className="bg-white dark:bg-[#0B1116] border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-xs" />
                           <input value={member.telegramUsername} onChange={(e) => {
                              const updated = formData.team_members?.map(m => m.id === member.id ? {...m, telegramUsername: e.target.value} : m);
                              setFormData({...formData, team_members: updated});
                           }} placeholder="TG" className="bg-white dark:bg-[#0B1116] border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-xs" />
                           <input value={member.linkedinUsername} onChange={(e) => {
                              const updated = formData.team_members?.map(m => m.id === member.id ? {...m, linkedinUsername: e.target.value} : m);
                              setFormData({...formData, team_members: updated});
                           }} placeholder="IN" className="bg-white dark:bg-[#0B1116] border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-xs" />
                         </div>
                       </div>
                    ) : (
                       <div className="flex justify-between items-center">
                          <div>
                             <p className="text-sm font-bold text-[#0E1A22] dark:text-white">{member.fullName}</p>
                             <p className="text-xs text-gray-400">{member.role}</p>
                          </div>
                          {/* ADDED: Restored social icons display */}
                          <div className="flex gap-2 opacity-60 hover:opacity-100 transition">
                            {member.xUsername && <a href={`https://x.com/${member.xUsername.replace('@', '')}`} target="_blank" className="p-1.5 bg-white dark:bg-[#0B1116] rounded-md text-gray-400 hover:text-[#00E0FF] transition"><Twitter size={12} /></a>}
                            {member.telegramUsername && <a href={`https://t.me/${member.telegramUsername.replace('@', '')}`} target="_blank" className="p-1.5 bg-white dark:bg-[#0B1116] rounded-md text-gray-400 hover:text-[#00E0FF] transition"><Send size={12} /></a>}
                            {member.linkedinUsername && <a href={`https://linkedin.com/in/${member.linkedinUsername}`} target="_blank" className="p-1.5 bg-white dark:bg-[#0B1116] rounded-md text-gray-400 hover:text-[#00E0FF] transition"><Linkedin size={12} /></a>}
                          </div>
                       </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. DISCORD */}
          <div className="flex justify-between items-center py-4 border-t border-b border-gray-50 dark:border-gray-800">
             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Discord Ticket Available</span>
             {isEditing ? (
               <div className="flex bg-gray-100 dark:bg-[#151F26] rounded p-1">
                 <button onClick={() => setFormData({...formData, discord_ticket: true})} className={`px-3 py-1 text-xs font-bold rounded ${formData.discord_ticket ? 'bg-white dark:bg-[#0E1A22] shadow text-[#00E0FF]' : 'text-gray-400'}`}>YES</button>
                 <button onClick={() => setFormData({...formData, discord_ticket: false})} className={`px-3 py-1 text-xs font-bold rounded ${!formData.discord_ticket ? 'bg-white dark:bg-[#0E1A22] shadow text-gray-800 dark:text-white' : 'text-gray-400'}`}>NO</button>
               </div>
             ) : (
               <span className={`text-xs font-bold px-3 py-1 rounded-full ${localProject.discord_ticket ? 'bg-[#00E0FF]/10 text-[#00E0FF]' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                  {localProject.discord_ticket ? 'YES' : 'NO'}
               </span>
             )}
          </div>

          {/* 4. NOTES */}
          <div>
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Notes</h3>
            {isEditing ? (
              <textarea 
                value={formData.notes || ''} 
                onChange={e => setFormData({...formData, notes: e.target.value})}
                className="w-full h-32 p-3 bg-yellow-50/50 dark:bg-[#151F26] border border-yellow-100 dark:border-gray-700 rounded-xl text-sm text-[#92400e] dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-yellow-400 dark:focus:ring-[#00E0FF] resize-none"
                placeholder="Internal context..."
              />
            ) : (
              localProject.notes && (
                <div className="bg-[#fffbeb] dark:bg-[#151F26] text-[#92400e] dark:text-gray-300 text-sm p-4 rounded-xl leading-relaxed whitespace-pre-wrap">
                  {localProject.notes}
                </div>
              )
            )}
          </div>

        </div>
      </div>
    </div>
  );
}