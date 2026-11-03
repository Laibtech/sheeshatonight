'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Loader2, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { setSessionCookie } from '@/lib/session';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setLoggedIn, setUserRole, setUserData } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [requestedRole, setRequestedRole] = useState<string | null>(null);

  useEffect(() => {
    const role = searchParams?.get('role');
    setRequestedRole(role);
  }, [searchParams]);

  const performLogin = async (loginEmail: string, loginPass: string) => {
    setError('');

    const normalizedEmail = loginEmail.trim().toLowerCase();
    const trimmedPassword = loginPass.trim();

    if (!normalizedEmail) {
      setError('Please enter your email address.');
      return;
    }

    if (!trimmedPassword) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email: normalizedEmail, password: trimmedPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setError('Invalid email or password. Please verify your credentials and try again.');
        } else {
          setError(data.error || 'Unable to log in. Please check your details and try again.');
        }
        setLoading(false);
        return;
      }

      const { user, token, vendor } = data;

      if (token) {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_role', user.role);
        localStorage.setItem('user_email', user.email);
        localStorage.setItem('user_name', user.name || 'User');
        
        const activeVendorName = vendor?.name || user.vendorName;
        if (user.role === 'VENDOR' && activeVendorName) {
          localStorage.setItem('vendor_name', activeVendorName);
        } else {
          localStorage.removeItem('vendor_name');
        }

        if (typeof document !== 'undefined') {
          const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
          document.cookie = `auth_token=${encodeURIComponent(token)}; path=/; expires=${expires}; SameSite=Lax`;
          document.cookie = `user_role=${encodeURIComponent(user.role)}; path=/; expires=${expires}; SameSite=Lax`;
          document.cookie = `user_email=${encodeURIComponent(user.email)}; path=/; expires=${expires}; SameSite=Lax`;
          document.cookie = `user_name=${encodeURIComponent(user.name || 'User')}; path=/; expires=${expires}; SameSite=Lax`;
          if (user.role === 'VENDOR' && activeVendorName) {
            document.cookie = `vendor_name=${encodeURIComponent(activeVendorName)}; path=/; expires=${expires}; SameSite=Lax`;
          } else {
            document.cookie = `vendor_name=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
          }
          document.cookie = `user_logged_in=true; path=/; expires=${expires}; SameSite=Lax`;
        }
      }

      setUserData({
        email: user.email,
        name: user.name,
      });
      setUserRole(user.role);
      setLoggedIn(true);

      setSessionCookie({
        role: user.role,
        email: user.email,
        name: user.name,
        region: 'Dubai, UAE',
      });

      const roleRoutes: Record<string, string> = {
        CUSTOMER: '/dashboard',
        VENDOR: '/vendor',
        ADMIN: '/admin',
        SUPER_ADMIN: '/admin',
      };

      const redirectParam = searchParams?.get('redirect');
      let targetPath = roleRoutes[user.role] || '/dashboard';

      // Smart role-based redirect validation: avoid trapping admin in customer routes
      if (redirectParam) {
        if ((user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && redirectParam.startsWith('/admin')) {
          targetPath = redirectParam;
        } else if (user.role === 'VENDOR' && redirectParam.startsWith('/vendor')) {
          targetPath = redirectParam;
        } else if (user.role === 'CUSTOMER' && (redirectParam.startsWith('/dashboard') || redirectParam.startsWith('/cart') || redirectParam.startsWith('/checkout') || redirectParam.startsWith('/orders'))) {
          targetPath = redirectParam;
        }
      }
      
      // Perform full browser navigation to ensure all server layouts and auth cookies re-evaluate cleanly
      setTimeout(() => {
        window.location.href = targetPath;
      }, 150);
    } catch (err) {
      console.error('Login error:', err);
      setError('Unable to connect. Please check your backend server / internet connection.');
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await performLogin(email, password);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Simple Header with Logo and Back to Web */}
      <header className="bg-white border-b border-slate-200 py-4 px-6">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center">
            <img
              src="/logo.png"
              alt="SheeshaTonight"
              className="h-10 w-auto object-contain"
              style={{ height: '40px', maxHeight: '40px', width: 'auto', objectFit: 'contain', display: 'block' }}
            />
          </a>
          <a
            href="/"
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:text-[#8a277d] transition-colors"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span>Back to Web</span>
          </a>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center bg-gradient-to-b from-purple-950/5 via-slate-50 to-slate-100 dark:from-purple-950/20 dark:via-[#0b0b10] dark:to-[#08080c] relative overflow-hidden transition-colors duration-200">
        {/* Subtle Brand Background Accents */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-900/10 dark:bg-purple-600/15 rounded-full blur-3xl opacity-60" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl opacity-40" />
        </div>

        <div className="w-full max-w-md relative z-10">
          {/* Header Badge & Title */}
          <div className="text-center mb-8">
            <span className="inline-block text-[#8a277d] dark:text-[#a83ca0] text-xs font-extrabold uppercase tracking-[2px] mb-2">
              WELCOME BACK
            </span>
            
            {/* SheeshaTonight Signature Gold Ornament */}
            <div className="gold-line flex items-center justify-center gap-1.5 my-2">
              <i className="w-6 h-[1px] bg-[#f5b83d]" />
              <b className="w-1.5 h-1.5 bg-[#f5b83d] rounded-full" />
              <i className="w-6 h-[1px] bg-[#f5b83d]" />
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
              Sign In To <span className="text-[#8a277d] dark:text-[#f5b83d]">SheeshaTonight</span>
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Access your premium sheesha rentals, bookings, & marketplace orders
            </p>
          </div>

          {/* Card Container */}
          <div className="bg-white dark:bg-[#12121a] border border-[#e9e4eb] dark:border-white/10 rounded-2xl shadow-xl p-6 sm:p-8 backdrop-blur-sm transition-colors duration-200">
            {/* Requested Role Badge */}
            {requestedRole && (
              <div className="mb-6 p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 rounded-xl flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#8a277d] dark:text-[#f5b83d] flex-shrink-0" />
                <p className="text-xs text-purple-950 dark:text-purple-200">
                  Logging in for access to <span className="font-bold uppercase text-[#8a277d] dark:text-[#f5b83d]">{requestedRole}</span> portal
                </p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Email Address <span className="text-[#8a277d]">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8a277d]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Enter your email address"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-[#181824] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-[#8a277d] focus:ring-4 focus:ring-[#8a277d]/10 transition-all font-medium"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Password <span className="text-[#8a277d]">*</span>
                  </label>
                  <a
                    href="/forgot-password"
                    className="text-xs font-semibold text-[#8a277d] dark:text-[#f5b83d] hover:text-[#641c5f] dark:hover:text-[#e0a634] transition-colors"
                  >
                    Forgot Password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8a277d]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Enter your password"
                    className="w-full pl-11 pr-12 py-3 bg-slate-50 dark:bg-[#181824] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-[#8a277d] focus:ring-4 focus:ring-[#8a277d]/10 transition-all font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#8a277d] transition-colors p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Error Box */}
              {error && (
                <div className="p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 rounded-xl">
                  <p className="text-red-700 dark:text-red-300 text-xs font-medium leading-relaxed">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full py-3.5 px-6 bg-[#8a277d] hover:bg-[#641c5f] active:bg-[#52154e] text-white font-bold rounded-xl shadow-lg shadow-purple-900/20 hover:shadow-purple-900/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm tracking-wide"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer Divider & Signup Prompt */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/10 text-center">
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Don&apos;t have an account?{' '}
                <button
                  onClick={() => router.push(requestedRole ? `/auth/signup?role=${requestedRole}` : '/auth/signup')}
                  className="text-[#8a277d] dark:text-[#f5b83d] hover:text-[#641c5f] dark:hover:text-[#e0a634] font-bold underline underline-offset-4 ml-1 transition-colors"
                >
                  Create Account
                </button>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="w-10 h-10 text-[#8a277d] animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
