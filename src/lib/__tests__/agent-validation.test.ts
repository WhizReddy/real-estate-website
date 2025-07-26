import { 
  validateAgentData, 
  validateUserRole, 
  validatePassword,
  validateEmail,
  validatePhone 
} from '../validation';

describe('Agent Validation Functions', () => {
  describe('validateUserRole', () => {
    it('should validate ADMIN role', () => {
      expect(validateUserRole('ADMIN')).toBe(true);
      expect(validateUserRole('admin')).toBe(true);
    });

    it('should validate AGENT role', () => {
      expect(validateUserRole('AGENT')).toBe(true);
      expect(validateUserRole('agent')).toBe(true);
    });

    it('should reject invalid roles', () => {
      expect(validateUserRole('USER')).toBe(false);
      expect(validateUserRole('MANAGER')).toBe(false);
      expect(validateUserRole('')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      const result = validatePassword('password123');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject weak passwords', () => {
      const result = validatePassword('123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 6 characters long');
    });

    it('should require letters and numbers', () => {
      const letterOnly = validatePassword('password');
      expect(letterOnly.isValid).toBe(false);
      expect(letterOnly.errors).toContain('Password must contain at least one number');

      const numberOnly = validatePassword('123456');
      expect(numberOnly.isValid).toBe(false);
      expect(numberOnly.errors).toContain('Password must contain at least one letter');
    });
  });

  describe('validateAgentData', () => {
    const validAgentData = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+355691234567',
      password: 'password123',
      role: 'AGENT'
    };

    it('should validate complete agent data', () => {
      const result = validateAgentData(validAgentData);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedData).toBeDefined();
      expect(result.sanitizedData.name).toBe('John Doe');
      expect(result.sanitizedData.email).toBe('john@example.com');
      expect(result.sanitizedData.role).toBe('AGENT');
    });

    it('should reject missing required fields', () => {
      const result = validateAgentData({});
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'name', code: 'REQUIRED_FIELD' }),
          expect.objectContaining({ field: 'email', code: 'REQUIRED_FIELD' }),
          expect.objectContaining({ field: 'password', code: 'REQUIRED_FIELD' }),
          expect.objectContaining({ field: 'role', code: 'REQUIRED_FIELD' })
        ])
      );
    });

    it('should validate email format', () => {
      const result = validateAgentData({
        ...validAgentData,
        email: 'invalid-email'
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'email', code: 'INVALID_EMAIL' })
        ])
      );
    });

    it('should validate role', () => {
      const result = validateAgentData({
        ...validAgentData,
        role: 'INVALID_ROLE'
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'role', code: 'INVALID_ROLE' })
        ])
      );
    });

    it('should handle optional phone field', () => {
      const withoutPhone = { ...validAgentData };
      delete withoutPhone.phone;
      
      const result = validateAgentData(withoutPhone);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedData.phone).toBeUndefined();
    });

    it('should validate phone format when provided', () => {
      const result = validateAgentData({
        ...validAgentData,
        phone: 'invalid-phone'
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'phone', code: 'INVALID_PHONE' })
        ])
      );
    });

    it('should sanitize name input', () => {
      const result = validateAgentData({
        ...validAgentData,
        name: '  John <script>alert("xss")</script> Doe  '
      });
      expect(result.isValid).toBe(true);
      expect(result.sanitizedData.name).toBe('John &lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt; Doe');
    });
  });
});