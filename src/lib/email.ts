import { ContactInquiry } from '@/types';
import { getProperty } from './data';

interface EmailConfig {
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  fromEmail: string;
  toEmail: string;
}

// Email configuration - in production, these would come from environment variables
const emailConfig: EmailConfig = {
  fromEmail: 'noreply@pasuritëtiranës.al',
  toEmail: 'info@pasuritëtiranës.al',
  // SMTP settings would be configured in production
  // smtpHost: process.env.SMTP_HOST,
  // smtpPort: parseInt(process.env.SMTP_PORT || '587'),
  // smtpUser: process.env.SMTP_USER,
  // smtpPass: process.env.SMTP_PASS,
};

export async function sendInquiryEmail(inquiry: ContactInquiry): Promise<boolean> {
  try {
    // Get property details for the email
    const property = await getProperty(inquiry.propertyId);
    
    if (!property) {
      console.error('Property not found for inquiry:', inquiry.propertyId);
      return false;
    }

    const emailData = {
      to: emailConfig.toEmail,
      from: emailConfig.fromEmail,
      subject: `Pyetje e re për pasurinë: ${property.title}`,
      html: generateInquiryEmailHTML(inquiry, property),
      text: generateInquiryEmailText(inquiry, property),
    };

    // In development, we'll just log the email
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Email would be sent:', emailData);
      return true;
    }

    // In production, this would use a real email service
    // Example with SendGrid:
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send(emailData);

    // Example with Nodemailer:
    // const nodemailer = require('nodemailer');
    // const transporter = nodemailer.createTransporter({...});
    // await transporter.sendMail(emailData);

    return true;
  } catch (error) {
    console.error('Error sending inquiry email:', error);
    return false;
  }
}

function generateInquiryEmailHTML(inquiry: ContactInquiry, property: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Pyetje e re për pasurinë</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .property-info { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #dc2626; }
        .contact-info { background-color: white; padding: 15px; margin: 15px 0; }
        .message { background-color: white; padding: 15px; margin: 15px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .label { font-weight: bold; color: #dc2626; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Pyetje e Re për Pasurinë</h1>
        </div>
        
        <div class="content">
          <div class="property-info">
            <h2>Detajet e Pasurisë</h2>
            <p><span class="label">Titulli:</span> ${property.title}</p>
            <p><span class="label">Çmimi:</span> €${property.price.toLocaleString()}</p>
            <p><span class="label">Adresa:</span> ${property.address.street}, ${property.address.city}</p>
            <p><span class="label">Tipi:</span> ${property.details.propertyType}</p>
            <p><span class="label">Dhoma gjumi:</span> ${property.details.bedrooms}</p>
            <p><span class="label">Banjo:</span> ${property.details.bathrooms}</p>
          </div>
          
          <div class="contact-info">
            <h2>Informacionet e Kontaktit</h2>
            <p><span class="label">Emri:</span> ${inquiry.name}</p>
            <p><span class="label">Email:</span> <a href="mailto:${inquiry.email}">${inquiry.email}</a></p>
            ${inquiry.phone ? `<p><span class="label">Telefoni:</span> <a href="tel:${inquiry.phone}">${inquiry.phone}</a></p>` : ''}
            <p><span class="label">Data:</span> ${new Date(inquiry.createdAt).toLocaleString('sq-AL')}</p>
          </div>
          
          <div class="message">
            <h2>Mesazhi</h2>
            <p>${inquiry.message.replace(/\n/g, '<br>')}</p>
          </div>
        </div>
        
        <div class="footer">
          <p>Ky email u gjenerua automatikisht nga sistemi i pasurive të patundshme.</p>
          <p>Ju lutem përgjigjuni drejtpërdrejt në adresën e klientit: ${inquiry.email}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateInquiryEmailText(inquiry: ContactInquiry, property: any): string {
  return `
PYETJE E RE PËR PASURINË

Detajet e Pasurisë:
- Titulli: ${property.title}
- Çmimi: €${property.price.toLocaleString()}
- Adresa: ${property.address.street}, ${property.address.city}
- Tipi: ${property.details.propertyType}
- Dhoma gjumi: ${property.details.bedrooms}
- Banjo: ${property.details.bathrooms}

Informacionet e Kontaktit:
- Emri: ${inquiry.name}
- Email: ${inquiry.email}
${inquiry.phone ? `- Telefoni: ${inquiry.phone}` : ''}
- Data: ${new Date(inquiry.createdAt).toLocaleString('sq-AL')}

Mesazhi:
${inquiry.message}

---
Ky email u gjenerua automatikisht nga sistemi i pasurive të patundshme.
Ju lutem përgjigjuni drejtpërdrejt në adresën e klientit: ${inquiry.email}
  `;
}

export async function sendConfirmationEmail(inquiry: ContactInquiry): Promise<boolean> {
  try {
    const property = await getProperty(inquiry.propertyId);
    
    if (!property) {
      return false;
    }

    const emailData = {
      to: inquiry.email,
      from: emailConfig.fromEmail,
      subject: 'Konfirmim: Pyetja juaj u dërgua me sukses',
      html: generateConfirmationEmailHTML(inquiry, property),
      text: generateConfirmationEmailText(inquiry, property),
    };

    // In development, we'll just log the email
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Confirmation email would be sent:', emailData);
      return true;
    }

    // In production, this would use a real email service
    return true;
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return false;
  }
}

function generateConfirmationEmailHTML(inquiry: ContactInquiry, property: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Konfirmim Pyetjeje</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #16a34a; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .property-info { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #16a34a; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .label { font-weight: bold; color: #16a34a; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Pyetja Juaj u Dërgua me Sukses!</h1>
        </div>
        
        <div class="content">
          <p>Përshëndetje <strong>${inquiry.name}</strong>,</p>
          
          <p>Faleminderit për interesimin tuaj për pasurinë tonë. Pyetja juaj u dërgua me sukses dhe do t'ju kontaktojmë së shpejti.</p>
          
          <div class="property-info">
            <h2>Pasuria që ju intereson:</h2>
            <p><span class="label">Titulli:</span> ${property.title}</p>
            <p><span class="label">Çmimi:</span> €${property.price.toLocaleString()}</p>
            <p><span class="label">Adresa:</span> ${property.address.street}, ${property.address.city}</p>
          </div>
          
          <p>Mesazhi juaj:</p>
          <p style="background-color: white; padding: 15px; font-style: italic;">"${inquiry.message}"</p>
          
          <p>Do t'ju kontaktojmë në adresën <strong>${inquiry.email}</strong>${inquiry.phone ? ` ose në numrin <strong>${inquiry.phone}</strong>` : ''} brenda 24 orëve.</p>
        </div>
        
        <div class="footer">
          <p>Faleminderit që zgjodhët shërbimet tona!</p>
          <p>Pasuritë e Tiranës - info@pasuritëtiranës.al - +355 69 123 4567</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateConfirmationEmailText(inquiry: ContactInquiry, property: any): string {
  return `
KONFIRMIM: PYETJA JUAJ U DËRGUA ME SUKSES!

Përshëndetje ${inquiry.name},

Faleminderit për interesimin tuaj për pasurinë tonë. Pyetja juaj u dërgua me sukses dhe do t'ju kontaktojmë së shpejti.

Pasuria që ju intereson:
- Titulli: ${property.title}
- Çmimi: €${property.price.toLocaleString()}
- Adresa: ${property.address.street}, ${property.address.city}

Mesazhi juaj:
"${inquiry.message}"

Do t'ju kontaktojmë në adresën ${inquiry.email}${inquiry.phone ? ` ose në numrin ${inquiry.phone}` : ''} brenda 24 orëve.

Faleminderit që zgjodhët shërbimet tona!
Pasuritë e Tiranës - info@pasuritëtiranës.al - +355 69 123 4567
  `;
}