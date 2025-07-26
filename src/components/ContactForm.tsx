'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ContactInquiry } from '@/types';
import { saveInquiry } from '@/lib/data';
import { generateId, getCurrentTimestamp } from '@/lib/utils';
import { sanitizeInquiryData, isValidEmail, isValidPhone, contactFormLimiter } from '@/lib/security';
import { useToast } from '@/components/Toast';
import { Mail, Phone, Clock, MessageCircle, User, Send } from 'lucide-react';

interface ContactFormProps {
  propertyId: string;
  propertyTitle: string;
}

interface FormData {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export default function ContactForm({ propertyId, propertyTitle }: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { showToast } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Rate limiting check
      const clientId = `contact-${propertyId}`;
      if (!contactFormLimiter.isAllowed(clientId)) {
        setSubmitError('Keni dërguar shumë mesazhe. Ju lutem prisni disa minuta para se të provoni përsëri.');
        setIsSubmitting(false);
        return;
      }

      // Additional validation
      if (!isValidEmail(data.email)) {
        setSubmitError('Adresa e email-it nuk është e vlefshme.');
        setIsSubmitting(false);
        return;
      }

      if (data.phone && !isValidPhone(data.phone)) {
        setSubmitError('Numri i telefonit nuk është i vlefshëm.');
        setIsSubmitting(false);
        return;
      }

      // Sanitize input data
      const sanitizedData = sanitizeInquiryData(data);

      const inquiry: ContactInquiry = {
        id: generateId(),
        propertyId,
        name: sanitizedData.name,
        email: sanitizedData.email,
        phone: sanitizedData.phone,
        message: sanitizedData.message,
        createdAt: getCurrentTimestamp(),
      };

      await saveInquiry(inquiry);
      setIsSubmitted(true);
      reset();
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      setSubmitError('Ka ndodhur një gabim gjatë dërgimit të mesazhit. Ju lutem provoni përsëri.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Mesazhi u Dërgua!</h3>
          <p className="text-gray-600 mb-4">
            Faleminderit për interesimin tuaj për këtë pasuri. Do t'ju kontaktojmë së shpejti.
          </p>
          <button
            onClick={() => setIsSubmitted(false)}
            className="text-red-600 hover:text-red-800 font-medium"
          >
            Dërgo një Mesazh Tjetër
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
      <div className="flex items-center mb-4">
        <MessageCircle className="h-6 w-6 text-blue-600 mr-2" />
        <h3 className="text-xl font-semibold text-gray-900">Kontaktoni Agjentin</h3>
      </div>
      <p className="text-gray-600 mb-6">
        Jeni të interesuar për <span className="font-medium text-gray-900">{propertyTitle}</span>? 
        Dërgoni një mesazh dhe do t'ju kthejmë përgjigje.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            <User className="inline h-4 w-4 mr-1" />
            Emri i Plotë *
          </label>
          <input
            type="text"
            id="name"
            {...register('name', { 
              required: 'Emri është i detyrueshëm',
              minLength: {
                value: 2,
                message: 'Emri duhet të ketë të paktën 2 karaktere'
              }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Emri dhe mbiemri juaj"
          />
          {errors.name && (
            <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            <Mail className="inline h-4 w-4 mr-1" />
            Adresa e Email-it *
          </label>
          <input
            type="email"
            id="email"
            {...register('email', {
              required: 'Email-i është i detyrueshëm',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Adresa e email-it nuk është e vlefshme',
              },
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="emri.juaj@email.com"
          />
          {errors.email && (
            <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            <Phone className="inline h-4 w-4 mr-1" />
            Numri i Telefonit
          </label>
          <input
            type="tel"
            id="phone"
            {...register('phone', {
              pattern: {
                value: /^[\+]?[0-9\s\-\(\)]{8,}$/,
                message: 'Numri i telefonit nuk është i vlefshëm'
              }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="+355 69 123 4567"
          />
          {errors.phone && (
            <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>
          )}
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Mesazhi *
          </label>
          <textarea
            id="message"
            rows={4}
            {...register('message', { 
              required: 'Mesazhi është i detyrueshëm',
              minLength: {
                value: 10,
                message: 'Mesazhi duhet të ketë të paktën 10 karaktere'
              }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-vertical"
            placeholder="Jam i interesuar për këtë pasuri. Ju lutem kontaktoni me më shumë informacion..."
          />
          {errors.message && (
            <p className="text-red-600 text-sm mt-1">{errors.message.message}</p>
          )}
        </div>

        {/* Error Message */}
        {submitError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{submitError}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Duke dërguar...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Dërgo Mesazhin
            </>
          )}
        </button>
      </form>

      {/* Agent Info */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3">Informacione Kontakti</h4>
        <div className="text-sm text-gray-600 space-y-2">
          <div className="flex items-center">
            <Mail className="h-4 w-4 mr-2 text-red-600" />
            <span>info@pasuritëtiranës.al</span>
          </div>
          <div className="flex items-center">
            <Phone className="h-4 w-4 mr-2 text-red-600" />
            <span>+355 69 123 4567</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-red-600" />
            <span>Hën-Pre: 9:00-18:00, Sht-Dje: 10:00-16:00</span>
          </div>
        </div>
      </div>
    </div>
  );
}