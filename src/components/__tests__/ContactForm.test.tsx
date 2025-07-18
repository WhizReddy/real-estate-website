import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContactForm from '../ContactForm';
import { saveInquiry } from '@/lib/data';

// Mock the data functions
jest.mock('@/lib/data', () => ({
  saveInquiry: jest.fn(),
}));

// Mock the utils functions
jest.mock('@/lib/utils', () => ({
  generateId: jest.fn(() => 'test-id-123'),
  getCurrentTimestamp: jest.fn(() => '2024-01-01T00:00:00.000Z'),
}));

const mockSaveInquiry = saveInquiry as jest.MockedFunction<typeof saveInquiry>;

describe('ContactForm', () => {
  const defaultProps = {
    propertyId: 'property-123',
    propertyTitle: 'Beautiful House in Tirana',
  };

  beforeEach(() => {
    mockSaveInquiry.mockClear();
    mockSaveInquiry.mockResolvedValue();
  });

  it('renders contact form with Albanian labels', () => {
    render(<ContactForm {...defaultProps} />);
    
    expect(screen.getByText('Kontaktoni Agjentin')).toBeInTheDocument();
    expect(screen.getByLabelText(/Emri i Plotë/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Adresa e Email-it/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Numri i Telefonit/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mesazhi/)).toBeInTheDocument();
  });

  it('displays property title in description', () => {
    render(<ContactForm {...defaultProps} />);
    
    expect(screen.getByText(/Beautiful House in Tirana/)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<ContactForm {...defaultProps} />);
    
    const submitButton = screen.getByRole('button', { name: /Dërgo Mesazhin/ });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Emri është i detyrueshëm')).toBeInTheDocument();
      expect(screen.getByText('Email-i është i detyrueshëm')).toBeInTheDocument();
      expect(screen.getByText('Mesazhi është i detyrueshëm')).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    render(<ContactForm {...defaultProps} />);
    
    const emailInput = screen.getByLabelText(/Adresa e Email-it/);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    const submitButton = screen.getByRole('button', { name: /Dërgo Mesazhin/ });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Adresa e email-it nuk është e vlefshme')).toBeInTheDocument();
    });
  });

  it('validates phone number format', async () => {
    render(<ContactForm {...defaultProps} />);
    
    const phoneInput = screen.getByLabelText(/Numri i Telefonit/);
    fireEvent.change(phoneInput, { target: { value: '123' } });
    
    const submitButton = screen.getByRole('button', { name: /Dërgo Mesazhin/ });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Numri i telefonit nuk është i vlefshëm')).toBeInTheDocument();
    });
  });

  it('validates minimum message length', async () => {
    render(<ContactForm {...defaultProps} />);
    
    const messageInput = screen.getByLabelText(/Mesazhi/);
    fireEvent.change(messageInput, { target: { value: 'short' } });
    
    const submitButton = screen.getByRole('button', { name: /Dërgo Mesazhin/ });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Mesazhi duhet të ketë të paktën 10 karaktere')).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    render(<ContactForm {...defaultProps} />);
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Emri i Plotë/), {
      target: { value: 'John Doe' }
    });
    fireEvent.change(screen.getByLabelText(/Adresa e Email-it/), {
      target: { value: 'john@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/Numri i Telefonit/), {
      target: { value: '+355 69 123 4567' }
    });
    fireEvent.change(screen.getByLabelText(/Mesazhi/), {
      target: { value: 'I am interested in this property. Please contact me.' }
    });
    
    const submitButton = screen.getByRole('button', { name: /Dërgo Mesazhin/ });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockSaveInquiry).toHaveBeenCalledWith({
        id: 'test-id-123',
        propertyId: 'property-123',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+355 69 123 4567',
        message: 'I am interested in this property. Please contact me.',
        createdAt: '2024-01-01T00:00:00.000Z',
      });
    });
  });

  it('shows success message after submission', async () => {
    render(<ContactForm {...defaultProps} />);
    
    // Fill out and submit form
    fireEvent.change(screen.getByLabelText(/Emri i Plotë/), {
      target: { value: 'John Doe' }
    });
    fireEvent.change(screen.getByLabelText(/Adresa e Email-it/), {
      target: { value: 'john@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/Mesazhi/), {
      target: { value: 'I am interested in this property.' }
    });
    
    const submitButton = screen.getByRole('button', { name: /Dërgo Mesazhin/ });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Mesazhi u Dërgua!')).toBeInTheDocument();
      expect(screen.getByText(/Faleminderit për interesimin tuaj/)).toBeInTheDocument();
    });
  });

  it('shows error message on submission failure', async () => {
    mockSaveInquiry.mockRejectedValue(new Error('Network error'));
    
    render(<ContactForm {...defaultProps} />);
    
    // Fill out and submit form
    fireEvent.change(screen.getByLabelText(/Emri i Plotë/), {
      target: { value: 'John Doe' }
    });
    fireEvent.change(screen.getByLabelText(/Adresa e Email-it/), {
      target: { value: 'john@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/Mesazhi/), {
      target: { value: 'I am interested in this property.' }
    });
    
    const submitButton = screen.getByRole('button', { name: /Dërgo Mesazhin/ });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Ka ndodhur një gabim gjatë dërgimit të mesazhit/)).toBeInTheDocument();
    });
  });

  it('displays agent contact information', () => {
    render(<ContactForm {...defaultProps} />);
    
    expect(screen.getByText('Informacione Kontakti')).toBeInTheDocument();
    expect(screen.getByText('info@pasuritëtiranës.al')).toBeInTheDocument();
    expect(screen.getByText('+355 69 123 4567')).toBeInTheDocument();
    expect(screen.getByText(/Hën-Pre: 9:00-18:00/)).toBeInTheDocument();
  });

  it('allows sending another message after success', async () => {
    render(<ContactForm {...defaultProps} />);
    
    // Submit form first
    fireEvent.change(screen.getByLabelText(/Emri i Plotë/), {
      target: { value: 'John Doe' }
    });
    fireEvent.change(screen.getByLabelText(/Adresa e Email-it/), {
      target: { value: 'john@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/Mesazhi/), {
      target: { value: 'I am interested in this property.' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /Dërgo Mesazhin/ }));
    
    await waitFor(() => {
      expect(screen.getByText('Mesazhi u Dërgua!')).toBeInTheDocument();
    });
    
    // Click "Send Another Message"
    fireEvent.click(screen.getByText('Dërgo një Mesazh Tjetër'));
    
    // Form should be visible again
    expect(screen.getByText('Kontaktoni Agjentin')).toBeInTheDocument();
    expect(screen.getByLabelText(/Emri i Plotë/)).toBeInTheDocument();
  });
});