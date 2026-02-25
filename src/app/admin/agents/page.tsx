"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Plus, Edit, Trash2, Mail, Phone, Shield, UserCheck, MoreVertical } from "lucide-react";
import { handleApiResponse, logError } from "@/lib/error-handler";
import ErrorBoundary from "@/components/ErrorBoundary";

// Type definition for an agent.  This matches the shape returned by the
// agents API, including the `propertiesCount` field which we added on
// the server side.  The `phone` field is optional because it is not
// currently stored in the database; it may be populated from user input.
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check authentication; redirect to login if not authenticated
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
      const agentData = {
        name: newAgent.name,
        email: newAgent.email,
        phone: newAgent.phone || '',
        password: newAgent.password,
        role: newAgent.role,
      };
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agentData),
      });
      const result = await response.json();
      const { success, data, errorMessage } = handleApiResponse(result);
      if (!success) {
        logError('handleAddAgent', result.error, { endpoint: '/api/agents', method: 'POST' });
        alert(errorMessage);
        return;
      }
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
      const response = await fetch(`/api/agents/${id}`, { method: 'DELETE' });
      const result = await response.json();
      const { success, errorMessage } = handleApiResponse(result);
      if (!success) {
        logError('handleDeleteAgent', result.error, { endpoint: `/api/agents/${id}`, method: 'DELETE' });
        alert(errorMessage);
        return;
      }
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
      <div className="min-h-full bg-[var(--background)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-full bg-[var(--background)] overflow-x-hidden">
        {/* Header */}
        <header className="bg-white shadow-xl sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-4 relative pt-[env(safe-area-inset-top)]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center">
                <Link
                  href="/admin/dashboard"
                  className="flex items-center text-slate-600 hover:text-blue-600 mr-6 transition-colors duration-200"
                >
                  <span className="font-medium">← Kthehu</span>
                </Link>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Menaxhimi i Agjentëve</h1>
                  <p className="text-blue-600">Menaxho agjentët dhe të drejtat e tyre</p>
                </div>
              </div>
              {/* Desktop add button */}
              <div className="hidden sm:block">
                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Shto Agjent të Ri
                </button>
              </div>
              {/* Mobile kebab */}
              <div className="sm:hidden absolute right-4 top-2">
                <button
                  aria-label="Hap menunë"
                  onClick={() => setMobileMenuOpen(v => !v)}
                  className="inline-flex items-center justify-center p-2 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100"
                >
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            </div>
            {mobileMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMobileMenuOpen(false)} aria-hidden="true" />
                <div className="absolute right-4 top-12 z-50 w-56 rounded-lg border border-gray-200  bg-[var(--background)]/95 text-[var(--foreground)] shadow-xl backdrop-blur">
                  <div className="py-1">
                    <button
                      onClick={() => { setMobileMenuOpen(false); setShowAddForm(true); }}
                      className="w-full text-left flex items-center px-3 py-2 hover:bg-slate-50 :bg-slate-800/50 rounded-md"
                    >
                      <Plus className="h-4 w-4 mr-2 text-blue-700" />
                      Shto Agjent të Ri
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card p-6 border-none">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600 ">Totali i Agjentëve</p>
                  <p className="text-2xl font-semibold text-[var(--foreground)]">{agents.length}</p>
                </div>
              </div>
            </div>
            <div className="card p-6 border-none">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600 ">Administratorë</p>
                  <p className="text-2xl font-semibold text-[var(--foreground)]">
                    {agents.filter(a => a.role === 'ADMIN').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="card p-6 border-none">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600 ">Agjentë Aktivë</p>
                  <p className="text-2xl font-semibold text-[var(--foreground)]">
                    {agents.filter(a => a.role === 'AGENT').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Agents Table */}
          <div className="card overflow-hidden border-none text-[var(--foreground)]">
            <div className="px-6 py-4 border-b border-gray-200 ">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">Lista e Agjentëve</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 ">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500  uppercase tracking-wider">
                      Agjenti
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500  uppercase tracking-wider">
                      Kontakti
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500  uppercase tracking-wider">
                      Roli
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500  uppercase tracking-wider">
                      Pasuritë
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500  uppercase tracking-wider">
                      Veprime
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[var(--background)] divide-y divide-gray-200 ">
                  {agents.map((agent) => (
                    <tr key={agent.id} className="hover:bg-slate-50 :bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="shrink-0 h-10 w-10">
                            <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-white" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-[var(--text-scale-base)] font-medium text-[var(--foreground)]">
                              {agent.name}
                            </div>
                            <div className="text-[var(--text-scale-sm)] text-slate-500 ">
                              ID: {agent.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-[var(--text-scale-base)] text-[var(--foreground)] flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-slate-400 " />
                          {agent.email}
                        </div>
                        {agent.phone && (
                          <div className="text-[var(--text-scale-sm)] text-slate-500  flex items-center mt-1">
                            <Phone className="h-4 w-4 mr-2 text-slate-400 " />
                            {agent.phone}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-[var(--text-scale-sm)] font-semibold rounded-full ${agent.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-800 '
                          : 'bg-green-100 text-green-800 '
                          }`}>
                          {getRoleLabel(agent.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[var(--text-scale-base)] text-[var(--foreground)]">
                        {/* Display the number of properties owned by this agent in a badge to align with the overall design */}
                        <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          {agent.propertiesCount ?? 0} pasuri
                        </span>
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
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border border-gray-200  w-96 shadow-lg rounded-md bg-[var(--background)] text-[var(--foreground)]">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-[var(--foreground)] mb-4">Shto Agjent të Ri</h3>
                <form onSubmit={handleAddAgent} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700  mb-1">
                      Emri i plotë *
                    </label>
                    <input
                      type="text"
                      required
                      value={newAgent.name}
                      onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Emri dhe mbiemri"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700  mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={newAgent.email}
                      onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })}
                      className="input-field"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700  mb-1">
                      Telefoni
                    </label>
                    <input
                      type="tel"
                      value={newAgent.phone}
                      onChange={(e) => setNewAgent({ ...newAgent, phone: e.target.value })}
                      className="input-field"
                      placeholder="+355 69 123 4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700  mb-1">
                      Fjalëkalimi *
                    </label>
                    <input
                      type="password"
                      required
                      value={newAgent.password}
                      onChange={(e) => setNewAgent({ ...newAgent, password: e.target.value })}
                      className="input-field"
                      placeholder="Fjalëkalimi i sigurt"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700  mb-1">
                      Roli *
                    </label>
                    <select
                      value={newAgent.role}
                      onChange={(e) => setNewAgent({ ...newAgent, role: e.target.value as 'ADMIN' | 'AGENT' })}
                      className="input-field"
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
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border border-gray-200  w-96 shadow-lg rounded-md bg-[var(--background)] text-[var(--foreground)]">
              <div className="mt-3 text-center">
                <h3 className="text-lg font-medium text-[var(--foreground)]">Konfirmo Fshirjen</h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-slate-500 ">
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