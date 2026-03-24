'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DownloadPdfButtonProps {
  onGenerate: () => void | Promise<void>;
  label?: string;
}

export function DownloadPdfButton({ onGenerate, label = 'Download PDF' }: DownloadPdfButtonProps) {
  const [generating, setGenerating] = useState(false);

  const handleClick = async () => {
    setGenerating(true);
    try {
      await onGenerate();
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={generating}
    >
      {generating
        ? <Loader2 className="h-4 w-4 mr-1 animate-spin" />
        : <Download className="h-4 w-4 mr-1" />
      }
      {generating ? 'Generating...' : label}
    </Button>
  );
}
