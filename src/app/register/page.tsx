'use client';

import { useState } from 'react';
import { useForm } from '@mantine/form';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { registerDonor, registerOrganization } from '@/services/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

type RegistrationType = 'donor' | 'organization';

interface DonorFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  preferences: {
    categories: string[];
    maxDistance: number;
  };
}

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const type = searchParams.get('type') as RegistrationType || 'donor';
  const router = useRouter();

  const donorForm = useForm({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      location: {
        latitude: 0,
        longitude: 0,
        address: ''
      },
      preferences: {
        categories: [] as string[],
        maxDistance: 50
      }
    },
    validate: {
      name: (value) => {
        if (!value) return 'Name is required';
        if (value.length < 2) return 'Name must be at least 2 characters';
        return null;
      },
      email: (value) => {
        if (!value) return 'Email is required';
        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) return 'Invalid email format';
        return null;
      },
      password: (value) => {
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter';
        if (!/[0-9]/.test(value)) return 'Password must contain at least one number';
        return null;
      },
      confirmPassword: (value, values) => {
        if (!value) return 'Please confirm your password';
        if (value !== values.password) return 'Passwords do not match';
        return null;
      },
    },
  });

  const organizationForm = useForm({
    initialValues: {
      organizationName: '',
      email: '',
      password: '',
      address: '',
      description: '',
      website: '',
      contactPerson: '',
      contactPhone: '',
    },
    validate: {
      organizationName: (value) => {
        if (!value) return 'Organization name is required';
        if (value.length < 2) return 'Organization name must be at least 2 characters';
        return null;
      },
      email: (value) => {
        if (!value) return 'Email is required';
        if (!/^\S+@\S+$/.test(value)) return 'Invalid email format';
        return null;
      },
      password: (value) => {
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return null;
      },
      address: (value) => {
        if (!value) return 'Address is required';
        return null;
      },
      description: (value) => {
        if (!value) return 'Description is required';
        if (value.length < 20) return 'Description must be at least 20 characters';
        return null;
      },
      contactPerson: (value) => {
        if (!value) return 'Contact person is required';
        return null;
      },
      contactPhone: (value) => {
        if (!value) return 'Contact phone is required';
        return null;
      },
    },
  });

  const handleDonorSubmit = async (values: typeof donorForm.values) => {
    setIsLoading(true);
    setError('');

    try {
      // Get location if not already set
      if (!values.location.latitude || !values.location.longitude) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        const { latitude, longitude } = position.coords;
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const data = await response.json();
        
        values.location = {
          latitude,
          longitude,
          address: data.display_name || 'Unknown location'
        };
      }

      // Register donor
      await registerDonor(
        values.email.trim(),
        values.password,
        values.name,
        values.location,
        values.preferences
      );

      router.push('/dashboard/donor');
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.code === 'auth/invalid-email') {
        setError('Please enter a valid email address');
      } else if (error.code === 'auth/email-already-in-use') {
        setError('This email is already registered');
      } else {
        setError(error.message || 'Failed to create account');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrganizationSubmit = async (values: typeof organizationForm.values) => {
    setIsLoading(true);
    try {
      const { email, password, ...orgData } = values;
      await registerOrganization(email, password, {
        organizationName: orgData.organizationName,
        address: orgData.address,
        description: orgData.description,
        website: orgData.website,
        contactPerson: orgData.contactPerson,
        contactPhone: orgData.contactPhone
      });
      // Show success message and inform about admin review
      alert('Your organization registration has been submitted for review. You can check your application status at any time.');
      window.location.href = '/status';
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.code === 'auth/invalid-email') {
        setError('Please enter a valid email address');
      } else if (error.code === 'auth/email-already-in-use') {
        setError('This email is already registered');
      } else {
        setError(error.message || 'Failed to create account');
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
          {/* Left Side - Quote */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden md:flex flex-col justify-center"
          >
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-[#0A2540]">
                {type === 'donor' 
                  ? '"The best way to find yourself is to lose yourself in the service of others."'
                  : '"Alone we can do so little; together we can do so much."'}
              </h2>
              <p className="text-xl text-gray-600">
                {type === 'donor' ? '- Mahatma Gandhi' : '- Helen Keller'}
              </p>
              <div className="space-y-4">
                {type === 'donor' ? (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#E86C3A] flex items-center justify-center text-white">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                      <p className="text-[#0A2540]">Make a difference in someone's life</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#E86C3A] flex items-center justify-center text-white">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                      </div>
                      <p className="text-[#0A2540]">Join a community of generous donors</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#E86C3A] flex items-center justify-center text-white">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                        </svg>
                      </div>
                      <p className="text-[#0A2540]">Create meaningful connections</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#E86C3A] flex items-center justify-center text-white">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                      </div>
                      <p className="text-[#0A2540]">Connect with generous donors</p>
                    </div>
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
                      <p className="text-[#0A2540]">Get support for your cause</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right Side - Registration Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-center text-[#0A2540] mb-8">
                {type === 'donor' ? 'Create Your Donor Account' : 'Register Your Organization'}
              </h2>

              {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
                  {error}
                </div>
              )}

              {type === 'donor' ? (
                <form onSubmit={donorForm.onSubmit(handleDonorSubmit)} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-[#0A2540] mb-1">
                      Full Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E86C3A] focus:border-transparent"
                      {...donorForm.getInputProps('name')}
                    />
                    {donorForm.errors.name && (
                      <p className="mt-1 text-sm text-red-500">{donorForm.errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-[#0A2540] mb-1">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E86C3A] focus:border-transparent"
                      {...donorForm.getInputProps('email')}
                    />
                    {donorForm.errors.email && (
                      <p className="mt-1 text-sm text-red-500">{donorForm.errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-[#0A2540] mb-1">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      placeholder="Create a password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E86C3A] focus:border-transparent"
                      {...donorForm.getInputProps('password')}
                    />
                    {donorForm.errors.password && (
                      <p className="mt-1 text-sm text-red-500">{donorForm.errors.password}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#0A2540] mb-1">
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E86C3A] focus:border-transparent"
                      {...donorForm.getInputProps('confirmPassword')}
                    />
                    {donorForm.errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-500">{donorForm.errors.confirmPassword}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="categories" className="block text-sm font-medium text-gray-700">
                      Preferred Donation Categories
                    </label>
                    <div className="mt-2 space-y-2">
                      {['Food', 'Clothing', 'Books', 'Toys', 'Electronics', 'Furniture'].map((category) => (
                        <label key={category} className="inline-flex items-center mr-4">
                          <input
                            type="checkbox"
                            checked={donorForm.values.preferences.categories.includes(category)}
                            onChange={(e) => {
                              const newCategories = e.target.checked
                                ? [...donorForm.values.preferences.categories, category]
                                : donorForm.values.preferences.categories.filter(c => c !== category);
                              donorForm.setFieldValue('preferences.categories', newCategories);
                            }}
                            className="form-checkbox h-4 w-4 text-[#E86C3A] focus:ring-[#E86C3A] border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">{category}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="maxDistance" className="block text-sm font-medium text-gray-700">
                      Maximum Distance (km)
                    </label>
                    <input
                      type="number"
                      id="maxDistance"
                      value={donorForm.values.preferences.maxDistance}
                      onChange={(e) => donorForm.setFieldValue('preferences.maxDistance', Number(e.target.value))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#E86C3A] focus:ring-[#E86C3A] sm:text-sm"
                      min="1"
                      max="1000"
                    />
                  </div>

                  <div>
                    <Button
                      type="submit"
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#E86C3A] hover:bg-[#D65A28] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E86C3A]"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Creating account...' : 'Create Account'}
                    </Button>
                  </div>
                </form>
              ) : (
                <form onSubmit={organizationForm.onSubmit(handleOrganizationSubmit)} className="space-y-6">
                  <div>
                    <label htmlFor="organizationName" className="block text-sm font-medium text-[#0A2540] mb-1">
                      Organization Name
                    </label>
                    <input
                      id="organizationName"
                      type="text"
                      placeholder="Your Organization Name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E86C3A] focus:border-transparent"
                      {...organizationForm.getInputProps('organizationName')}
                    />
                    {organizationForm.errors.organizationName && (
                      <p className="mt-1 text-sm text-red-500">{organizationForm.errors.organizationName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-[#0A2540] mb-1">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="organization@email.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E86C3A] focus:border-transparent"
                      {...organizationForm.getInputProps('email')}
                    />
                    {organizationForm.errors.email && (
                      <p className="mt-1 text-sm text-red-500">{organizationForm.errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-[#0A2540] mb-1">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      placeholder="Create a password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E86C3A] focus:border-transparent"
                      {...organizationForm.getInputProps('password')}
                    />
                    {organizationForm.errors.password && (
                      <p className="mt-1 text-sm text-red-500">{organizationForm.errors.password}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-[#0A2540] mb-1">
                      Address
                    </label>
                    <input
                      id="address"
                      type="text"
                      placeholder="Organization Address"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E86C3A] focus:border-transparent"
                      {...organizationForm.getInputProps('address')}
                    />
                    {organizationForm.errors.address && (
                      <p className="mt-1 text-sm text-red-500">{organizationForm.errors.address}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-[#0A2540] mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      placeholder="Tell us about your organization"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E86C3A] focus:border-transparent"
                      rows={4}
                      {...organizationForm.getInputProps('description')}
                    />
                    {organizationForm.errors.description && (
                      <p className="mt-1 text-sm text-red-500">{organizationForm.errors.description}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-[#0A2540] mb-1">
                      Website (Optional)
                    </label>
                    <input
                      id="website"
                      type="url"
                      placeholder="https://your-organization.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E86C3A] focus:border-transparent"
                      {...organizationForm.getInputProps('website')}
                    />
                  </div>

                  <div>
                    <label htmlFor="contactPerson" className="block text-sm font-medium text-[#0A2540] mb-1">
                      Contact Person
                    </label>
                    <input
                      id="contactPerson"
                      type="text"
                      placeholder="Name of the contact person"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E86C3A] focus:border-transparent"
                      {...organizationForm.getInputProps('contactPerson')}
                    />
                    {organizationForm.errors.contactPerson && (
                      <p className="mt-1 text-sm text-red-500">{organizationForm.errors.contactPerson}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="contactPhone" className="block text-sm font-medium text-[#0A2540] mb-1">
                      Contact Phone
                    </label>
                    <input
                      id="contactPhone"
                      type="tel"
                      placeholder="Contact phone number"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E86C3A] focus:border-transparent"
                      {...organizationForm.getInputProps('contactPhone')}
                    />
                    {organizationForm.errors.contactPhone && (
                      <p className="mt-1 text-sm text-red-500">{organizationForm.errors.contactPhone}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-[#E86C3A] hover:bg-[#D55C2A] text-white font-medium rounded-md transition-colors duration-200 relative overflow-hidden group cursor-pointer"
                  >
                    <span className="relative z-10">
                      {isLoading ? 'Submitting for review...' : 'Submit for Review'}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#D55C2A] to-[#E86C3A] transform translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />
                  </button>
                </form>
              )}

              <p className="mt-6 text-center text-sm text-[#0A2540]">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="text-[#E86C3A] hover:text-[#D55C2A] font-medium underline transition-colors duration-200 cursor-pointer"
                >
                  Sign in
                </Link>
                {type === 'organization' && (
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
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
} 