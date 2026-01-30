export type SignalStage = 'Leads' | 'Reached Out' | 'In Discussion' | 'Closed / Executing' | 'On Hold';

export type TeamMember = {
  id: string;
  fullName: string;
  role: string;
  xUsername: string;
  telegramUsername: string;
  linkedinUsername: string;
};

export type AdditionalLink = {
  id: string;
  title: string;
  url: string;
};

export type Project = {
  id: string;
  created_at?: string;
  name: string;
  status: SignalStage;
  position: number;
  
  website?: string;
  project_x?: string;
  discord_ticket: boolean;
  notes?: string;
  
  team_members: TeamMember[];
  additional_links: AdditionalLink[]; // <--- The new field matches your DB now
};