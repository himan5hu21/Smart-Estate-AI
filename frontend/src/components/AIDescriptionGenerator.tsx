'use client';

import { useState } from 'react';
import { aiClient } from '@/lib/ai-client';
import { Button } from '@/ui/Button';

interface AIDescriptionGeneratorProps {
  propertyData: any;
  onGenerated: (description: string) => void;
}

export function AIDescriptionGenerator({ propertyData, onGenerated }: AIDescriptionGeneratorProps) {
  const [generating, setGenerating] = useState(false);
  const [tone, setTone] = useState<'professional' | 'casual' | 'luxury'>('professional');
  const [lastCost, setLastCost] = useState<number | null>(null);

  const generateDescription = async () => {
    setGenerating(true);
    try {
      const result = await aiClient.generatePropertyDescription({
        property_data: propertyData,
        tone: tone,
      });

      onGenerated(result.description);
      setLastCost(result.cost);
    } catch (error) {
      console.error('Failed to generate description:', error);
      alert('Failed to generate description. Make sure the AI backend is running.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <select
          value={tone}
          onChange={(e) => setTone(e.target.value as any)}
          className="px-3 py-2 border rounded-lg text-sm"
          disabled={generating}
        >
          <option value="professional">Professional</option>
          <option value="casual">Casual & Friendly</option>
          <option value="luxury">Luxury & Premium</option>
        </select>

        <Button
          onClick={generateDescription}
          disabled={generating}
          variant="outline"
          className="flex items-center gap-2"
        >
          {generating ? (
            <>
              <span className="animate-spin">⚙️</span>
              Generating...
            </>
          ) : (
            <>
              ✨ Generate with AI
            </>
          )}
        </Button>
      </div>

      {lastCost !== null && (
        <p className="text-xs text-gray-500">
          Last generation cost: ${lastCost.toFixed(4)}
        </p>
      )}

      <p className="text-xs text-gray-500">
        💡 AI will create a compelling description based on your property details
      </p>
    </div>
  );
}
