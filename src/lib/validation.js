// Frontend validation functions that match backend validation rules

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  if (!password || password.length < 6) {
    return false;
  }
  // Must contain at least one lowercase letter, one uppercase letter, and one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
  return passwordRegex.test(password);
};

export const validateFullName = (fullName) => {
  if (!fullName || fullName.trim().length < 2 || fullName.trim().length > 100) {
    return false;
  }
  // Can only contain letters and spaces
  const nameRegex = /^[a-zA-Z\s]+$/;
  return nameRegex.test(fullName.trim());
};

export const validatePhoneNumber = (phone) => {
  // Basic phone number validation - adjust regex based on your requirements
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

export const validateTitle = (title) => {
  return title && title.trim().length >= 5 && title.trim().length <= 255;
};

export const validateDescription = (description) => {
  return description && description.trim().length >= 10 && description.trim().length <= 2000;
};

export const validateAddress = (address) => {
  return !address || address.trim().length <= 500;
};

export const validateLatitude = (lat) => {
  const latitude = parseFloat(lat);
  return !isNaN(latitude) && latitude >= -90 && latitude <= 90;
};

export const validateLongitude = (lng) => {
  const longitude = parseFloat(lng);
  return !isNaN(longitude) && longitude >= -180 && longitude <= 180;
};

export const validateComment = (content) => {
  return content && content.trim().length >= 1 && content.trim().length <= 1000;
};

export const validateJustification = (justification) => {
  return justification && justification.trim().length >= 50 && justification.trim().length <= 1000;
};

export const validateNote = (note) => {
  return note && note.trim().length >= 1 && note.trim().length <= 1000;
};

export const validateSearchTerm = (search) => {
  return !search || (search.trim().length >= 1 && search.trim().length <= 100);
};

export const validateFeedback = (feedback) => {
  return !feedback || feedback.trim().length <= 500;
};

export const validateReason = (reason) => {
  return !reason || reason.trim().length <= 500;
};

// Validation error messages that match backend
export const getValidationError = (field, value) => {
  switch (field) {
    case 'email':
      if (!value || !value.trim()) return 'Email is required';
      if (!validateEmail(value)) return 'Please provide a valid email address';
      break;
    
    case 'password':
      if (!value) return 'Password is required';
      if (value.length < 6) return 'Password must be at least 6 characters long';
      if (!validatePassword(value)) return 'Password must contain at least one lowercase letter, one uppercase letter, and one number';
      break;
    
    case 'fullName':
      if (!value || !value.trim()) return 'Full name is required';
      if (value.trim().length < 2 || value.trim().length > 100) return 'Full name must be between 2 and 100 characters';
      if (!validateFullName(value)) return 'Full name can only contain letters and spaces';
      break;
    
    case 'phone':
      if (!value || !value.trim()) return 'Phone number is required';
      if (!validatePhoneNumber(value)) return 'Please provide a valid phone number';
      break;
    
    case 'title':
      if (!value || !value.trim()) return 'Title is required';
      if (!validateTitle(value)) return 'Title must be between 5 and 255 characters';
      break;
    
    case 'description':
      if (!value || !value.trim()) return 'Description is required';
      if (!validateDescription(value)) return 'Description must be between 10 and 2000 characters';
      break;
    
    case 'address':
      if (!validateAddress(value)) return 'Address must not exceed 500 characters';
      break;
    
    case 'locationLat':
      if (!validateLatitude(value)) return 'Valid latitude is required';
      break;
    
    case 'locationLng':
      if (!validateLongitude(value)) return 'Valid longitude is required';
      break;
    
    case 'comment':
      if (!value || !value.trim()) return 'Comment is required';
      if (!validateComment(value)) return 'Comment must be between 1 and 1000 characters';
      break;
    
    case 'justification':
      if (!value || !value.trim()) return 'Justification is required';
      if (!validateJustification(value)) return 'Justification must be between 50 and 1000 characters';
      break;
    
    case 'note':
      if (!value || !value.trim()) return 'Note is required';
      if (!validateNote(value)) return 'Note must be between 1 and 1000 characters';
      break;
    
    case 'search':
      if (!validateSearchTerm(value)) return 'Search term must be between 1 and 100 characters';
      break;
    
    case 'feedback':
      if (!validateFeedback(value)) return 'Feedback must not exceed 500 characters';
      break;
    
    case 'reason':
      if (!validateReason(value)) return 'Reason must not exceed 500 characters';
      break;
    
    default:
      return null;
  }
  return null;
};
