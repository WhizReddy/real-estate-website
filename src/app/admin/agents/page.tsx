"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Plus, Edit, Trash2, Mail, Phone, Shield, UserCheck } from "lucide-react";
import { handleApiResponse, logError } from "@/lib/error-handler";
import ErrorBoundary from "@/components/ErrorBoundary";

interface Agent {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'ADMIN' | 'AGENT';
  createdAt: string;
  propertiesCount?: number;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const router = useRouter();

  const [newAgent, setNewAgent] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'AGENT' as 'ADMIN' | 'AGENT'
  });

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem("adminSession");
    if (!isAuthenticated) {
      router.push("/admin/login");
      return;
    }

    loadAgents();
  }, [router]);

  const loadAgents = async () => {
    try {
      const response = await fetch('/api/agents');
      const result = await response.json();

      const { success, data, errorMessage } = handleApiResponse(result);
      
      if (!success) {
        logError('loadAgents', result.error, { endpoint: '/api/agents' });
        alert(errorMessage);
        return;
      }

      setAgents((data as Agent[]) || []);
    } catch (error) {
      logError('loadAgents', error, { endpoint: '/api/agents' });
      alert('Gabim në rrjet. Ju lutem kontrolloni lidhjen dhe rifreskoni faqen.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Prepare data for API
      const agentData = {
        name: newAgent.name,
        email: newAgent.email,
        phone: newAgent.phone || '',
        password: newAgent.password,
        role: newAgent.role,
      };

      // Call the API to create agent
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentData),
      });

      const result = await response.json();

      const { success, data, errorMessage } = handleApiResponse(result);
      
      if (!success) {
        logError('handleAddAgent', result.error, { endpoint: '/api/agents', method: 'POST' });
        alert(errorMessage);
        return;
      }

      // Add the new agent to the list
      setAgents(prev => [...prev, data as Agent]);
      setNewAgent({ name: '', email: '', phone: '', password: '', role: 'AGENT' });
      setShowAddForm(false);
      
      alert('Agjenti u shtua me sukses!');
    } catch (error) {
      console.error('Error adding agent:', error);
      alert('Gabim në rrjet. Ju lutem kontrolloni lidhjen dhe provoni përsëri.');
    }
  };

  const handleDeleteAgent = async (id: string) => {
    try {
      const response = await fetch(`/api/agents/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      const { success, errorMessage } = handleApiResponse(result);
      
      if (!success) {
        logError('handleDeleteAgent', result.error, { endpoint: `/api/agents/${id}`, method: 'DELETE' });
        alert(errorMessage);
        return;
      }

      // Remove agent from local state
      setAgents(prev => prev.filter(agent => agent.id !== id));
      setDeleteConfirm(null);
      alert('Agjenti u fshi me sukses!');
    } catch (error) {
      logError('handleDeleteAgent', error, { endpoint: `/api/agents/${id}`, method: 'DELETE' });
      alert('Gabim në rrjet. Ju lutem kontrolloni lidhjen dhe provoni përsëri.');
    }
  };

  const getRoleLabel = (role: string) => {
    return role === 'ADMIN' ? 'Administrator' : 'Agjent';
  };

  const getRoleBadgeColor = (role: string) => {
    return role === 'ADMIN' 
      ? 'bg-purple-100 text-purple-800 border-purple-200'
      : 'bg-blue-100 text-blue-800 border-blue-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                href="/admin/dashboard"
                className="flex items-center text-blue-100 hover:text-white mr-6 transition-colors duration-200"
              >
                <span className="font-medium">← Kthehu</span>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white">Menaxhimi i Agjentëve</h1>
                <p className="text-blue-200">Menaxho agjentët dhe të drejtat e tyre</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus className="h-5 w-5 mr-2" />
              Shto Agjent të Ri
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Totali i Agjentëve</p>
                <p className="text-2xl font-semibold text-gray-900">{agents.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Administratorë</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {agents.filter(a => a.role === 'ADMIN').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Agjentë Aktivë</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {agents.filter(a => a.role === 'AGENT').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Agents Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Lista e Agjentëve</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agjenti
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kontakti
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Roli
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pasuritë
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Veprime
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {agents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {agent.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {agent.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        {agent.email}
                      </div>
                      {agent.phone && (
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          {agent.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getRoleBadgeColor(agent.role)}`}>
                        {getRoleLabel(agent.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {agent.propertiesCount || 0} pasuri
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-900"
                          title="Ndrysho"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(agent.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Fshi"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Agent Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Shto Agjent të Ri</h3>
              <form onSubmit={handleAddAgent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emri i plotë *
                  </label>
                  <input
                    type="text"
                    required
                    value={newAgent.name}
                    onChange={(e) => setNewAgent({...newAgent, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Emri dhe mbiemri"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={newAgent.email}
                    onChange={(e) => setNewAgent({...newAgent, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="email@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefoni
                  </label>
                  <input
                    type="tel"
                    value={newAgent.phone}
                    onChange={(e) => setNewAgent({...newAgent, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+355 69 123 4567"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fjalëkalimi *
                  </label>
                  <input
                    type="password"
                    required
                    value={newAgent.password}
                    onChange={(e) => setNewAgent({...newAgent, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Fjalëkalimi i sigurt"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Roli *
                  </label>
                  <select
                    value={newAgent.role}
                    onChange={(e) => setNewAgent({...newAgent, role: e.target.value as 'ADMIN' | 'AGENT'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="AGENT">Agjent</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>
                
                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                  >
                    Anulo
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Shto Agjentin
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900">Konfirmo Fshirjen</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  A jeni të sigurt që doni të fshini këtë agjent? Ky veprim nuk mund të kthehet.
                </p>
              </div>
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                >
                  Anulo
                </button>
                <button
                  onClick={() => handleDeleteAgent(deleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Fshi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </ErrorBoundary>
  );
}