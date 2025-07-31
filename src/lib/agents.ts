import { Agent } from '@/types';
import sampleAgents from '@/data/sample-agents.json';

const API_BASE_URL = typeof window !== 'undefined' 
  ? '' // Client-side: use relative URLs
  : process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : process.env.NEXTAUTH_URL || 'http://localhost:3000'; // Server-side: use full URL

export async function getAgents(): Promise<Agent[]> {
  try {
    // Try to fetch from API first
    const response = await fetch(`${API_BASE_URL}/api/agents`, {
      cache: 'no-store', // Always get fresh data
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.agents || [];
    } else {
      console.warn('Agents API response not OK:', response.status, response.statusText);
    }
  } catch (error) {
    console.warn('Failed to fetch agents from API, falling back to sample data:', error);
  }
  
  // Fallback to sample agents
  return sampleAgents as Agent[];
}

export async function getAgent(id: string): Promise<Agent | null> {
  try {
    // Try to fetch from API first
    const response = await fetch(`${API_BASE_URL}/api/agents/${id}`, {
      cache: 'no-store',
    });
    
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('Failed to fetch agent from API:', error);
  }
  
  // Fallback to sample data
  const agents = sampleAgents as Agent[];
  return agents.find(agent => agent.id === id) || null;
}

export async function getAgentsBySpecialty(specialty: string): Promise<Agent[]> {
  const agents = await getAgents();
  return agents.filter(agent => 
    agent.specialties.some(s => 
      s.toLowerCase().includes(specialty.toLowerCase())
    )
  );
}

export async function searchAgents(query: string): Promise<Agent[]> {
  const agents = await getAgents();
  const searchTerm = query.toLowerCase();
  
  return agents.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm) ||
    agent.bio?.toLowerCase().includes(searchTerm) ||
    agent.specialties.some(specialty => 
      specialty.toLowerCase().includes(searchTerm)
    )
  );
}