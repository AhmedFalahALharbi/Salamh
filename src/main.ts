// Types for form data and validation
interface FormData {
  companyName: string;
  commercialRegNumber: string;
  phoneNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
  city: string;
  region: string;
  zipCode: string;
  businessType: string;
  terms: boolean;
}

interface ValidationErrors {
  [key: string]: string;
}

// Validation rules
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[\d\s-]{10,}$/;

class FormValidator {
  private static errors: ValidationErrors = {};

  static validatePassword(password: string): boolean {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;

    return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar && isLongEnough;
  }

  static validateForm(data: FormData): ValidationErrors {
    this.errors = {};

    // Check for empty fields
    Object.entries(data).forEach(([key, value]) => {
      if (!value && key !== 'terms') {
        this.errors[key] = `${key.replace(/([A-Z])/g, ' $1').trim()} is required`;
      }
    });

    // Email validation
    if (data.email && !EMAIL_REGEX.test(data.email)) {
      this.errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (data.password && !this.validatePassword(data.password)) {
      this.errors.password = 'Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters';
    }

    // Confirm password
    if (data.password !== data.confirmPassword) {
      this.errors.confirmPassword = 'Passwords do not match';
    }

    // Phone validation
    if (data.phoneNumber && !PHONE_REGEX.test(data.phoneNumber)) {
      this.errors.phoneNumber = 'Please enter a valid phone number';
    }

    // Terms validation
    if (!data.terms) {
      this.errors.terms = 'You must accept the terms and conditions';
    }

    return this.errors;
  }
}

// Form handling
const handleFormSubmission = async (): Promise<void> => {
  const form = document.getElementById('registrationForm') as HTMLFormElement;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries()) as unknown as FormData;

  // Clear previous error messages
  document.querySelectorAll('.error-message').forEach(el => el.remove());

  // Validate form
  const errors = FormValidator.validateForm(data);

  if (Object.keys(errors).length > 0) {
    // Display error messages
    Object.entries(errors).forEach(([field, message]) => {
      const input = document.getElementById(field);
      if (input) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message text-red-500 text-sm mt-1';
        errorDiv.textContent = message;
        input.parentElement?.appendChild(errorDiv);
        input.classList.add('border-red-500');
      }
    });
    return;
  }

  try {
    const response = await fetch('https://67b9760151192bd378dd7c04.mockapi.io/organization', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: data.companyName,
        phone: data.phoneNumber,
        email: data.email,
        password: data.password,
        city: data.city,
        region: data.region,
        zip: data.zipCode,
        type: data.businessType
      })
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const result = await response.json();
    console.log('Success:', result);
    
    // Show success message
    const successMessage = document.createElement('div');
    successMessage.className = 'bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mt-4';
    successMessage.textContent = 'Registration successful!';
    form.appendChild(successMessage);
    
    // Reset form
    form.reset();

  } catch (error) {
    console.error('Error:', error);
    // Show error message
    const errorMessage = document.createElement('div');
    errorMessage.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4';
    errorMessage.textContent = 'An error occurred during registration. Please try again.';
    form.appendChild(errorMessage);
  }
};

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registrationForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleFormSubmission();
    });
  }
});

// Function to fetch company details from an external API
const fetchCompanyDetails = async (): Promise<void> => {
  const apiFetchBtn = document.getElementById('apiFetchBtn');
  const container = document.getElementById('apifetch');

  if (!apiFetchBtn || !container) return;

  // Show loading state
  apiFetchBtn.textContent = 'Loading...';
  
  try {
    const response = await fetch('https://67b9760151192bd378dd7c04.mockapi.io/organization');
    if (!response.ok) {
      throw new Error('Failed to fetch company details');
    }
    const companies = await response.json();
    displayCompanyDetails(companies);
  } catch (error) {
    console.error('Error fetching company details:', error);
    // Optionally, show an error message on the page
    const errorMessage = document.createElement('div');
    errorMessage.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4';
    errorMessage.textContent = 'Unable to load company details. Please try again later.';
    document.getElementById('apifetch')?.appendChild(errorMessage);
  }
};

// Function to display fetched company details on the page
const displayCompanyDetails = (companies: any[]): void => {
  const container = document.getElementById('apifetch');
  if (container) {
    container.innerHTML = ''; // Clear previous content
    companies.forEach(company => {
      const companyDiv = document.createElement('div');
      companyDiv.className = 'company-details p-4 border rounded-md m-2 w-full text-center shadow-lg';
      companyDiv.textContent = `Name:${company.name}, Email:${company.email}, Phone:${company.phone}`;
      container.appendChild(companyDiv);
    });
  }
};

// Event listener for the API fetch button
document.addEventListener('DOMContentLoaded', () => {
  const apiFetchBtn = document.getElementById('apiFetchBtn');
  if (apiFetchBtn) {
    apiFetchBtn.addEventListener('click', fetchCompanyDetails);
  }
});
