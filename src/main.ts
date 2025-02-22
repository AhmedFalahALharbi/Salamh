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

    Object.entries(data).forEach(([key, value]) => {
      if (!value && key !== 'terms') {
        this.errors[key] = `${key.replace(/([A-Z])/g, ' $1').trim()} is required`;
      }
    });

    if (data.email && !EMAIL_REGEX.test(data.email)) {
      this.errors.email = 'Please enter a valid email address';
    }

    if (data.password && !this.validatePassword(data.password)) {
      this.errors.password = 'Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters';
    }

  
    if (data.password !== data.confirmPassword) {
      this.errors.confirmPassword = 'Passwords do not match';
    }

    if (data.phoneNumber && !PHONE_REGEX.test(data.phoneNumber)) {
      this.errors.phoneNumber = 'Please enter a valid phone number';
    }


    if (!data.terms) {
      this.errors.terms = 'You must accept the terms and conditions';
    }

    return this.errors;
  }
}


const handleFormSubmission = async (): Promise<void> => {
  const form = document.getElementById('registrationForm') as HTMLFormElement;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries()) as unknown as FormData;


  document.querySelectorAll('.error-message').forEach(el => el.remove());


  const errors = FormValidator.validateForm(data);

  if (Object.keys(errors).length > 0) {
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

// Upload Data
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
    

    const successMessage = document.createElement('div');
    successMessage.className = 'bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mt-4';
    successMessage.textContent = 'Registration successful!';
    form.appendChild(successMessage);
 
    form.reset();

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = document.createElement('div');
    errorMessage.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4';
    errorMessage.textContent = 'An error occurred during registration. Please try again.';
    form.appendChild(errorMessage);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registrationForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleFormSubmission();
    });
  }
});

// Retrive Data
const fetchCompanyDetails = async (): Promise<void> => {
  const apiFetchBtn = document.getElementById('apiFetchBtn');
  const container = document.getElementById('apifetch');

  if (!apiFetchBtn || !container) return;


   const spinner = document.createElement('div');
   container.appendChild(spinner);
 
   apiFetchBtn.textContent = '';
   apiFetchBtn.className = 'loading loading-spinner loading-lg bg-green-300'
  try {
    const response = await fetch('https://67b9760151192bd378dd7c04.mockapi.io/organization');
    if (!response.ok) {
      throw new Error('Failed to fetch company details');
    }
    const companies = await response.json();
    displayCompanyDetails(companies);
  } catch (error) {
    console.error('Error fetching company details:', error);
    const errorMessage = document.createElement('div');
    errorMessage.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4';
    errorMessage.textContent = 'Unable to load company details. Please try again later.';
    document.getElementById('apifetch')?.appendChild(errorMessage);
  }
};

const displayCompanyDetails = (companies: any[]): void => {
  const container = document.getElementById('apifetch');
  if (container) {
    container.innerHTML = '';
    companies.forEach(company => {
      const companyDiv = document.createElement('div');
      companyDiv.className = 'company-details p-4 border rounded-md m-2 w-full text-center shadow-lg hover:shadow-green-200';
      companyDiv.textContent = `Name:${company.name}, Email:${company.email}, Phone:${company.phone}, City:${company.city} Region:${company.region}, Business Type:${company.type} `;
      container.appendChild(companyDiv);
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const apiFetchBtn = document.getElementById('apiFetchBtn');
  if (apiFetchBtn) {
    apiFetchBtn.addEventListener('click', fetchCompanyDetails);
  }
});
