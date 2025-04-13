'use client';

import { useState, useEffect } from 'react';
import { useForm } from '@mantine/form';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { login } from '@/services/auth';
import { toast } from 'sonner';
import type { UserData, OrganizationData } from '@/services/auth';

type LoginType = 'donor' | 'organization' | 'admin';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [loginType, setLoginType] = useState<LoginType>('donor');
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'organization') {
      setLoginType('organization');
    }
  }, [searchParams]);

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value: string) => {
        if (!/^\S+@\S+$/.test(value)) {
          return 'Invalid email';
        }
        return null;
      },
      password: (value: string) => (value.length < 6 ? 'Password must be at least 6 characters' : null),
    },
  });

  const handleSubmit = async (values: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      if (loginType === 'admin') {
        if (values.email === 'admin@boxofhope.com' && values.password === 'admin@2025') {
          toast.success('Admin login successful');
          router.push('/dashboard/admin');
        } else {
          throw new Error('Invalid admin credentials');
        }
      } else {
        const userData = await login(values.email, values.password);
        
        // Redirect based on user role
        if (userData.role === 'donor') {
          toast.success('Login successful');
          router.push('/dashboard/donor');
        } else if (userData.role === 'organization') {
          const orgData = userData as OrganizationData;
          if (orgData.status === 'pending') {
            router.push('/status');
            return;
          } else if (orgData.status === 'rejected') {
            throw new Error('Your application has been rejected. Please contact support.');
          }
          toast.success('Login successful');
          router.push('/dashboard/organization');
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'auth/invalid-credential') {
        toast.error('Invalid email or password');
      } else {
        toast.error(error.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FDF8F4]">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-4 sm:px-8 py-4">
        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          <div className="text-[#E86C3A]">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-[#0A2540]">Box of Hope</h1>
        </Link>
      </nav>

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-12 w-full max-w-6xl">
          {/* Left Side - Welcome Message */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden md:flex flex-col justify-center"
          >
            <AnimatePresence mode="wait">
              {loginType === 'donor' && (
                <motion.div
                  key="donor-welcome"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <h2 className="text-4xl font-bold text-[#0A2540]">
                    Welcome back, Donor!
                  </h2>
                  <p className="text-xl text-gray-600">
                    Your generosity makes a difference. Continue your journey of giving and see the impact of your donations.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#E86C3A] flex items-center justify-center text-white">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                      <p className="text-[#0A2540]">Track your donation history</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#E86C3A] flex items-center justify-center text-white">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                      </div>
                      <p className="text-[#0A2540]">View your impact on communities</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {loginType === 'organization' && (
                <motion.div
                  key="org-welcome"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <h2 className="text-4xl font-bold text-[#0A2540]">
                    Welcome back, Organization!
                  </h2>
                  <p className="text-xl text-gray-600">
                    Manage your wishlist and connect with generous donors who want to support your cause.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#E86C3A] flex items-center justify-center text-white">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                      </div>
                      <p className="text-[#0A2540]">Manage your wishlist items</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#E86C3A] flex items-center justify-center text-white">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                        </svg>
                      </div>
                      <p className="text-[#0A2540]">Communicate with donors</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {loginType === 'admin' && (
                <motion.div
                  key="admin-welcome"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <h2 className="text-4xl font-bold text-[#0A2540]">
                    Admin Dashboard
                  </h2>
                  <p className="text-xl text-gray-600">
                    Manage organizations, review applications, and oversee the platform's operations.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#E86C3A] flex items-center justify-center text-white">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="8.5" cy="7" r="4" />
                          <path d="M20 8l2 2-2 2" />
                          <path d="M15 9h7" />
                        </svg>
                      </div>
                      <p className="text-[#0A2540]">Review organization applications</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#E86C3A] flex items-center justify-center text-white">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                      </div>
                      <p className="text-[#0A2540]">Manage platform content</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Right Side - Login Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md mx-auto"
          >
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex justify-center mb-8">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setLoginType('donor')}
                    className={`px-6 py-2 rounded-md transition-colors duration-200 cursor-pointer ${
                      loginType === 'donor'
                        ? 'bg-[#E86C3A] text-white'
                        : 'text-[#0A2540] hover:text-[#E86C3A]'
                    }`}
                  >
                    Donor
                  </button>
                  <button
                    onClick={() => setLoginType('organization')}
                    className={`px-6 py-2 rounded-md transition-colors duration-200 cursor-pointer ${
                      loginType === 'organization'
                        ? 'bg-[#E86C3A] text-white'
                        : 'text-[#0A2540] hover:text-[#E86C3A]'
                    }`}
                  >
                    Organization
                  </button>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-center text-[#0A2540] mb-8">
                {loginType === 'donor' 
                  ? 'Welcome back, Donor!' 
                  : loginType === 'organization'
                  ? 'Welcome back, Organization!'
                  : 'Admin Login'}
              </h2>

              <AnimatePresence mode="wait">
                <motion.form
                  key={loginType}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={form.onSubmit(handleSubmit)}
                  className="space-y-6"
                >
                  {loginType === 'donor' ? (
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-[#0A2540] mb-1">
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E86C3A] focus:border-transparent"
                        {...form.getInputProps('email')}
                      />
                      {form.errors.email && (
                        <p className="mt-1 text-sm text-red-500">{form.errors.email}</p>
                      )}
                    </div>
                  ) : loginType === 'organization' ? (
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-[#0A2540] mb-1">
                        Email Address
                      </label>
                      <input
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E86C3A] focus:border-transparent"
                        {...form.getInputProps('email')}
                      />
                      {form.errors.email && (
                        <p className="mt-1 text-sm text-red-500">{form.errors.email}</p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <label htmlFor="adminEmail" className="block text-sm font-medium text-[#0A2540] mb-1">
                        Admin Email
                      </label>
                      <input
                        id="adminEmail"
                        type="email"
                        placeholder="admin@boxofhope.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E86C3A] focus:border-transparent"
                        {...form.getInputProps('email')}
                      />
                      {form.errors.email && (
                        <p className="mt-1 text-sm text-red-500">{form.errors.email}</p>
                      )}
                    </div>
                  )}

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-[#0A2540] mb-1">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      placeholder={loginType === 'admin' ? 'admin@2025' : 'Your password'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E86C3A] focus:border-transparent"
                      {...form.getInputProps('password')}
                    />
                    {form.errors.password && (
                      <p className="mt-1 text-sm text-red-500">{form.errors.password}</p>
                    )}
                  </div>

                  {loginType === 'admin' && (
                    <div className="text-sm text-gray-500 text-center">
                      Default credentials for testing:
                      <br />
                      Email: admin@boxofhope.com
                      <br />
                      Password: admin@2025
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-[#E86C3A] hover:bg-[#D55C2A] text-white font-medium rounded-md transition-colors duration-200 relative overflow-hidden group cursor-pointer"
                  >
                    <span className="relative z-10">
                      {isLoading ? 'Signing in...' : 'Sign in'}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#D55C2A] to-[#E86C3A] transform translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />
                  </button>
                </motion.form>
              </AnimatePresence>

              {loginType === 'organization' && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-center text-sm font-medium text-[#0A2540] mb-4">
                    Admin Login
                  </h3>
                  <button
                    onClick={() => setLoginType('admin')}
                    className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-[#0A2540] font-medium rounded-md transition-colors duration-200 cursor-pointer"
                  >
                    Switch to Admin Panel
                  </button>
                </div>
              )}

              {loginType !== 'admin' && (
                <p className="mt-6 text-center text-sm text-[#0A2540]">
                  Don&apos;t have an account?{' '}
                  <Link
                    href={`/register?type=${loginType}`}
                    className="text-[#E86C3A] hover:text-[#D55C2A] font-medium underline transition-colors duration-200 cursor-pointer"
                  >
                    Register as {loginType === 'donor' ? 'Donor' : 'Organization'}
                  </Link>
                  {loginType === 'organization' && (
                    <>
                      {' '}or{' '}
                      <Link
                        href="/status"
                        className="text-[#E86C3A] hover:text-[#D55C2A] font-medium underline transition-colors duration-200 cursor-pointer"
                      >
                        check your application status
                      </Link>
                    </>
                  )}
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
} 