'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ConfirmDialog } from '@/components/ConfirmDialog';

import { useCreateUserMutation, useGetStoresQuery } from '@/lib/features/admin/adminApi';
import { setApiFieldErrors } from '@/lib/utils/formErrors';
import { sanitizeFormValues } from '@/lib/utils/sanitize';
import { AVAILABLE_ROLES } from '@/lib/constants/roles';
import type { CreateUserRequest } from '@/lib/api/types/admin';

type FormValues = {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  storeId?: string;
  roleIds: string[];
};

export default function CreateUserPage() {
  const router = useRouter();
  const { data: stores } = useGetStoresQuery();
  const [createUser, { isLoading: creating }] = useCreateUserMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<FormValues | null>(null);

  const form = useForm<FormValues>({ mode: 'onBlur', defaultValues: { roleIds: [] } });
  const selectedRoles = form.watch('roleIds');

  const toggleRole = (role: string) => {
    const current = form.getValues('roleIds');
    const next = current.includes(role)
      ? current.filter((r) => r !== role)
      : [...current, role];
    form.setValue('roleIds', next, { shouldValidate: true });
  };

  const onSubmit = (values: FormValues) => {
    if (values.roleIds.length === 0) {
      form.setError('roleIds', { message: 'Select at least one role' });
      return;
    }
    setPendingValues(values);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!pendingValues) return;
    try {
      const sanitized = sanitizeFormValues(pendingValues as unknown as Record<string, unknown>);
      const req: CreateUserRequest = {
        username: sanitized.username as string,
        email: sanitized.email as string,
        password: sanitized.password as string,
        firstName: sanitized.firstName as string,
        lastName: sanitized.lastName as string,
        phoneNumber: sanitized.phoneNumber as string | undefined,
        storeId: sanitized.storeId as string | undefined,
        roleIds: pendingValues.roleIds,
      };
      await createUser(req).unwrap();
      toast.success('User created');
      router.push('/admin/users');
    } catch (err) {
      const fallback = setApiFieldErrors(form.setError, err);
      if (fallback) toast.error(fallback);
      throw err;
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.push('/admin/users')}>
          <ArrowLeft className="h-4 w-4 mr-1" />Back
        </Button>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">
          Create User
        </h1>
      </div>

      <div className="rounded-[14px] border border-slate-200 bg-white p-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Username</Label>
              <Input {...form.register('username', { required: true })} />
              {form.formState.errors.username && (
                <p className="text-xs text-red-500 mt-1">Username is required</p>
              )}
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" {...form.register('email', { required: true })} />
              {form.formState.errors.email && (
                <p className="text-xs text-red-500 mt-1">Email is required</p>
              )}
            </div>
          </div>

          <div>
            <Label>Password</Label>
            <Input type="password" {...form.register('password', { required: true })} />
            {form.formState.errors.password && (
              <p className="text-xs text-red-500 mt-1">Password is required</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>First Name</Label>
              <Input {...form.register('firstName', { required: true })} />
              {form.formState.errors.firstName && (
                <p className="text-xs text-red-500 mt-1">First name is required</p>
              )}
            </div>
            <div>
              <Label>Last Name</Label>
              <Input {...form.register('lastName', { required: true })} />
              {form.formState.errors.lastName && (
                <p className="text-xs text-red-500 mt-1">Last name is required</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Phone Number</Label>
              <Input {...form.register('phoneNumber')} />
            </div>
            <div>
              <Label>Primary Store</Label>
              <Controller control={form.control} name="storeId" render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Select store (optional)" /></SelectTrigger>
                  <SelectContent>
                    {(stores ?? []).map((s) => <SelectItem key={s.id} value={s.id}>{s.code} — {s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )} />
            </div>
          </div>

          {/* Roles */}
          <div>
            <Label>Roles</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {AVAILABLE_ROLES.map((role) => {
                const selected = selectedRoles?.includes(role.value);
                return (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => toggleRole(role.value)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      selected
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400 hover:text-blue-600'
                    }`}
                  >
                    {role.label}
                  </button>
                );
              })}
            </div>
            {form.formState.errors.roleIds && (
              <p className="text-xs text-red-500 mt-1">{form.formState.errors.roleIds.message}</p>
            )}
          </div>

          <div className="border-t border-slate-200 pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => router.push('/admin/users')}>
              Cancel
            </Button>
            <Button type="submit" disabled={creating} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {creating ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </form>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Create User?"
        description="Are you sure you want to create this user account?"
        confirmLabel="Create User"
        onConfirm={handleConfirm}
      />
    </div>
  );
}
