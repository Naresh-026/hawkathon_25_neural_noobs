'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useForm } from '@mantine/form';
import { getUserByEmail } from '@/services/auth';
import type { UserData } from '@/services/auth';
import { useRouter } from 'next/navigation';

type StatusStep = 'submitted' | 'review' | 'pending' | 'accepted';

const statusSteps: { [key in StatusStep]: { title: string; description: string; color: string } } = {
  submitted: {
    title: 'Application Submitted',
    description: 'Your application has been successfully submitted. We will review it shortly.',
    color: 'bg-blue-50 border-blue-200 text-blue-800'
  },
  review: {
    title: 'Application in Review',
    description: 'Our team is currently reviewing your application. This process typically takes 2-3 business days.',
    color: 'bg-yellow-50 border-yellow-200 text-yellow-800'
  },
  pending: {
    title: 'Decision Pending',
    description: 'Your application is in the final review stage. We will notify you once a decision is made.',
    color: 'bg-purple-50 border-purple-200 text-purple-800'
  },
  accepted: {
    title: 'Application Accepted',
    description: 'Congratulations! Your organization has been approved. You can now log in to your dashboard.',
    color: 'bg-green-50 border-green-200 text-green-800'
  }
};

export default function ApplicationStatus() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm({
    initialValues: {
      email: '',
    },
    validate: {
      email: (value) => {
        if (!value) return 'Email is required';
        if (!/^\S+@\S+$/.test(value)) return 'Invalid email format';
        return null;
      },
    },
  });

  const handleCheckStatus = async (values: { email: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const userData = await getUserByEmail(values.email);
      if (!userData) {
        setError('No application found with this email address.');
        return;
      }
      
      if (userData.role === 'donor') {
        // Redirect donors to their dashboard
        router.push('/dashboard/donor');
        return;
      }
      
      if (userData.role !== 'organization') {
        setError('This email is not associated with an organization account.');
        return;
      }
      
      setUser(userData);
    } catch (error) {
      console.error('Error checking status:', error);
      setError('Failed to check application status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusStep = (status: string | undefined): StatusStep => {
    switch (status) {
      case 'pending':
        return 'review';
      case 'approved':
        return 'accepted';
      case 'rejected':
        return 'pending';
      default:
        return 'submitted';
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF8F4]">
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
        <div className="w-full max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-[#0A2540] mb-6">Check Application Status</h2>

            {!user ? (
              <form onSubmit={form.onSubmit(handleCheckStatus)} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#0A2540] mb-1">
                    Organization Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your organization email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E86C3A] focus:border-transparent"
                    {...form.getInputProps('email')}
                  />
                  {form.errors.email && (
                    <p className="mt-1 text-sm text-red-500">{form.errors.email}</p>
                  )}
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-[#E86C3A] hover:bg-[#D55C2A] text-white font-medium rounded-md transition-colors duration-200 relative overflow-hidden group cursor-pointer"
                >
                  <span className="relative z-10">
                    {isLoading ? 'Checking...' : 'Check Status'}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#D55C2A] to-[#E86C3A] transform translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />
                </button>
              </form>
            ) : (
              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#0A2540]">Organization Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Organization Name</p>
                      <p className="font-medium">{user.organizationName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Contact Person</p>
                      <p className="font-medium">{user.contactPerson}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Contact Phone</p>
                      <p className="font-medium">{user.contactPhone}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#0A2540]">Application Status</h3>
                  <div className="space-y-4">
                    {Object.entries(statusSteps).map(([step, { title, description, color }], index) => {
                      const currentStep = getStatusStep(user.status);
                      const isActive = step === currentStep;
                      const isCompleted = Object.keys(statusSteps).indexOf(step) < 
                                        Object.keys(statusSteps).indexOf(currentStep);

                      return (
                        <div
                          key={step}
                          className={`flex items-start gap-4 p-4 rounded-lg border ${
                            isActive ? color : isCompleted ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            isActive ? 'bg-current text-white' : isCompleted ? 'bg-gray-200' : 'bg-gray-100'
                          }`}>
                            {isCompleted ? (
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <span className="text-sm font-medium">{index + 1}</span>
                            )}
                          </div>
                          <div>
                            <h4 className={`font-medium ${isActive ? 'text-current' : isCompleted ? 'text-gray-600' : 'text-gray-400'}`}>
                              {title}
                            </h4>
                            <p className={`text-sm ${isActive ? 'text-current' : isCompleted ? 'text-gray-500' : 'text-gray-400'}`}>
                              {description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {user.status === 'approved' && (
                  <div className="border-t border-gray-200 pt-6">
                    <Link
                      href="/dashboard/organization"
                      className="w-full py-3 px-4 bg-[#E86C3A] hover:bg-[#D55C2A] text-white font-medium rounded-md transition-colors duration-200 text-center block"
                    >
                      Go to Dashboard
                    </Link>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
} 