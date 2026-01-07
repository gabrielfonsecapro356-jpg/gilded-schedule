// Phone validation for Brazilian format (99) 99999-9999
export const phoneRegex = /^\(\d{2}\)\s?\d{5}-\d{4}$/;

export const formatPhone = (value: string): string => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');
  
  // Apply mask
  if (digits.length <= 2) {
    return digits.length > 0 ? `(${digits}` : '';
  }
  if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
};

export const isValidPhone = (phone: string): boolean => {
  return phoneRegex.test(phone);
};

// Email validation
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (email: string): boolean => {
  if (!email) return true; // Email is optional
  return emailRegex.test(email);
};

// Validation messages
export const validationMessages = {
  phone: 'Telefone inválido. Use o formato (99) 99999-9999',
  email: 'Email inválido. Use o formato exemplo@email.com',
  required: 'Este campo é obrigatório',
};
