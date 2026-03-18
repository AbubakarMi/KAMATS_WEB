'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WizardStep {
  title: string;
  content: React.ReactNode;
  description?: string;
}

interface FormWizardProps {
  steps: WizardStep[];
  onFinish: () => void | Promise<void>;
  onCancel?: () => void;
  finishLabel?: string;
  loading?: boolean;
}

export function FormWizard({
  steps,
  onFinish,
  onCancel,
  finishLabel = 'Submit',
  loading = false,
}: FormWizardProps) {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((prev) => Math.min(prev + 1, steps.length - 1));
  const prev = () => setCurrent((prev) => Math.max(prev - 1, 0));

  return (
    <div>
      {/* Stepper */}
      <div className="flex items-center mb-6">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 transition-colors',
                  i < current && 'bg-blue-600 text-white',
                  i === current && 'bg-blue-600 text-white ring-4 ring-blue-100',
                  i > current && 'bg-slate-100 text-slate-400',
                )}
              >
                {i < current ? <Check size={16} /> : i + 1}
              </div>
              <div className="hidden sm:block">
                <div className={cn(
                  'text-sm font-medium',
                  i <= current ? 'text-slate-900' : 'text-slate-400',
                )}>
                  {step.title}
                </div>
                {step.description && (
                  <div className="text-xs text-slate-400">{step.description}</div>
                )}
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className={cn(
                'flex-1 h-px mx-3',
                i < current ? 'bg-blue-600' : 'bg-slate-200',
              )} />
            )}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="rounded-[14px] border border-slate-200 bg-white p-6 min-h-[200px] mb-6">
        {steps[current].content}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
        )}
        {current > 0 && (
          <Button variant="outline" onClick={prev}>Previous</Button>
        )}
        {current < steps.length - 1 && (
          <Button onClick={next}>Next</Button>
        )}
        {current === steps.length - 1 && (
          <Button onClick={onFinish} disabled={loading}>
            {finishLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
