import React from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import RegisterForm from './RegisterForm';

interface LoginFormState {
  email: string;
  password: string;
  showPassword: boolean;
  isSubmitting: boolean;
  errors: {
    email?: string;
    password?: string;
    general?: string;
  };
}

export class LoginForm extends React.Component<{}, LoginFormState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      email: '',
      password: '',
      showPassword: false,
      isSubmitting: false,
      errors: {}
    };
  }

  private validateForm = (): boolean => {
    const errors: LoginFormState['errors'] = {};

    if (!this.state.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(this.state.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!this.state.password) {
      errors.password = 'Password is required';
    }

    this.setState({ errors });
    return Object.keys(errors).length === 0;
  };

  private handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!this.validateForm()) {
      return;
    }

    this.setState({ isSubmitting: true, errors: {} });

    try {
      // Note: We'll need to use the hook in a functional component wrapper
      // For now, this is the structure - we'll create a wrapper component
      console.log('Login attempt:', { email: this.state.email, password: this.state.password });
    } catch (error: any) {
      this.setState({
        errors: { general: error.message }
      });
    } finally {
      this.setState({ isSubmitting: false });
    }
  };

  private handleInputChange = (field: keyof Pick<LoginFormState, 'email' | 'password'>) => 
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      this.setState({
        [field]: e.target.value,
        errors: { ...this.state.errors, [field]: undefined }
      } as any);
    };

  private togglePasswordVisibility = (): void => {
    this.setState({ showPassword: !this.state.showPassword });
  };

  public render(): React.ReactNode {
    const { email, password, showPassword, isSubmitting, errors } = this.state;

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="mx-auto h-20 w-20 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-100">
              <img 
                src="/yc (1).png" 
                alt="Yeshua Cleaning" 
                className="h-16 w-16 object-contain"
              />
            </div>
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Welcome back to Yeshua Cleaning Dashboard
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={this.handleSubmit}>
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {errors.general}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={this.handleInputChange('email')}
                    className={`appearance-none relative block w-full pl-10 pr-3 py-3 border ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={this.handleInputChange('password')}
                    className={`appearance-none relative block w-full pl-10 pr-12 py-3 border ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={this.togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <button
                  type="button"
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Forgot your password?
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Contact your administrator
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

// Functional wrapper component to use the hook
export const LoginFormWithAuth: React.FC = () => {
  const { login, loginWithGoogle, loading, error } = useAuth();
  const [showRegister, setShowRegister] = React.useState(false);

  if (showRegister) {
    return (
      <RegisterFormWrapper onSwitchToLogin={() => setShowRegister(false)} />
    );
  }

  return (
    <LoginFormWrapper 
      onLogin={login} 
      onLoginWithGoogle={loginWithGoogle}
      onSwitchToRegister={() => setShowRegister(true)}
      loading={loading} 
      error={error} 
    />
  );
};

// Wrapper component that passes auth functions to the class component
interface LoginFormWrapperProps {
  onLogin: (credentials: { email: string; password: string }) => Promise<void>;
  onLoginWithGoogle: () => Promise<void>;
  onSwitchToRegister: () => void;
  loading: boolean;
  error: string | null;
}

interface RegisterFormWrapperProps {
  onSwitchToLogin: () => void;
}

const RegisterFormWrapper: React.FC<RegisterFormWrapperProps> = ({ onSwitchToLogin }) => {
  return <RegisterForm onSwitchToLogin={onSwitchToLogin} />;
};

const LoginFormWrapper: React.FC<LoginFormWrapperProps> = ({ onLogin, onLoginWithGoogle, onSwitchToRegister, loading, error }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-20 w-20 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-100">
            <img 
              src="/yc (1).png" 
              alt="Yeshua Cleaning" 
              className="h-16 w-16 object-contain"
            />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Welcome back to Yeshua Cleaning Dashboard
          </p>
        </div>

        <LoginFormContent 
          onLogin={onLogin} 
          onLoginWithGoogle={onLoginWithGoogle}
          onSwitchToRegister={onSwitchToRegister}
          loading={loading} 
          error={error} 
        />
      </div>
    </div>
  );
};

// Functional component for the form content
const LoginFormContent: React.FC<LoginFormWrapperProps> = ({ onLogin, onLoginWithGoogle, onSwitchToRegister, loading, error }) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [errors, setErrors] = React.useState<{ email?: string; password?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onLogin({ email, password });
    } catch (error) {
      // Error is handled by the useAuth hook
    }
  };

  const handleGoogleSignIn = async (): Promise<void> => {
    try {
      await onLoginWithGoogle();
    } catch (error) {
      // Error is handled by the useAuth hook
    }
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Google Sign In Button */}
      <div>
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="group relative w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {loading ? 'Signing in...' : 'Continue with Google'}
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-gray-50 text-gray-500">Or continue with email</span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors({ ...errors, email: undefined });
              }}
              className={`appearance-none relative block w-full pl-10 pr-3 py-3 border ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
              placeholder="Enter your email"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors({ ...errors, password: undefined });
              }}
              className={`appearance-none relative block w-full pl-10 pr-12 py-3 border ${
                errors.password ? 'border-red-300' : 'border-gray-300'
              } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
              placeholder="Enter your password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
            Remember me
          </label>
        </div>

        <div className="text-sm">
          <button
            type="button"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Forgot your password?
          </button>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Signing in...
            </div>
          ) : (
            'Sign in'
          )}
        </button>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Create account
          </button>
        </p>
      </div>
    </form>
  );
};
