// 1. The 5 Fixed Columns (Exact spelling matters!)
export type SignalStage = 
  | 'Leads' 
  | 'Reached Out' 
  | 'In Discussion' 
  | 'Closed / Executing' 
  | 'On Hold';

// 2. Team Member Structure
export type TeamMember = {
  id: string;             // A unique ID for React lists
  fullName: string;
  role: string;
  xUsername: string;      // Just the handle (e.g. "jatin")
  telegramUsername: string;
  linkedinUsername: string;
};

// 3. Additional Link Structure
export type AdditionalLink = {
  id: string;
  label: string;          // e.g. "Pitch Deck"
  url: string;
};

// 4. The Main Project Object
export type Project = {
  id: string;
  created_at: string;
  name: string;
  status: SignalStage;
  position: number;    // Must be one of the 5 stages above
  
  website: string;        // Full URL
  project_x: string;      // Username only
  
  discord_ticket: boolean;
  notes: string;
  
  team_members: TeamMember[];      // Array of people
  additional_links: AdditionalLink[]; // Array of links
};