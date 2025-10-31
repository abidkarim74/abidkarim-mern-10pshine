import { useState, type ChangeEvent, type FormEvent } from 'react';
import { postRequest } from '../api/requests';
import { useAuth } from '../context/authContext';
import { type SignupFormData } from '../interfaces/AuthInterfaces';
import { type SignupErrors } from '../interfaces/AuthInterfaces';


const Signup = () => {
  const [formData, setFormData] = useState<SignupFormData>({
    firstname: '',
    lastname: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const { setAccessToken } = useAuth();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<SignupErrors>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const validatePassword = (password: string): string | null => {
    if (password.length < 6) return "Password must be at least 6 characters";
    if (!/(?=.*[a-z])/.test(password)) return "Password must contain at least one lowercase letter";
    if (!/(?=.*[A-Z])/.test(password)) return "Password must contain at least one uppercase letter";
    if (!/(?=.*\d)/.test(password)) return "Password must contain at least one number";
    return null;
  };

  const validateField = (name: string, value: string | boolean): string | null => {
    switch (name) {
      case 'firstname':
        if (!value.toString().trim()) return "First name is required";
        if (value.toString().length < 2) return "First name must be at least 2 characters";
        return null;
      
      case 'lastname':
        if (!value.toString().trim()) return "Last name is required";
        if (value.toString().length < 2) return "Last name must be at least 2 characters";
        return null;
      
      case 'username':
        if (!value.toString().trim()) return "Username is required";
        if (value.toString().length < 3) return "Username must be at least 3 characters";
        if (!/^[a-zA-Z0-9_]+$/.test(value.toString())) return "Username can only contain letters, numbers, and underscores";
        return null;
      
      case 'password':
        return validatePassword(value.toString());
      
      case 'confirmPassword':
        if (value !== formData.password) return "Passwords don't match";
        return null;
      
      case 'agreeToTerms':
        if (!value) return "You must agree to the terms and conditions";
        return null;
      
      default:
        return null;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: SignupErrors = {};
    
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof SignupFormData]);
      if (error) {
        newErrors[key as keyof SignupErrors] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: fieldValue
    }));

    if (errors[name as keyof SignupErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }

    if (error) setError(null);
  };

  const handleBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const fieldError = validateField(name, fieldValue);
    if (fieldError) {
      setErrors(prev => ({
        ...prev,
        [name]: fieldError
      }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as { [key: string]: boolean });

    setTouched(allTouched);

    if (!validateForm()) {
      setError("Please fix the errors above");
      return;
    }

    setLoading(true);
    setError(null);

    const endpoint = "/auth/signup";
    const { confirmPassword, ...submitData } = formData;

    try {
      const response = await postRequest(endpoint, submitData);
      console.log('Signup successful:', response);
      setIsSuccess(true);
      
      setAccessToken(response.accessToken);
      setTimeout(() => {
        window.location.assign('/');
      }, 2000);
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Signup failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 via-blue-900 to-crimson-700 px-4 py-8">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 border-t-4 border-[#DC143C] text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-blue-900 mb-2">Account Created Successfully!</h2>
          <p className="text-gray-600 mb-6">Redirecting you to home page...</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 via-blue-900 to-crimson-700 px-4 py-8">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 border-t-4 border-[#DC143C]">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-blue-900">Create Account</h2>
          <p className="text-gray-600 mt-2">Join us today! Fill in your details</p>
        </div>

        {/* General Error */}
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-xl mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="firstname" className="block text-sm font-medium text-blue-900 mb-1">
                First Name
              </label>
              <input
                type="text"
                id="firstname"
                name="firstname"
                value={formData.firstname}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="John"
                required
                className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-crimson-500 focus:border-transparent transition-all duration-200 ${
                  errors.firstname && touched.firstname ? 'border-red-400' : 'border-gray-300'
                }`}
              />
              {errors.firstname && touched.firstname && (
                <p className="text-crimson-600 text-xs mt-1 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.firstname}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="lastname" className="block text-sm font-medium text-blue-900 mb-1">
                Last Name
              </label>
              <input
                type="text"
                id="lastname"
                name="lastname"
                value={formData.lastname}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Doe"
                required
                className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-crimson-500 focus:border-transparent transition-all duration-200 ${
                  errors.lastname && touched.lastname ? 'border-red-400' : 'border-gray-300'
                }`}
              />
              {errors.lastname && touched.lastname && (
                <p className="text-crimson-600 text-xs mt-1 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.lastname}
                </p>
              )}
            </div>
          </div>

          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-blue-900 mb-1">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="jane123"
              required
              className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-crimson-500 focus:border-transparent transition-all duration-200 ${
                errors.username && touched.username ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            {errors.username && touched.username && (
              <p className="text-crimson-600 text-xs mt-1 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.username}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-blue-900 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your password"
              required
              minLength={6}
              className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-crimson-500 focus:border-transparent transition-all duration-200 ${
                errors.password && touched.password ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            <p className="text-xs text-gray-500 mt-1">
              Must be at least 6 characters with uppercase, lowercase, and number
            </p>
            {errors.password && touched.password && (
              <p className="text-crimson-600 text-xs mt-1 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-blue-900 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Confirm your password"
              required
              className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-crimson-500 focus:border-transparent transition-all duration-200 ${
                errors.confirmPassword && touched.confirmPassword ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            {errors.confirmPassword && touched.confirmPassword && (
              <p className="text-crimson-600 text-xs mt-1 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.confirmPassword}
              </p>
            )}
          </div>


          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-700 to-[#DC143C] text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-crimson-500 focus:ring-offset-2 disabled:opacity-50 mt-4"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                Creating Account...
              </div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-600 text-sm">
            Already have an account?{' '}
            <a href="/login" className="text-crimson-600 hover:text-crimson-700 font-medium transition-colors duration-200">
              Sign in
            </a>
          </p>
        </div>

        
      </div>
    </div>
  );
};

export default Signup;