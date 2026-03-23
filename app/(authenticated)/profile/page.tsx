'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Shield, Smartphone, KeyRound } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DescriptionList } from '@/components/data-display/DescriptionList';
import { StatusBadge } from '@/components/data-display/StatusBadge';

import { useAuth } from '@/lib/hooks';
import { usePinSetupMutation } from '@/lib/features/auth/authApi';
import { pinSetupSchema } from '@/lib/schemas/auth';
import { setApiFieldErrors } from '@/lib/utils/formErrors';

type PinFormValues = {
  currentPin: string;
  newPin: string;
  confirmPin: string;
};

export default function ProfilePage() {
  const { user, storeAssignments } = useAuth();
  const [pinSetup, { isLoading: settingPin }] = usePinSetupMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<PinFormValues | null>(null);
  const [hasExistingPin, setHasExistingPin] = useState(false);

  const form = useForm<PinFormValues>({
    resolver: zodResolver(pinSetupSchema),
    mode: 'onBlur',
    defaultValues: { currentPin: '', newPin: '', confirmPin: '' },
  });

  const onSubmitPin = (values: PinFormValues) => {
    setPendingValues(values);
    setConfirmOpen(true);
  };

  const handleConfirmPin = async () => {
    if (!pendingValues) return;
    try {
      await pinSetup({
        newPin: pendingValues.newPin,
        ...(hasExistingPin && pendingValues.currentPin ? { currentPin: pendingValues.currentPin } : {}),
      }).unwrap();
      toast.success(hasExistingPin ? 'PIN changed successfully' : 'PIN set up successfully');
      setHasExistingPin(true);
      form.reset({ currentPin: '', newPin: '', confirmPin: '' });
    } catch (err) {
      const fallback = setApiFieldErrors(form.setError, err);
      if (fallback) toast.error(fallback);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">
        My Profile
      </h1>

      {/* User Info */}
      <div className="rounded-[14px] border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Account Information</h2>
        {user && (
          <DescriptionList items={[
            { label: 'Username', value: user.username },
            { label: 'Name', value: `${user.firstName} ${user.lastName}` },
            { label: 'Email', value: user.email },
            { label: 'Phone', value: user.phoneNumber ?? '—' },
            { label: 'Roles', value: user.roles.map((r) => <StatusBadge key={r} status={r} />)  },
            { label: 'Store Assignments', value: storeAssignments.length > 0
              ? storeAssignments.map((s) => s.storeName).join(', ')
              : '—',
            },
          ]} />
        )}
      </div>

      {/* PIN Management */}
      <div className="rounded-[14px] border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-2 mb-1">
          <KeyRound className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-slate-900">PIN Management</h2>
        </div>
        <p className="text-sm text-slate-500 mb-5">
          Your PIN is used to confirm identity for critical operations such as STO approvals, GRD confirmations, and consumption submissions.
        </p>

        <form onSubmit={form.handleSubmit(onSubmitPin)} className="space-y-4 max-w-sm">
          {hasExistingPin && (
            <div>
              <Label>Current PIN</Label>
              <Input
                type="password"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter current PIN"
                {...form.register('currentPin')}
              />
              {form.formState.errors.currentPin && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.currentPin.message}</p>
              )}
            </div>
          )}

          <div>
            <Label>{hasExistingPin ? 'New PIN' : 'Set PIN'}</Label>
            <Input
              type="password"
              inputMode="numeric"
              maxLength={6}
              placeholder="4-6 digit PIN"
              {...form.register('newPin')}
            />
            {form.formState.errors.newPin && (
              <p className="text-xs text-red-500 mt-1">{form.formState.errors.newPin.message}</p>
            )}
          </div>

          <div>
            <Label>Confirm PIN</Label>
            <Input
              type="password"
              inputMode="numeric"
              maxLength={6}
              placeholder="Re-enter PIN"
              {...form.register('confirmPin')}
            />
            {form.formState.errors.confirmPin && (
              <p className="text-xs text-red-500 mt-1">{form.formState.errors.confirmPin.message}</p>
            )}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={settingPin} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Shield className="h-4 w-4 mr-1.5" />
              {settingPin ? 'Saving...' : hasExistingPin ? 'Change PIN' : 'Set PIN'}
            </Button>
            {!hasExistingPin && (
              <button
                type="button"
                onClick={() => setHasExistingPin(true)}
                className="text-sm text-indigo-600 hover:underline"
              >
                Update my PIN
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Biometric Enrollment */}
      <div className="rounded-[14px] border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-2 mb-1">
          <Smartphone className="h-5 w-5 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-900">Biometric Enrollment</h2>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          Biometric authentication (fingerprint / Face ID) is available on mobile devices only. Enroll via the KAMATS mobile app to enable quick sign-in on your device.
        </p>
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
          Biometric enrollment and verification must be performed on a registered mobile device. This feature is not available on the web dashboard.
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={hasExistingPin ? 'Change PIN?' : 'Set PIN?'}
        description={hasExistingPin
          ? 'Are you sure you want to change your security PIN?'
          : 'Are you sure you want to set up a security PIN? This will be required for critical operations.'
        }
        confirmLabel={hasExistingPin ? 'Change PIN' : 'Set PIN'}
        onConfirm={handleConfirmPin}
      />
    </div>
  );
}
