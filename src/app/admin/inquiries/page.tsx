'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ContactInquiry } from '@/types';
import { getInquiries, getProperty } from '@/lib/data';
import { formatDate } from '@/lib/utils';
import { Mail, Phone, Calendar, MessageCircle, Eye, Trash2, User, Home } from 'lucide-react';

interface InquiryWithProperty extends ContactInquiry {
  propertyTitle?: string;
  propertyPrice?: number;
}

export default function InquiriesPage() {
  const router = useRouter();
  const [inquiries, setInquiries] = useState<InquiryWithProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryWithProperty | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    let isMounted = true;

    // Check authentication
    const isAuthenticated = localStorage.getItem('adminSession');
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }

    // Load inquiries
    const loadInquiries = async () => {
      try {
        const inquiriesData = await getInquiries();

        // Enrich inquiries with property information
        const enrichedInquiries = await Promise.all(
          inquiriesData.map(async (inquiry) => {
            const property = await getProperty(inquiry.propertyId);
            return {
              ...inquiry,
              propertyTitle: property?.title,
              propertyPrice: property?.price,
            };
          })
        );

        if (isMounted) {
          // Sort by creation date (newest first)
          enrichedInquiries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setInquiries(enrichedInquiries);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error loading inquiries:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadInquiries();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleDeleteInquiry = (inquiryId: string) => {
    if (confirm('Jeni të sigurt që doni të fshini këtë pyetje?')) {
      // In a real app, this would delete from the database
      const updatedInquiries = inquiries.filter(inquiry => inquiry.id !== inquiryId);
      setInquiries(updatedInquiries);

      // Update localStorage
      localStorage.setItem('inquiries', JSON.stringify(updatedInquiries));

      if (selectedInquiry?.id === inquiryId) {
        setSelectedInquiry(null);
      }
    }
  };

  const handleViewInquiry = (inquiry: InquiryWithProperty) => {
    setSelectedInquiry(inquiry);
  };

  const filteredInquiries = filter === 'all'
    ? inquiries
    : inquiries.filter(() => {
      // For now, treat all inquiries as unread since we don't track read status
      return filter === 'unread';
    });

  if (isLoading) {
    return (
      <div className="min-h-full bg-[var(--background)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[var(--background)] overflow-x-hidden">
      <header className="bg-white shadow-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                href="/admin/dashboard"
                className="flex items-center text-slate-600 hover:text-[var(--primary)] mr-6 transition-colors duration-200"
              >
                <span className="font-medium">← Kthehu</span>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-[var(--foreground)]">Pyetjet e Klientëve</h1>
                <p className="text-slate-500">Menaxhoni pyetjet dhe kërkesat e klientëve</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Inquiries List */}
          <div className="lg:w-1/2">
            <div className="card border-none">
              <div className="p-6 border-b border-gray-200 ">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-[var(--foreground)]">
                    Pyetjet ({filteredInquiries.length})
                  </h2>
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as 'all' | 'unread' | 'read')}
                    className="border border-gray-300  bg-[var(--background)] text-[var(--foreground)] rounded-md px-3 py-1 text-sm"
                  >
                    <option value="all">Të gjitha</option>
                    <option value="unread">Të palexuara</option>
                    <option value="read">Të lexuara</option>
                  </select>
                </div>
              </div>

              <div className="divide-y divide-gray-200  max-h-96 overflow-y-auto">
                {filteredInquiries.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 ">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 text-slate-300 " />
                    <p>Nuk ka pyetje të reja</p>
                  </div>
                ) : (
                  filteredInquiries.map((inquiry) => (
                    <div
                      key={inquiry.id}
                      className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors ${selectedInquiry?.id === inquiry.id ? 'bg-blue-50 border-l-4 border-[var(--primary)] text-blue-900 ' : ''
                        }`}
                      onClick={() => handleViewInquiry(inquiry)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <User className="h-4 w-4 text-slate-400  mr-2" />
                            <span className="font-medium text-[var(--foreground)]">{inquiry.name}</span>
                            <span className="ml-2 text-sm text-slate-500 ">
                              {formatDate(inquiry.createdAt)}
                            </span>
                          </div>

                          {inquiry.propertyTitle && (
                            <div className="flex items-center mb-2">
                              <Home className="h-4 w-4 text-slate-400  mr-2" />
                              <span className="text-sm text-slate-600  truncate">
                                {inquiry.propertyTitle}
                              </span>
                            </div>
                          )}

                          <p className="text-sm text-slate-600  line-clamp-2">
                            {inquiry.message}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewInquiry(inquiry);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                            title="Shiko detajet"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteInquiry(inquiry.id);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                            title="Fshi pyetjen"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Inquiry Details */}
          <div className="lg:w-1/2">
            {selectedInquiry ? (
              <div className="card border-none">
                <div className="p-6 border-b border-gray-200 ">
                  <h2 className="text-lg font-semibold text-[var(--foreground)]">Detajet e Pyetjes</h2>
                </div>

                <div className="p-6 space-y-6">
                  {/* Contact Information */}
                  <div>
                    <h3 className="text-sm font-medium text-[var(--foreground)] mb-3">Informacionet e Kontaktit</h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-slate-400  mr-3" />
                        <span className="text-[var(--foreground)]">{selectedInquiry.name}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-slate-400  mr-3" />
                        <a
                          href={`mailto:${selectedInquiry.email}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {selectedInquiry.email}
                        </a>
                      </div>
                      {selectedInquiry.phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 text-slate-400  mr-3" />
                          <a
                            href={`tel:${selectedInquiry.phone}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {selectedInquiry.phone}
                          </a>
                        </div>
                      )}
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-slate-400  mr-3" />
                        <span className="text-slate-600 ">
                          {formatDate(selectedInquiry.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Property Information */}
                  {selectedInquiry.propertyTitle && (
                    <div>
                      <h3 className="text-sm font-medium text-[var(--foreground)] mb-3">Pasuria e Interesuar</h3>
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-[var(--foreground)]">{selectedInquiry.propertyTitle}</p>
                            {selectedInquiry.propertyPrice && (
                              <p className="text-blue-600 font-semibold">
                                €{selectedInquiry.propertyPrice.toLocaleString()}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => router.push(`/properties/${selectedInquiry.propertyId}`)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Shiko Pasurinë
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Message */}
                  <div>
                    <h3 className="text-sm font-medium text-[var(--foreground)] mb-3">Mesazhi</h3>
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="text-slate-700  whitespace-pre-wrap">{selectedInquiry.message}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-4 border-t border-gray-200 ">
                    <a
                      href={`mailto:${selectedInquiry.email}?subject=Përgjigje për pyetjen tuaj&body=Përshëndetje ${selectedInquiry.name},%0D%0A%0D%0AFaleminderit për pyetjen tuaj për pasurinë "${selectedInquiry.propertyTitle}".%0D%0A%0D%0A`}
                      className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Mail className="inline h-4 w-4 mr-2" />
                      Përgjigju me Email
                    </a>
                    {selectedInquiry.phone && (
                      <a
                        href={`tel:${selectedInquiry.phone}`}
                        className="flex-1 bg-green-600 text-white text-center py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                      >
                        <Phone className="inline h-4 w-4 mr-2" />
                        Telefono
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="card border-none p-8 text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-slate-300 " />
                <p className="text-slate-500 ">Zgjidhni një pyetje për të parë detajet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
