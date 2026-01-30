'use client';

import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, ExternalLink, Twitter, Layout, ArrowRight, Globe, Moon, Sun } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Project, SignalStage } from '@/types';
import Link from 'next/link';
import ProjectDrawer from '@/components/ProjectDrawer';
import { useTheme } from "next-themes";

const COLUMNS: { id: SignalStage; title: string }[] = [
  { id: 'Leads', title: 'Leads' },
  { id: 'Reached Out', title: 'Reached Out' },
  { id: 'In Discussion', title: 'In Discussion' },
  { id: 'Closed / Executing', title: 'Closed / Executing' },
  { id: 'On Hold', title: 'On Hold' },
];

export default function SignalBoard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setIsMounted(true);
    fetchProjects();
  }, []);

  async function fetchProjects() {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('position', { ascending: true });

    if (error) console.error('Error loading Signal:', error);
    else setProjects(data as Project[]);
    setLoading(false);
  }

  const ensureUrl = (url: string) => {
    if (!url) return '#';
    return url.startsWith('http') ? url : `https://${url}`;
  };

  async function onDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const destStage = destination.droppableId as SignalStage;
    
    const destProjects = projects
      .filter(p => p.status === destStage && p.id !== draggableId)
      .sort((a, b) => a.position - b.position);

    let newPosition: number;

    if (destProjects.length === 0) {
      newPosition = 10000;
    } else if (destination.index === 0) {
      newPosition = destProjects[0].position / 2;
    } else if (destination.index >= destProjects.length) {
      newPosition = destProjects[destProjects.length - 1].position + 10000;
    } else {
      const prev = destProjects[destination.index - 1].position;
      const next = destProjects[destination.index].position;
      newPosition = (prev + next) / 2;
    }

    const updatedProjects = projects.map((p) => {
      if (p.id === draggableId) {
        return { ...p, status: destStage, position: newPosition };
      }
      return p;
    });
    setProjects(updatedProjects.sort((a, b) => a.position - b.position));

    await supabase
      .from('projects')
      .update({ status: destStage, position: newPosition })
      .eq('id', draggableId);
  }

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#E6F5FC] dark:bg-[#05090C] text-[#0E1A22] dark:text-[#E6F5FC] font-sans flex flex-col selection:bg-[#00E0FF]/20 transition-colors duration-300">
      
      {selectedProject && (
        <ProjectDrawer 
          project={selectedProject} 
          onClose={() => setSelectedProject(null)} 
          onUpdate={fetchProjects}
        />
      )}

      {/* NAVBAR */}
      <header className="h-[72px] bg-white/80 dark:bg-[#0E1A22]/80 backdrop-blur-md px-8 border-b border-gray-200/80 dark:border-gray-800 sticky top-0 z-20 flex justify-between items-center transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#0E1A22] dark:bg-[#00E0FF] rounded-xl flex items-center justify-center text-white dark:text-[#0E1A22] shadow-lg shadow-black/5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#0E1A22] dark:text-white">Signal</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <Link href="/add">
            <button className="group flex items-center gap-2 bg-[#0E1A22] dark:bg-white text-white dark:text-[#0E1A22] pl-4 pr-5 py-2.5 rounded-full text-sm font-bold hover:shadow-xl hover:shadow-[#0E1A22]/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
              <Plus size={16} className="text-[#00E0FF] dark:text-[#00E0FF]" /> 
              <span>New Project</span>
            </button>
          </Link>
        </div>
      </header>

      {/* BOARD FRAME */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-8 overflow-hidden flex flex-col">
        
        {!loading && projects.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in zoom-in duration-500">
             <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 text-gray-400">
                <Layout size={32} />
             </div>
             <h2 className="text-2xl font-bold text-[#0E1A22] dark:text-white mb-2">Your pipeline is empty</h2>
             <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm">Add your first project to start tracking conversations and managing your deal flow.</p>
             <Link href="/add">
                <button className="flex items-center gap-2 px-8 py-3 bg-[#00E0FF] text-[#0E1A22] font-bold rounded-full hover:shadow-lg hover:shadow-[#00E0FF]/20 hover:-translate-y-0.5 transition-all">
                   Add your first project <ArrowRight size={16} />
                </button>
             </Link>
          </div>
        ) : (
          <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="flex gap-8 h-full min-w-full">
                
                {COLUMNS.map((col) => {
                  const columnProjects = projects
                    .filter((p) => p.status === col.id)
                    .sort((a, b) => a.position - b.position);

                  return (
                    <div key={col.id} className="flex-1 flex flex-col min-w-[280px]">
                      
                      {/* HEADER */}
                      <div className="flex justify-between items-center mb-5 px-1 pb-3 border-b-2 border-gray-200 dark:border-gray-800">
                        <h3 className="text-[12px] font-black text-[#0E1A22] dark:text-[#94A3B8] uppercase tracking-wide">{col.title}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${columnProjects.length > 0 ? 'bg-[#E2E8F0] dark:bg-[#1E293B] text-[#0E1A22] dark:text-white' : 'bg-gray-100 dark:bg-gray-900 text-gray-400 dark:text-gray-600'}`}>
                          {columnProjects.length}
                        </span>
                      </div>

                      <Droppable droppableId={col.id}>
                        {(provided, snapshot) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className={`flex-1 rounded-2xl transition-colors duration-300 ${
                              snapshot.isDraggingOver ? 'bg-[#F0FAFC]/80 dark:bg-[#1E293B]/50 ring-2 ring-dashed ring-[#00E0FF]/30' : ''
                            }`}
                          >
                            {columnProjects.map((project, index) => {
                              const visibleMembers = project.team_members ? project.team_members.slice(0, 3) : [];
                              const gridCols = visibleMembers.length === 1 ? 'grid-cols-1' : visibleMembers.length === 2 ? 'grid-cols-2' : 'grid-cols-3';

                              return (
                              <Draggable key={project.id} draggableId={project.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    onClick={() => setSelectedProject(project)}
                                    style={{ ...provided.draggableProps.style }}
                                    className={`
                                      mb-3 rounded-xl p-5 border
                                      group cursor-pointer select-none relative overflow-hidden
                                      transition-all duration-200 ease-out
                                      
                                      ${snapshot.isDragging 
                                        ? 'bg-white dark:bg-[#0E1A22] shadow-2xl scale-[1.02] z-50 border-[#00E0FF] ring-4 ring-[#00E0FF]/10' 
                                        : 'bg-white dark:bg-[#0E1A22] border-gray-200 dark:border-gray-800 shadow-none hover:shadow-lg hover:-translate-y-[2px] hover:border-[#00E0FF]/40 dark:hover:border-[#00E0FF]/40'
                                      }
                                    `}
                                  >
                                    
                                    {/* NAME */}
                                    <div className="mb-4">
                                      <h4 className="font-black text-[#0E1A22] dark:text-white text-[16px] leading-snug tracking-tight">
                                        {project.name}
                                      </h4>
                                    </div>

                                    {/* LINKS (FIXED OVERFLOW) */}
                                    {(project.website || project.project_x) && (
                                      <div className="flex flex-wrap items-center gap-2 mb-4">
                                        {project.website && (
                                          <a 
                                            href={ensureUrl(project.website)} 
                                            target="_blank" 
                                            title={project.website}
                                            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#F8FAFC] dark:bg-[#151F26] rounded-lg text-gray-500 dark:text-gray-400 hover:text-[#0E1A22] dark:hover:text-white hover:bg-[#F0FAFC] dark:hover:bg-[#1E293B] transition group/link border border-transparent hover:border-[#00E0FF]/20"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <Globe size={13} className="text-[#00E0FF]" />
                                            <span className="text-[11px] font-bold tracking-wide truncate max-w-[100px]">
                                              {project.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
                                            </span>
                                          </a>
                                        )}
                                        
                                        {project.project_x && (
                                          <a 
                                            href={`https://x.com/${project.project_x.replace('@', '')}`} 
                                            target="_blank" 
                                            title={`https://x.com/${project.project_x}`}
                                            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#F8FAFC] dark:bg-[#151F26] rounded-lg text-gray-500 dark:text-gray-400 hover:text-[#0E1A22] dark:hover:text-white hover:bg-[#F0FAFC] dark:hover:bg-[#1E293B] transition group/link border border-transparent hover:border-[#00E0FF]/20"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <Twitter size={13} className="text-[#00E0FF] fill-none" />
                                            {/* ADDED: max-w to match website link, ensuring both fit or truncate */}
                                            <span className="text-[11px] font-bold tracking-wide truncate max-w-[100px]">
                                              {project.project_x.startsWith('@') ? project.project_x : `@${project.project_x}`}
                                            </span>
                                          </a>
                                        )}
                                      </div>
                                    )}

                                    {/* DIVIDER */}
                                    <div className="h-px bg-gray-100 dark:bg-gray-800 w-full mb-3" />

                                    {/* TEAM */}
                                    <div className="flex flex-col">
                                      {visibleMembers.length > 0 ? (
                                        <div className={`grid gap-4 ${gridCols}`}>
                                          {visibleMembers.map((member) => (
                                            <div key={member.id} className="flex flex-col min-w-0">
                                              <span className="text-[13px] font-bold text-[#0E1A22] dark:text-[#E2E8F0] leading-tight truncate" title={member.fullName}>
                                                {member.fullName}
                                              </span>
                                              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-500 mt-0.5 truncate" title={member.role}>
                                                {member.role || 'Member'}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <span className="text-[11px] font-medium text-slate-400 italic">No contact assigned</span>
                                      )}
                                    </div>

                                  </div>
                                )}
                              </Draggable>
                            )})}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  );
                })}
              </div>
            </DragDropContext>
          </div>
        )}
      </main>
    </div>
  );
}