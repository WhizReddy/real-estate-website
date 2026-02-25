'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ContactInquiry } from '@/types';
import { generateId, getCurrentTimestamp } from '@/lib/utils';
import { sanitizeInquiryData, isValidEmail, isValidPhone, contactFormLimiter } from '@/lib/security';
import { getTranslation } from '@/lib/i18n';
import { Mail, Phone, Clock, MessageCircle, User, Send, Check } from 'lucide-react';

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

  // Use simple i18n detection
  const locale = typeof window !== 'undefined' && window.location.pathname.startsWith("/en") ? "en" : "sq";
  const t = (key: string) => getTranslation(key, locale as any);

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
        setSubmitError(t('rateLimitError'));
        setIsSubmitting(false);
        return;
      }

      // Additional validation
      if (!isValidEmail(data.email)) {
        setSubmitError(t('emailInvalid'));
        setIsSubmitting(false);
        return;
      }

      if (data.phone && !isValidPhone(data.phone)) {
        setSubmitError(t('phoneInvalid'));
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

      // Submit inquiry via API (client-safe)
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inquiry),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed to submit inquiry: ${res.status}`);
      }
      setIsSubmitted(true);
      reset();
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      setSubmitError(t('sendError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="card p-[var(--spacing-xl)] text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-[var(--spacing-md)]">
          <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-[var(--text-scale-h3)] font-semibold text-slate-900 dark:text-white mb-2">{t('formSubmitSuccess')}</h3>
        <p className="text-[var(--text-scale-base)] text-slate-600 dark:text-slate-400 mb-[var(--spacing-lg)]">
          {t('formSuccessDesc')}
        </p>
        <button
          onClick={() => setIsSubmitted(false)}
          className="text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-white font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-md px-2 py-1 transition-colors"
        >
          {t('sendAnotherMessage')}
        </button>
      </div>
    );
  }

  return (
    <div className="card p-[var(--spacing-xl)] sticky top-6">
      <div className="flex items-center mb-[var(--spacing-md)]">
        <MessageCircle className="h-6 w-6 text-[var(--primary)] mr-2" />
        <h3 className="text-[var(--text-scale-h3)] font-semibold text-slate-900 dark:text-white">{t('contactAgent')}</h3>
      </div>
      <p className="text-[var(--text-scale-base)] text-slate-600 dark:text-slate-400 mb-[var(--spacing-lg)] leading-relaxed">
        {t('interestedIn')} <span className="font-medium text-slate-900 dark:text-white">{propertyTitle}</span>?
        {' '} {t('interestedDesc')}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-[var(--spacing-md)]">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-[var(--text-scale-sm)] font-medium text-slate-700 dark:text-slate-300 mb-1">
            <User className="inline h-4 w-4 mr-1" />
            {t('formNameLabel')}
          </label>
          <input
            type="text"
            id="name"
            aria-label={t('formNameLabel')}
            {...register('name', {
              required: t('nameRequired'),
              minLength: {
                value: 2,
                message: t('nameMinLength')
              }
            })}
            className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-[var(--text-scale-base)] text-slate-900 dark:text-white transition-all shadow-xs"
            placeholder="..."
          />
          {errors.name && (
            <p className="text-red-500 text-[var(--text-scale-sm)] mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-[var(--text-scale-sm)] font-medium text-slate-700 dark:text-slate-300 mb-1">
            <Mail className="inline h-4 w-4 mr-1" />
            {t('formEmailLabel')}
          </label>
          <input
            type="email"
            id="email"
            aria-label={t('formEmailLabel')}
            {...register('email', {
              required: t('emailRequired'),
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: t('emailInvalid'),
              },
            })}
            className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-[var(--text-scale-base)] text-slate-900 dark:text-white transition-all shadow-xs"
            placeholder="..."
          />
          {errors.email && (
            <p className="text-red-500 text-[var(--text-scale-sm)] mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-[var(--text-scale-sm)] font-medium text-slate-700 dark:text-slate-300 mb-1">
            <Phone className="inline h-4 w-4 mr-1" />
            {t('formPhoneLabel')}
          </label>
          <input
            type="tel"
            id="phone"
            aria-label={t('formPhoneLabel')}
            {...register('phone', {
              pattern: {
                value: /^[\+]?[0-9\s\-\(\)]{8,}$/,
                message: t('phoneInvalid')
              }
            })}
            className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-[var(--text-scale-base)] text-slate-900 dark:text-white transition-all shadow-xs"
            placeholder="+..."
          />
          {errors.phone && (
            <p className="text-red-500 text-[var(--text-scale-sm)] mt-1">{errors.phone.message}</p>
          )}
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-[var(--text-scale-sm)] font-medium text-slate-700 dark:text-slate-300 mb-1">
            {t('formMessageLabel')}
          </label>
          <textarea
            id="message"
            aria-label={t('formMessageLabel')}
            rows={4}
            {...register('message', {
              required: t('messageRequired'),
              minLength: {
                value: 10,
                message: t('messageMinLength')
              }
            })}
            className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-vertical text-[var(--text-scale-base)] text-slate-900 dark:text-white transition-all shadow-xs"
            placeholder="..."
          />
          {errors.message && (
            <p className="text-red-500 text-[var(--text-scale-sm)] mt-1">{errors.message.message}</p>
          )}
        </div>

        {/* Error Message */}
        {submitError && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-red-600 dark:text-red-400 text-[var(--text-scale-sm)]">{submitError}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full btn-primary"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 font-white mr-2"></div>
              {t('formSending')}
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              {t('formSubmitBtn')}
            </>
          )}
        </button>
      </form>

      {/* Agent Info */}
      <div className="mt-[var(--spacing-xl)] pt-[var(--spacing-md)] border-t border-gray-200 dark:border-slate-800">
        <h4 className="font-semibold text-slate-900 dark:text-white mb-3">{t('contactInfo')}</h4>
        <div className="text-[var(--text-scale-sm)] text-slate-600 dark:text-slate-400 space-y-2">
          <div className="flex items-center">
            <Mail className="h-4 w-4 mr-2 text-[var(--primary)]" />
            <span>info@pasuritetiranes.al</span>
          </div>
          <div className="flex items-center">
            <Phone className="h-4 w-4 mr-2 text-[var(--primary)]" />
            <span>+355 69 123 4567</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-[var(--primary)]" />
            <span>{t('agentHours')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}