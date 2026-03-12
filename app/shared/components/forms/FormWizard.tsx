import { useState } from 'react';
import { Steps, Button, Space, Card } from 'antd';

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

  const handleFinish = async () => {
    await onFinish();
  };

  return (
    <div>
      <Steps
        current={current}
        items={steps.map((s) => ({ title: s.title, description: s.description }))}
        style={{ marginBottom: 24 }}
      />

      <Card style={{ minHeight: 200, marginBottom: 24 }}>
        {steps[current].content}
      </Card>

      <Space>
        {onCancel && (
          <Button onClick={onCancel}>Cancel</Button>
        )}
        {current > 0 && (
          <Button onClick={prev}>Previous</Button>
        )}
        {current < steps.length - 1 && (
          <Button type="primary" onClick={next}>
            Next
          </Button>
        )}
        {current === steps.length - 1 && (
          <Button type="primary" onClick={handleFinish} loading={loading}>
            {finishLabel}
          </Button>
        )}
      </Space>
    </div>
  );
}
