'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
import { DetailPageSkeleton } from '@/components/skeletons/DetailPageSkeleton';

import {
  useGetUsersQuery,
  useUpdateUserMutation,
  useGetStoresQuery,
} from '@/lib/features/admin/adminApi';
import { setApiFieldErrors } from '@/lib/utils/formErrors';
import { sanitizeFormValues } from '@/lib/utils/sanitize';
import { AVAILABLE_ROLES } from '@/lib/constants/roles';
import type { UpdateUserRequest } from '@/lib/api/types/admin';

type FormValues = {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  storeId?: string;
  roleIds: string[];
};

export default function EditUserPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data: usersData, isLoading: loadingUsers } = useGetUsersQuery({ page: 1, pageSize: 200 });
  const { data: stores } = useGetStoresQuery();
  const [updateUser, { isLoading: updating }] = useUpdateUserMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<FormValues | null>(null);

  const user = usersData?.data?.find((u) => u.id === id);

  const form = useForm<FormValues>({ mode: 'onBlur', defaultValues: { roleIds: [] } });
  const selectedRoles = form.watch('roleIds');

  const toggleRole = (role: string) => {
    const current = form.getValues('roleIds');
    const next = current.includes(role)
      ? current.filter((r) => r !== role)
      : [...current, role];
    form.setValue('roleIds', next, { shouldValidate: true });
  };

  useEffect(() => {
    if (user) {
      form.reset({
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber ?? '',
        storeId: user.storeId ?? undefined,
        roleIds: user.roles?.map((r) => r.name) ?? [],
      });
    }
  }, [user, form]);

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
      const req: UpdateUserRequest = {
        email: sanitized.email as string,
        firstName: sanitized.firstName as string,
        lastName: sanitized.lastName as string,
        phoneNumber: sanitized.phoneNumber as string | undefined,
        storeId: sanitized.storeId as string | undefined,
        roleIds: pendingValues.roleIds,
      };
      await updateUser({ id, data: req }).unwrap();
      toast.success('User updated');
      router.push('/admin/users');
    } catch (err) {
      const fallback = setApiFieldErrors(form.setError, err);
      if (fallback) toast.error(fallback);
      throw err;
    }
  };

  if (loadingUsers) return <DetailPageSkeleton descriptionRows={4} />;

  if (!user) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Button variant="outline" size="sm" onClick={() => router.push('/admin/users')}>
            <ArrowLeft className="h-4 w-4 mr-1" />Back
          </Button>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">
            User Not Found
          </h1>
        </div>
        <p className="text-sm text-slate-500">The user could not be found.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.push('/admin/users')}>
          <ArrowLeft className="h-4 w-4 mr-1" />Back
        </Button>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">
          Edit User
        </h1>
      </div>

      <div className="rounded-[14px] border border-slate-200 bg-white p-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Username</Label>
              <Input {...form.register('username')} disabled />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" {...form.register('email', { required: true })} />
              {form.formState.errors.email && (
                <p className="text-xs text-red-500 mt-1">Email is required</p>
              )}
            </div>
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
            <Button type="submit" disabled={updating} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {updating ? 'Saving...' : 'Update User'}
            </Button>
          </div>
        </form>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Update User?"
        description="Are you sure you want to update this user account?"
        confirmLabel="Update User"
        onConfirm={handleConfirm}
      />
    </div>
  );
}
