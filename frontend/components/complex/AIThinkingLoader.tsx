'use client';

import { useState, useEffect } from 'react';
import { FileSearch, FileText, CheckCircle2 } from 'lucide-react';

export default function AIThinkingLoader({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);

  const steps = [
    { icon: FileText, text: "Parsing Vendor PDF..." },
    { icon: FileSearch, text: "Verifying GSTIN via Government API..." },
    { icon: CheckCircle2, text: "Calculating Lowest Bidder..." },
  ];

  useEffect(() => {
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setStep(currentStep);
      } else {
        clearInterval(interval);
        setTimeout(() => {
          onComplete();
        }, 500);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [onComplete]);

  const CurrentIcon = steps[step].icon;

  return (
    <div className="p-6 border border-slate-200 rounded-lg bg-white shadow-sm animate-pulse flex items-center space-x-4">
      <div className="p-3 bg-slate-100 rounded-full text-slate-500">
        <CurrentIcon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-[#0F172A] font-medium">AI Agent Processing</h3>
        <p className="text-sm text-slate-500">{steps[step].text}</p>
      </div>
    </div>
  );
}
