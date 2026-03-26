'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DetailPageSkeleton } from '@/components/skeletons/DetailPageSkeleton';

import { useGetConfigurationQuery, useUpdateConfigMutation } from '@/lib/features/admin/adminApi';
import { sanitizeString } from '@/lib/utils/sanitize';

export default function EditConfigPage() {
  const router = useRouter();
  const { key } = useParams<{ key: string }>();
  const decodedKey = decodeURIComponent(key);
  const { data: configs, isLoading } = useGetConfigurationQuery();
  const [updateConfig, { isLoading: updating }] = useUpdateConfigMutation();
  const [editValue, setEditValue] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const configItem = configs?.find((c) => c.configKey === decodedKey);

  useEffect(() => {
    if (configItem) {
      setEditValue(JSON.stringify(configItem.configValue, null, 2));
    }
  }, [configItem]);

  const handleConfirm = async () => {
    if (!configItem) return;
    try {
      const sanitized = sanitizeString(editValue);
      const parsed = JSON.parse(sanitized);
      await updateConfig({
        key: configItem.configKey,
        data: { configValue: parsed },
      }).unwrap();
      toast.success('Configuration updated');
      router.push('/admin/configuration');
    } catch (err) {
      if (err instanceof SyntaxError) {
        toast.error('Invalid JSON');
      } else {
        toast.error('Failed to update configuration');
      }
      throw err;
    }
  };

  if (isLoading) return <DetailPageSkeleton descriptionRows={6} />;

  if (!configItem) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Button variant="outline" size="sm" onClick={() => router.push('/admin/configuration')}>
            <ArrowLeft className="h-4 w-4 mr-1" />Back
          </Button>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">
            Configuration Not Found
          </h1>
        </div>
        <p className="text-sm text-slate-500">The configuration key could not be found.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.push('/admin/configuration')}>
          <ArrowLeft className="h-4 w-4 mr-1" />Back
        </Button>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">
          Edit Configuration
        </h1>
      </div>

      <div className="rounded-[14px] border border-slate-200 bg-white p-6">
        <div className="space-y-4">
          <div>
            <Label>Key</Label>
            <p className="font-mono text-sm bg-slate-50 px-3 py-2 rounded-md">{configItem.configKey}</p>
          </div>

          {configItem.description && (
            <div>
              <Label>Description</Label>
              <p className="text-sm text-slate-500">{configItem.description}</p>
            </div>
          )}

          <div>
            <Label>Value (JSON)</Label>
            <Textarea
              rows={10}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="font-mono text-xs"
            />
          </div>

          <div className="border-t border-slate-200 pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => router.push('/admin/configuration')}>
              Cancel
            </Button>
            <Button onClick={() => setConfirmOpen(true)} disabled={updating} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {updating ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Update Configuration?"
        description={`Are you sure you want to update "${configItem.configKey}"?`}
        confirmLabel="Save"
        onConfirm={handleConfirm}
      />
    </div>
  );
}
