'use client';

import { useState } from 'react';
import { aiClient } from '@/lib/ai-client';
import { Button } from '@/ui/Button';

interface AIInquiryResponseProps {
  inquiry: any;
  propertyData: any;
  onSelectResponse: (response: string) => void;
}

export function AIInquiryResponse({ inquiry, propertyData, onSelectResponse }: AIInquiryResponseProps) {
  const [suggestions, setSuggestions] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const getSuggestions = async () => {
    setLoading(true);
    try {
      const result = await aiClient.suggestInquiryResponse({
        inquiry: inquiry,
        property_data: propertyData,
      });

      setSuggestions(result.suggestions);
    } catch (error) {
      console.error('Failed to get suggestions:', error);
      alert('Failed to generate suggestions. Make sure the AI backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button onClick={getSuggestions} disabled={loading} variant="outline">
        {loading ? 'Generating...' : '✨ Get AI Response Suggestions'}
      </Button>

      {suggestions && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">Click a suggestion to use it:</p>

          {/* Detailed Response */}
          <div
            className="p-4 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors border border-blue-200"
            onClick={() => onSelectResponse(suggestions.detailed)}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-blue-700 uppercase">Detailed & Informative</span>
            </div>
            <p className="text-sm text-gray-800">{suggestions.detailed}</p>
          </div>

          {/* Brief Response */}
          <div
            className="p-4 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors border border-green-200"
            onClick={() => onSelectResponse(suggestions.brief)}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-green-700 uppercase">Brief & Friendly</span>
            </div>
            <p className="text-sm text-gray-800">{suggestions.brief}</p>
          </div>

          {/* Enthusiastic Response */}
          <div
            className="p-4 bg-purple-50 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors border border-purple-200"
            onClick={() => onSelectResponse(suggestions.enthusiastic)}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-purple-700 uppercase">Enthusiastic & Sales-Focused</span>
            </div>
            <p className="text-sm text-gray-800">{suggestions.enthusiastic}</p>
          </div>
        </div>
      )}
    </div>
  );
}
