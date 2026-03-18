'use client';

import { useState } from 'react';
import { Plus, Pencil } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

import { StatusBadge } from '@/components/data-display/StatusBadge';
import { DetailPageSkeleton } from '@/components/skeletons/DetailPageSkeleton';
import {
  useGetAlertRulesQuery,
  useCreateAlertRuleMutation,
  useUpdateAlertRuleMutation,
} from '@/lib/features/alerts/alertsApi';
import { setApiFieldErrors } from '@/lib/utils/formErrors';
import { sanitizeFormValues } from '@/lib/utils/sanitize';
import { AlertSeverity, NotificationChannel } from '@/lib/api/types/enums';
import type { AlertRule } from '@/lib/api/types/alerts';

const severityOptions = Object.values(AlertSeverity).map((s) => ({ value: s, label: s }));
const channelOptions = Object.values(NotificationChannel).map((c) => ({ value: c, label: c }));

type FormValues = {
  ruleName: string;
  module: string;
  conditionType: string;
  thresholdValue: string;
  severity: string;
  notifyRoles: string;
  channels: string[];
};

export default function AlertRulesPage() {
  const { data: rules, isLoading } = useGetAlertRulesQuery();
  const [createRule, { isLoading: creating }] = useCreateAlertRuleMutation();
  const [updateRule, { isLoading: updating }] = useUpdateAlertRuleMutation();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<FormValues>({ mode: 'onBlur' });

  const openEdit = (rule: AlertRule) => {
    setEditingId(rule.id);
    form.reset({
      ruleName: rule.ruleName,
      module: rule.module,
      conditionType: rule.conditionType,
      thresholdValue: rule.thresholdValue,
      severity: rule.severity,
      notifyRoles: rule.notifyRoles.join(', '),
      channels: rule.channels,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      const sanitized = sanitizeFormValues(values as unknown as Record<string, unknown>);
      const payload = {
        ruleName: sanitized.ruleName as string,
        module: sanitized.module as string,
        conditionType: sanitized.conditionType as string,
        thresholdValue: sanitized.thresholdValue as string,
        severity: sanitized.severity as AlertRule['severity'],
        notifyRoles: (sanitized.notifyRoles as string).split(',').map((r: string) => r.trim()).filter(Boolean),
        channels: sanitized.channels as AlertRule['channels'],
      };
      if (editingId) {
        await updateRule({ id: editingId, body: payload }).unwrap();
        toast.success('Rule updated');
      } else {
        await createRule(payload).unwrap();
        toast.success('Rule created');
      }
      form.reset();
      setEditingId(null);
      setModalOpen(false);
    } catch (err) {
      const fallback = setApiFieldErrors(form.setError, err);
      if (fallback) toast.error(fallback);
    }
  };

  const handleToggle = (rule: AlertRule, checked: boolean): void => {
    updateRule({ id: rule.id, body: { isActive: checked } });
  };

  if (isLoading) return <DetailPageSkeleton descriptionRows={6} hasTable />;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">Alert Rules</h1>
        <Button onClick={() => { setEditingId(null); form.reset(); setModalOpen(true); }}>
          <Plus className="h-4 w-4 mr-1.5" />New Rule
        </Button>
      </div>

      <div className="rounded-[14px] border border-slate-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left py-2.5 px-4 text-slate-500 font-medium">Rule Name</th>
              <th className="text-left py-2.5 px-4 text-slate-500 font-medium">Module</th>
              <th className="text-left py-2.5 px-4 text-slate-500 font-medium">Condition</th>
              <th className="text-left py-2.5 px-4 text-slate-500 font-medium">Threshold</th>
              <th className="text-left py-2.5 px-4 text-slate-500 font-medium">Severity</th>
              <th className="text-left py-2.5 px-4 text-slate-500 font-medium">Channels</th>
              <th className="text-center py-2.5 px-4 text-slate-500 font-medium">Active</th>
              <th className="py-2.5 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {(rules ?? []).map((r) => (
              <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="py-2.5 px-4">{r.ruleName}</td>
                <td className="py-2.5 px-4">{r.module}</td>
                <td className="py-2.5 px-4">{r.conditionType.replace(/([A-Z])/g, ' $1').trim()}</td>
                <td className="py-2.5 px-4">{r.thresholdValue}</td>
                <td className="py-2.5 px-4"><StatusBadge status={r.severity} /></td>
                <td className="py-2.5 px-4">
                  <div className="flex flex-wrap gap-1">
                    {r.channels.map((c) => (
                      <span key={c} className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{c}</span>
                    ))}
                  </div>
                </td>
                <td className="py-2.5 px-4 text-center">
                  <Switch checked={r.isActive} onCheckedChange={(checked) => handleToggle(r, checked)} />
                </td>
                <td className="py-2.5 px-4">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={modalOpen} onOpenChange={(open) => { if (!open) { setModalOpen(false); setEditingId(null); form.reset(); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Alert Rule' : 'Create Alert Rule'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3 mt-2">
            <div><Label>Rule Name</Label><Input {...form.register('ruleName', { required: true })} /></div>
            <div><Label>Module</Label><Input placeholder="e.g. Ledger, Consumption" {...form.register('module', { required: true })} /></div>
            <div><Label>Condition Type</Label><Input placeholder="e.g. StockBelowReorder" {...form.register('conditionType', { required: true })} /></div>
            <div><Label>Threshold Value</Label><Input placeholder="e.g. 5" {...form.register('thresholdValue', { required: true })} /></div>
            <div>
              <Label>Severity</Label>
              <Controller control={form.control} name="severity" rules={{ required: true }} render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Select severity" /></SelectTrigger>
                  <SelectContent>
                    {severityOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              )} />
            </div>
            <div><Label>Notify Roles (comma-separated)</Label><Input placeholder="e.g. StoreManager, Director" {...form.register('notifyRoles', { required: true })} /></div>
            <div>
              <Label>Notification Channels</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {channelOptions.map((c) => {
                  const channels = form.watch('channels') ?? [];
                  const isSelected = channels.includes(c.value);
                  return (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => {
                        const current = form.getValues('channels') ?? [];
                        form.setValue('channels', isSelected ? current.filter((v) => v !== c.value) : [...current, c.value]);
                      }}
                      className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                        isSelected ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setModalOpen(false); setEditingId(null); form.reset(); }}>Cancel</Button>
              <Button type="submit" disabled={creating || updating}>
                {creating || updating ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
