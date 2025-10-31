import { useState, type ChangeEvent, type FormEvent } from 'react';
import { postRequest } from '../api/requests';
import { useNavigate } from 'react-router-dom';


interface LoginFormData {
  username: string;
  password: string;
  rememberMe: boolean;
}

interface LoginErrors {
  username?: string;
  password?: string;
  general?: string;
}


import { useAuth } from '../context/authContext';

const Login = () => {
  const { setAccessToken } = useAuth();
  
  const { setUser } = useAuth();

  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
    rememberMe: false
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const validateField = (name: string, value: string | boolean): string | null => {
    switch (name) {
      case 'username':
        if (!value.toString().trim()) return "Username is required";
        return null;
      
      case 'password':
        if (!value.toString().trim()) return "Password is required";
        if (value.toString().length < 6) return "Password must be at least 6 characters";
        return null;
      
      default:
        return null;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: LoginErrors = {};
    
    Object.keys(formData).forEach(key => {
      if (key !== 'rememberMe') { 
        const error = validateField(key, formData[key as keyof LoginFormData]);
        if (error) {
          newErrors[key as keyof LoginErrors] = error;
        }
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

    // Clear error when user starts typing
    if (errors[name as keyof LoginErrors]) {
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
    
    // Mark all fields as touched
    const allTouched = {
      username: true,
      password: true,
      rememberMe: true
    };
    setTouched(allTouched);

    if (!validateForm()) {
      setError("Please fix the errors above");
      return;
    }

    setLoading(true);
    setError(null);

    const endpoint = "/auth/login";

    try {
      const response = await postRequest(endpoint, formData);
    
      console.log('Login successful:', response);
      
      if (formData.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }

      setAccessToken(response.accessToken);
      
      window.location.assign('/');
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 via-blue-900 to-crimson-700 px-4 py-8">
  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 border-t-4 border-[#DC143C]">
    
    {/* Header */}
    <div className="text-center mb-8">
      <h2 className="text-3xl font-bold text-blue-900">Welcome Back</h2>
      <p className="text-gray-600 mt-2">Please sign in to your account</p>
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
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>

      {/* Username */}
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-blue-900 mb-2">
          Username
        </label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Enter your username"
          required
          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-crimson-500 focus:border-transparent transition-all duration-200 ${
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
        <label htmlFor="password" className="block text-sm font-medium text-blue-900 mb-2">
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
          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-crimson-500 focus:border-transparent transition-all duration-200 ${
            errors.password && touched.password ? 'border-red-400' : 'border-gray-300'
          }`}
        />
        {errors.password && touched.password && (
          <p className="text-crimson-600 text-xs mt-1 flex items-center">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {errors.password}
          </p>
        )}
      </div>

      {/* Remember / Forgot */}
      <div className="flex items-center justify-between">
        <label className="flex items-center cursor-pointer">
          <input type="checkbox" name="rememberMe" checked={formData.rememberMe} onChange={handleChange} className="hidden" />
          <div className={`w-5 h-5 border-2 rounded-md mr-3 flex items-center justify-center transition-all duration-200 ${
            formData.rememberMe ? 'bg-blue-700 border-blue-700' : 'border-gray-300'
          }`}>
            {formData.rememberMe && (
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <span className="text-blue-900 text-sm">Remember me</span>
        </label>
        <a href="/forgot-password" className="text-crimson-600 hover:text-crimson-700 text-sm font-medium transition-colors duration-200">
          Forgot password?
        </a>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-700 to-[#DC143C] text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-crimson-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div>
            Signing In...
          </div>
        ) : (
          'Sign In'
        )}
      </button>
    </form>

    {/* Footer */}
    <div className="text-center mt-6">
      <p className="text-gray-600 text-sm">
        Don't have an account?{' '}
        <a href="/signup" className="text-crimson-600 hover:text-crimson-700 font-medium transition-colors duration-200">
          Sign up
        </a>
      </p>
    </div>

    {/* Divider */}
    


  </div>
</div>

  );
};

export default Login;