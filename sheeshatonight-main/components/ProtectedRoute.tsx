'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserRole } from '@/lib/store';
import { Loader2, Store, ShieldAlert, ArrowRight, ShieldCheck, User, LayoutDashboard, LogIn } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

function getInitialAuth(allowedRoles: UserRole[]) {
  if (typeof document === 'undefined') {
    return { isAuthorized: false, isChecking: true };
  }

  try {
    const cookies = document.cookie.split(';').reduce<Record<string, string>>((acc, cookie) => {
      const [rawName, rawValue] = cookie.split('=');
      if (!rawName || !rawValue) return acc;
      try {
        acc[rawName.trim()] = decodeURIComponent(rawValue.trim());
      } catch {
        acc[rawName.trim()] = rawValue.trim();
      }
      return acc;
    }, {});

    const role = (cookies.user_role as UserRole) || (localStorage.getItem('user_role') as UserRole);
    const token = localStorage.getItem('auth_token') || cookies.auth_token;

    if (token && role && allowedRoles.includes(role)) {
      return { isAuthorized: true, isChecking: false };
    }
  } catch {
    // Ignore storage/cookie parsing errors
  }

  return { isAuthorized: false, isChecking: true };
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [unauthorizedState, setUnauthorizedState] = useState<{
    role: UserRole;
    email: string;
    targetRole: string;
  } | null>(null);

  const rolesKey = allowedRoles.join(',');

  useEffect(() => {
    let isMounted = true;
    setMounted(true);

    const verifyAccess = async () => {
      try {
        const initial = getInitialAuth(allowedRoles);
        if (initial.isAuthorized) {
          if (isMounted) {
            setIsAuthorized(true);
            setIsChecking(false);
          }
          return;
        }

        const parseCookies = () => {
          if (typeof document === 'undefined') return {};
          return document.cookie.split(';').reduce<Record<string, string>>((acc, cookie) => {
            const [rawName, rawValue] = cookie.split('=');
            if (!rawName || !rawValue) return acc;
            try {
              acc[rawName.trim()] = decodeURIComponent(rawValue.trim());
            } catch {
              acc[rawName.trim()] = rawValue.trim();
            }
            return acc;
          }, {});
        };

        const cookies = parseCookies();
        const storedToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        const token = storedToken || cookies.auth_token || null;
        let currentRole = cookies.user_role as UserRole | undefined;
        let userEmail = cookies.user_email || '';

        // Verify with server API /api/auth/me to get authoritative database user role
        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch('/api/auth/me', { headers, credentials: 'include', cache: 'no-store' });

        if (res.ok) {
          const resData = await res.json();
          const serverUser = resData.data || resData.user;
          if (serverUser && serverUser.role) {
            currentRole = serverUser.role as UserRole;
            userEmail = serverUser.email || '';
            // Sync cookie and localStorage for client middleware
            if (typeof window !== 'undefined') {
              if (token) {
                localStorage.setItem('auth_token', token);
                document.cookie = `auth_token=${encodeURIComponent(token)}; path=/; max-age=604800;`;
              }
              localStorage.setItem('user_role', currentRole);
              document.cookie = `user_role=${encodeURIComponent(currentRole)}; path=/; max-age=604800;`;
              document.cookie = `user_email=${encodeURIComponent(userEmail)}; path=/; max-age=604800;`;
              document.cookie = `user_name=${encodeURIComponent(serverUser.name || 'User')}; path=/; max-age=604800;`;
            }
          }
        } else if (!currentRole && !token) {
          // Unauthenticated -> redirect to login with intended redirect parameter
          if (isMounted) {
            setIsChecking(false);
            setIsAuthorized(false);
            const redirectUrl = typeof window !== 'undefined' ? window.location.pathname : '/dashboard';
            router.replace(`/auth/login?redirect=${encodeURIComponent(redirectUrl)}`);
          }
          return;
        }

        // Fallback check against cookie/localStorage if server call didn't return
        if (!currentRole && cookies.user_role) {
          currentRole = cookies.user_role as UserRole;
        }

        if (!currentRole) {
          if (isMounted) {
            setIsChecking(false);
            setIsAuthorized(false);
            router.replace('/auth/login');
          }
          return;
        }

        // Check if role is allowed
        if (!allowedRoles.includes(currentRole)) {
          if (isMounted) {
            setIsChecking(false);
            setIsAuthorized(false);
            setUnauthorizedState({
              role: currentRole,
              email: userEmail,
              targetRole: allowedRoles.includes('VENDOR') ? 'VENDOR' : allowedRoles.includes('ADMIN') ? 'ADMIN' : 'AUTHORIZED',
            });
          }
          return;
        }

        // Authorization success
        if (isMounted) {
          setIsAuthorized(true);
          setIsChecking(false);
        }
      } catch (error) {
        console.error('Auth verification error:', error);
        // If not already authorized optimistically, redirect to login
        if (isMounted && !isAuthorized) {
          setIsChecking(false);
          router.replace('/auth/login');
        }
      }
    };

    verifyAccess();

    return () => {
      isMounted = false;
    };
  }, [router, rolesKey, isAuthorized]);

  if (!mounted || (isChecking && !isAuthorized && !unauthorizedState)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[#74189B] animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-semibold tracking-wide uppercase">Opening Page...</p>
        </div>
      </div>
    );
  }

  // Clear Access Denied & Vendor Registration CTA
  if (unauthorizedState) {
    if (unauthorizedState.targetRole === 'VENDOR') {
      return (
        <div className="min-h-screen bg-gradient-to-b from-purple-950/5 via-slate-50 to-slate-100 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-[#e9e4eb] rounded-3xl shadow-2xl p-7 sm:p-9 text-center relative overflow-hidden backdrop-blur-sm">
            {/* Ambient Brand Glow */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-purple-900/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-[11px] font-bold uppercase tracking-wider mb-5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              <span>Vendor Access Required</span>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#74189B]/10 to-amber-500/10 border border-[#74189B]/20 flex items-center justify-center mx-auto mb-4 text-[#74189B]">
              <Store className="w-8 h-8" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Vendor Portal Access
            </h1>

            <p className="mt-3 text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
              You are currently signed in as a <strong className="text-slate-800 font-semibold">Customer</strong>
              {unauthorizedState.email ? ` (${unauthorizedState.email})` : ''}.
              This portal is reserved for verified SheeshaTonight lounge owners, caterers, and suppliers to manage products, rentals, and bookings.
            </p>

            {/* Partner Benefits Box */}
            <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-purple-50/80 to-amber-50/60 border border-purple-100/80 text-left">
              <div className="flex items-center gap-2 mb-1.5">
                <ShieldCheck className="w-4 h-4 text-[#74189B]" />
                <p className="text-xs font-bold text-[#74189B] uppercase tracking-wider">
                  Partner With SheeshaTonight
                </p>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                List your luxury sheesha rental packages, retail tobacco, and event catering services to reach verified clients across Dubai and the UAE.
              </p>
            </div>

            {/* CTAs */}
            <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
              <Link
                href="/auth/signup?role=vendor"
                className="w-full sm:flex-1 py-3.5 px-5 bg-[#74189B] hover:bg-[#5b127a] text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-900/20 hover:shadow-purple-900/30 transition-all flex items-center justify-center gap-2 tracking-wide"
              >
                <span>Apply to Become a Vendor</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/vendors"
                className="w-full sm:flex-1 py-3.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <Store className="w-4 h-4" />
                <span>Explore Verified Vendors</span>
              </Link>
            </div>

            {/* Navigation Helpers */}
            <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1 hover:text-[#74189B] font-semibold transition-colors"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Go to Customer Dashboard</span>
              </Link>

              <Link
                href="/auth/login?role=vendor&redirect=/vendor"
                className="inline-flex items-center gap-1 text-[#74189B] hover:underline font-semibold transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In as Vendor</span>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    // Default Access Denied for Admin or Other Roles
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-xl p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-4 text-amber-600">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Access Restricted</h1>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed">
            This area requires {unauthorizedState.targetRole} authorization.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link
              href="/dashboard"
              className="py-2.5 px-4 bg-[#74189B] text-white text-xs font-bold rounded-xl shadow-md hover:bg-[#5b127a] transition"
            >
              Back to Dashboard
            </Link>
            <Link
              href="/"
              className="py-2.5 px-4 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
