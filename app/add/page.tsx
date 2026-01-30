'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { X, Plus, Trash2, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import { TeamMember, AdditionalLink } from '@/types';

export default function AddProject() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [projectX, setProjectX] = useState('');
  const [discordTicket, setDiscordTicket] = useState(false);
  const [notes, setNotes] = useState('');
  
  // Dynamic Lists
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [additionalLinks, setAdditionalLinks] = useState<AdditionalLink[]>([]);
  
  // -- TEAM HANDLERS --
  const addTeamMember = () => {
    setTeamMembers([...teamMembers, { id: crypto.randomUUID(), fullName: '', role: '', xUsername: '', telegramUsername: '', linkedinUsername: '' }]);
  };
  const updateTeamMember = (id: string, field: keyof TeamMember, value: string) => {
    setTeamMembers(teamMembers.map(m => m.id === id ? { ...m, [field]: value } : m));
  };
  const removeTeamMember = (id: string) => {
    setTeamMembers(teamMembers.filter(m => m.id !== id));
  };

  // -- LINK HANDLERS --
  const addLink = () => {
    setAdditionalLinks([...additionalLinks, { id: crypto.randomUUID(), title: '', url: '' }]);
  };
  const updateLink = (id: string, field: keyof AdditionalLink, value: string) => {
    setAdditionalLinks(additionalLinks.map(l => l.id === id ? { ...l, [field]: value } : l));
  };
  const removeLink = (id: string) => {
    setAdditionalLinks(additionalLinks.filter(l => l.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('projects').insert([{
      name,
      website: website || null,
      project_x: projectX || null,
      discord_ticket: discordTicket,
      notes: notes || null,
      team_members: teamMembers,
      additional_links: additionalLinks,
      status: 'Leads'
    }]);

    if (error) {
      alert('Error creating project: ' + error.message);
    } else {
      router.push('/');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-[#0E1A22]/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#0B1116] w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-start bg-white dark:bg-[#0B1116]">
          <h2 className="text-xl font-bold text-[#0E1A22] dark:text-white">Add Project</h2>
          <Link href="/">
            <button className="text-gray-300 hover:text-gray-500 dark:hover:text-gray-400 transition"><X size={20} /></button>
          </Link>
        </div>

        {/* Form Body */}
        <div className="p-8 overflow-y-auto custom-scrollbar">
          <form id="add-project-form" onSubmit={handleSubmit} className="space-y-8">
            
            {/* 1. Name */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">1. Project Name <span className="text-red-400">*</span></label>
              <input required autoFocus value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#151F26] border border-gray-100 dark:border-gray-700 rounded-lg px-4 py-3 text-sm text-[#0E1A22] dark:text-white placeholder-gray-300 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00E0FF]/20 focus:border-[#00E0FF] transition" placeholder="Project name" />
            </div>

            {/* 2 & 3. Web & X */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">2. Website</label>
                <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-300 dark:text-gray-500">🌐</span>
                    <input value={website} onChange={(e) => setWebsite(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#151F26] border border-gray-100 dark:border-gray-700 rounded-lg pl-10 pr-4 py-3 text-sm text-[#0E1A22] dark:text-white placeholder-gray-300 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00E0FF]/20 focus:border-[#00E0FF] transition" placeholder="https://..." />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">3. Project X Account</label>
                <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-300 dark:text-gray-500">@</span>
                    <input value={projectX} onChange={(e) => setProjectX(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#151F26] border border-gray-100 dark:border-gray-700 rounded-lg pl-10 pr-4 py-3 text-sm text-[#0E1A22] dark:text-white placeholder-gray-300 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00E0FF]/20 focus:border-[#00E0FF] transition" placeholder="handle" />
                </div>
              </div>
            </div>

            {/* 4. Team Members */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">4. Team Members</label>
              <div className="space-y-4 mb-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="bg-white dark:bg-[#151F26] border border-gray-100 dark:border-gray-700 rounded-xl p-5 shadow-sm relative group hover:border-gray-200 dark:hover:border-gray-600 transition">
                    <button type="button" onClick={() => removeTeamMember(member.id)} className="absolute top-4 right-4 text-gray-200 hover:text-red-400 transition"><X size={16} /></button>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                         <label className="block text-[9px] font-bold text-gray-300 dark:text-gray-500 uppercase mb-1">Full Name</label>
                         <input value={member.fullName} onChange={(e) => updateTeamMember(member.id, 'fullName', e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#0B1116] border border-gray-100 dark:border-gray-700 rounded px-3 py-2 text-sm text-[#0E1A22] dark:text-white focus:outline-none focus:border-[#00E0FF]" placeholder="Name" />
                      </div>
                      <div>
                         <label className="block text-[9px] font-bold text-gray-300 dark:text-gray-500 uppercase mb-1">Role</label>
                         <input value={member.role} onChange={(e) => updateTeamMember(member.id, 'role', e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#0B1116] border border-gray-100 dark:border-gray-700 rounded px-3 py-2 text-sm text-[#0E1A22] dark:text-white focus:outline-none focus:border-[#00E0FF]" placeholder="e.g. CEO" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <input value={member.xUsername} onChange={(e) => updateTeamMember(member.id, 'xUsername', e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#0B1116] border border-gray-100 dark:border-gray-700 rounded px-3 py-2 text-xs text-[#0E1A22] dark:text-white placeholder-gray-300 dark:placeholder-gray-600 focus:outline-none focus:border-[#00E0FF]" placeholder="X (@handle)" />
                        <input value={member.telegramUsername} onChange={(e) => updateTeamMember(member.id, 'telegramUsername', e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#0B1116] border border-gray-100 dark:border-gray-700 rounded px-3 py-2 text-xs text-[#0E1A22] dark:text-white placeholder-gray-300 dark:placeholder-gray-600 focus:outline-none focus:border-[#00E0FF]" placeholder="TG (@user)" />
                        <input value={member.linkedinUsername} onChange={(e) => updateTeamMember(member.id, 'linkedinUsername', e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#0B1116] border border-gray-100 dark:border-gray-700 rounded px-3 py-2 text-xs text-[#0E1A22] dark:text-white placeholder-gray-300 dark:placeholder-gray-600 focus:outline-none focus:border-[#00E0FF]" placeholder="LinkedIn (in/user)" />
                    </div>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addTeamMember} className="w-full py-3 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-wide hover:border-[#00E0FF] hover:text-[#00E0FF] transition flex items-center justify-center gap-2 bg-[#F8FAFC]/50 dark:bg-[#151F26]/50"><Plus size={14} /> Add team member</button>
            </div>

            {/* 5. Discord */}
            <div className="bg-[#F8FAFC] dark:bg-[#151F26] rounded-xl p-5 flex justify-between items-center border border-gray-100 dark:border-gray-700">
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">5. Discord Ticket Available</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">Does the project have an official Discord ticket system?</span>
              </div>
              <div className="flex bg-white dark:bg-[#0B1116] rounded-lg p-1 border border-gray-100 dark:border-gray-700 shadow-sm">
                <button type="button" onClick={() => setDiscordTicket(true)} className={`px-5 py-1.5 rounded text-xs font-bold transition ${discordTicket ? 'bg-[#00E0FF] text-[#0E1A22]' : 'text-gray-400 hover:text-gray-600 dark:text-gray-500'}`}>Yes</button>
                <button type="button" onClick={() => setDiscordTicket(false)} className={`px-5 py-1.5 rounded text-xs font-bold transition ${!discordTicket ? 'bg-gray-100 dark:bg-gray-800 text-[#0E1A22] dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:text-gray-500'}`}>No</button>
              </div>
            </div>

            {/* 6. Notes */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">6. Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#151F26] border border-gray-100 dark:border-gray-700 rounded-lg px-4 py-3 text-sm text-[#0E1A22] dark:text-white placeholder-gray-300 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00E0FF]/20 focus:border-[#00E0FF] transition h-32 resize-none" placeholder="Internal notes, context, or deal observations." />
            </div>

            {/* 7. Additional Links (NEW) */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">7. Additional Links</label>
              <div className="space-y-3 mb-3">
                 {additionalLinks.map((link) => (
                    <div key={link.id} className="flex gap-3 items-center">
                       <input value={link.title} onChange={(e) => updateLink(link.id, 'title', e.target.value)} className="w-1/3 bg-[#F8FAFC] dark:bg-[#151F26] border border-gray-100 dark:border-gray-700 rounded-lg px-4 py-3 text-sm text-[#0E1A22] dark:text-white placeholder-gray-300 focus:outline-none focus:border-[#00E0FF]" placeholder="Link Title" />
                       <input value={link.url} onChange={(e) => updateLink(link.id, 'url', e.target.value)} className="flex-1 bg-[#F8FAFC] dark:bg-[#151F26] border border-gray-100 dark:border-gray-700 rounded-lg px-4 py-3 text-sm text-[#0E1A22] dark:text-white placeholder-gray-300 focus:outline-none focus:border-[#00E0FF]" placeholder="https://..." />
                       <button type="button" onClick={() => removeLink(link.id)} className="text-gray-300 hover:text-red-500 transition"><Trash2 size={18} /></button>
                    </div>
                 ))}
              </div>
              <button type="button" onClick={addLink} className="w-full py-3 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-wide hover:border-[#00E0FF] hover:text-[#00E0FF] transition flex items-center justify-center gap-2 bg-[#F8FAFC]/50 dark:bg-[#151F26]/50"><LinkIcon size={14} /> Add Link</button>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0B1116] flex justify-end gap-3 sticky bottom-0 z-10">
          <Link href="/">
             <button className="px-6 py-2.5 text-sm font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">Cancel</button>
          </Link>
          <button type="submit" form="add-project-form" disabled={loading} className="px-8 py-2.5 bg-[#00E0FF] text-[#0E1A22] text-sm font-bold rounded-full hover:shadow-lg hover:shadow-[#0E1A22]/20 hover:brightness-105 transition disabled:opacity-50">{loading ? 'Creating...' : 'Create Project'}</button>
        </div>

      </div>
    </div>
  );
}