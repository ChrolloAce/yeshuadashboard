'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Users, Building, UserCheck, AlertCircle, CheckCircle } from 'lucide-react';
import { ThemedButton } from '@/components/ui/ThemedButton';
import { ThemedInput } from '@/components/ui/ThemedInput';
import { ThemedCard } from '@/components/ui/ThemedCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { TeamService, TeamInvite } from '@/services/team/TeamService';
import { AuthService } from '@/services/auth/AuthService';
import { CompanyService } from '@/services/company/CompanyService';

interface CleanerRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  skills: string[];
  hourlyRate?: number;
}

export default function JoinTeamPage() {
  const params = useParams();
  const router = useRouter();
  const inviteCode = params.inviteCode as string;
  
  const [invite, setInvite] = useState<TeamInvite | null>(null);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'validate' | 'register' | 'success'>('validate');
  
  const [registrationData, setRegistrationData] = useState<CleanerRegistrationData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    skills: [],
    hourlyRate: undefined
  });

  const teamService = TeamService.getInstance();
  const authService = AuthService.getInstance();
  const companyService = CompanyService.getInstance();

  useEffect(() => {
    validateInvite();
  }, [inviteCode]);

  const validateInvite = async () => {
    try {
      setLoading(true);
      setError(null);

      const inviteData = await teamService.getInviteByCode(inviteCode);
      
      if (!inviteData) {
        setError('Invalid or expired invitation link');
        return;
      }

      if (inviteData.isUsed) {
        setError('This invitation has already been used');
        return;
      }

      if (inviteData.expiresAt < new Date()) {
        setError('This invitation has expired');
        return;
      }

      setInvite(inviteData);

      // Get company details
      const companyData = await companyService.getCompany(inviteData.companyId);
      setCompany(companyData);

      // Pre-fill email if provided in invite
      if (inviteData.email) {
        setRegistrationData(prev => ({ ...prev, email: inviteData.email! }));
      }

      setStep('register');
    } catch (err: any) {
      console.error('Error validating invite:', err);
      setError(err.message || 'Failed to validate invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      setSubmitting(true);
      setError(null);

      // Validation
      if (!registrationData.firstName || !registrationData.lastName || !registrationData.email || !registrationData.password) {
        setError('Please fill in all required fields');
        return;
      }

      if (registrationData.password !== registrationData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (registrationData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }

      if (!invite) {
        setError('Invalid invitation');
        return;
      }

      // Register the cleaner
      const userProfile = await authService.register({
        firstName: registrationData.firstName,
        lastName: registrationData.lastName,
        email: registrationData.email,
        password: registrationData.password,
        phone: registrationData.phone,
        role: 'cleaner',
        inviteCode: inviteCode
      });

      // Mark invite as used
      await teamService.useInvite(invite.id, userProfile.uid);

      // If invite was for a specific team, add user to team
      if (invite.teamId) {
        await teamService.addMemberToTeam(invite.teamId, userProfile.uid);
      }

      setStep('success');
    } catch (err: any) {
      console.error('Error registering cleaner:', err);
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const addSkill = (skill: string) => {
    if (skill.trim() && !registrationData.skills.includes(skill.trim())) {
      setRegistrationData(prev => ({
        ...prev,
        skills: [...prev.skills, skill.trim()]
      }));
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setRegistrationData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 mt-4">Validating invitation...</p>
        </div>
      </div>
    );
  }

  if (error && step === 'validate') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ThemedCard className="max-w-md w-full mx-4 p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invitation</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <ThemedButton 
            variant="primary" 
            onClick={() => router.push('/')}
            className="w-full"
          >
            Go to Homepage
          </ThemedButton>
        </ThemedCard>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ThemedCard className="max-w-md w-full mx-4 p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to the Team!</h1>
          <p className="text-gray-600 mb-6">
            Your account has been created successfully. You can now access your cleaner dashboard.
          </p>
          <ThemedButton 
            variant="primary" 
            onClick={() => router.push('/')}
            className="w-full"
          >
            Go to Dashboard
          </ThemedButton>
        </ThemedCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Join the Team</h1>
          <p className="text-gray-600 mt-2">You've been invited to join {company?.name}</p>
        </div>

        {/* Company Info */}
        {company && (
          <ThemedCard className="p-6 mb-6">
            <div className="flex items-center space-x-3">
              <Building className="w-8 h-8 text-primary-600" />
              <div>
                <h3 className="font-semibold text-gray-900">{company.name}</h3>
                <p className="text-sm text-gray-600">
                  Role: {invite?.role === 'team_lead' ? 'Team Lead' : 'Cleaner'}
                </p>
              </div>
            </div>
          </ThemedCard>
        )}

        {/* Registration Form */}
        <ThemedCard className="p-6">
          <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }}>
            <div className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <ThemedInput
                    type="text"
                    value={registrationData.firstName}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="John"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <ThemedInput
                    type="text"
                    value={registrationData.lastName}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <ThemedInput
                  type="email"
                  value={registrationData.email}
                  onChange={(e) => setRegistrationData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="john.doe@example.com"
                  disabled={!!invite?.email}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone (Optional)
                </label>
                <ThemedInput
                  type="tel"
                  value={registrationData.phone}
                  onChange={(e) => setRegistrationData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <ThemedInput
                  type="password"
                  value={registrationData.password}
                  onChange={(e) => setRegistrationData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <ThemedInput
                  type="password"
                  value={registrationData.confirmPassword}
                  onChange={(e) => setRegistrationData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hourly Rate (Optional)
                </label>
                <ThemedInput
                  type="number"
                  value={registrationData.hourlyRate || ''}
                  onChange={(e) => setRegistrationData(prev => ({ 
                    ...prev, 
                    hourlyRate: e.target.value ? parseFloat(e.target.value) : undefined 
                  }))}
                  placeholder="25.00"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <ThemedButton
              type="submit"
              variant="primary"
              className="w-full mt-6"
              disabled={submitting}
            >
              {submitting ? (
                <div className="flex items-center">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Creating Account...</span>
                </div>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 mr-2" />
                  Join Team
                </>
              )}
            </ThemedButton>
          </form>
        </ThemedCard>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <button 
            onClick={() => router.push('/')}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Sign in here
          </button>
        </p>
      </div>
    </div>
  );
}
