'use client';

import { useState } from 'react';

export default function TestAIPage() {
  const [status, setStatus] = useState<string>('Not tested');
  const [pricing, setPricing] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testBackend = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/health');
      const data = await response.json();
      setStatus(`✅ Connected! Status: ${data.status}`);
    } catch (error) {
      setStatus(`❌ Failed to connect: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testPricing = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/ai/pricing');
      const data = await response.json();
      setPricing(data);
    } catch (error) {
      console.error('Pricing test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🧪 AI Backend Test Page</h1>

        <div className="space-y-6">
          {/* Health Check */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">1. Health Check</h2>
            <button
              onClick={testBackend}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Testing...' : 'Test Backend Connection'}
            </button>
            <p className="mt-4 text-lg">{status}</p>
          </div>

          {/* Pricing Info */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">2. AI Pricing Info</h2>
            <button
              onClick={testPricing}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? 'Loading...' : 'Get Pricing Info'}
            </button>
            {pricing && (
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(pricing, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h2 className="text-xl font-semibold mb-4">✅ Next Steps</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Click "Test Backend Connection" - should show ✅ Connected</li>
              <li>Click "Get Pricing Info" - should show pricing details</li>
              <li>If both work, your AI backend is ready!</li>
              <li>You can now integrate the AI components into your pages</li>
            </ol>
          </div>

          {/* Component Examples */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">📦 Available Components</h2>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded">
                <h3 className="font-semibold">CommuteSearch</h3>
                <p className="text-sm text-gray-600">
                  Find properties within X minutes of office
                </p>
                <code className="text-xs bg-gray-200 px-2 py-1 rounded mt-2 block">
                  import {`{ CommuteSearch }`} from '@/components/CommuteSearch'
                </code>
              </div>

              <div className="p-3 bg-gray-50 rounded">
                <h3 className="font-semibold">AIDescriptionGenerator</h3>
                <p className="text-sm text-gray-600">
                  Generate property descriptions with AI
                </p>
                <code className="text-xs bg-gray-200 px-2 py-1 rounded mt-2 block">
                  import {`{ AIDescriptionGenerator }`} from '@/components/AIDescriptionGenerator'
                </code>
              </div>

              <div className="p-3 bg-gray-50 rounded">
                <h3 className="font-semibold">AIInquiryResponse</h3>
                <p className="text-sm text-gray-600">
                  Get AI-powered inquiry response suggestions
                </p>
                <code className="text-xs bg-gray-200 px-2 py-1 rounded mt-2 block">
                  import {`{ AIInquiryResponse }`} from '@/components/AIInquiryResponse'
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
