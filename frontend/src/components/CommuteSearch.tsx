'use client';

import { useState } from 'react';
import { aiClient } from '@/lib/ai-client';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Input';
import { Select } from '@/ui/Select';

interface CommuteSearchProps {
  onResults: (properties: any[]) => void;
  filters?: any;
}

export function CommuteSearch({ onResults, filters }: CommuteSearchProps) {
  const [officeLocation, setOfficeLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [maxCommute, setMaxCommute] = useState(20);
  const [mode, setMode] = useState<'driving' | 'transit' | 'walking' | 'bicycling'>('driving');
  const [loading, setLoading] = useState(false);
  const [locationInput, setLocationInput] = useState('');

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setOfficeLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationInput(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
        setLoading(false);
      },
      (error) => {
        alert('Unable to get your location');
        setLoading(false);
      }
    );
  };

  const searchWithCommute = async () => {
    if (!officeLocation) {
      alert('Please set your office location first');
      return;
    }

    setLoading(true);
    try {
      const results = await aiClient.findPropertiesWithinCommute({
        office_location: {
          latitude: officeLocation.lat,
          longitude: officeLocation.lng,
        },
        max_commute_minutes: maxCommute,
        mode: mode,
        property_filters: filters || {},
      });

      onResults(results);
    } catch (error) {
      console.error('Commute search failed:', error);
      alert('Failed to search properties. Make sure the AI backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
      <h3 className="text-lg font-semibold">🚗 Find Properties by Commute Time</h3>

      <div className="space-y-4">
        {/* Office Location */}
        <div>
          <label className="block text-sm font-medium mb-2">Office Location</label>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Latitude, Longitude"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              className="flex-1"
            />
            <Button onClick={getCurrentLocation} disabled={loading} variant="outline">
              📍 Use Current
            </Button>
          </div>
          {officeLocation && (
            <p className="text-xs text-gray-500 mt-1">
              Location set: {officeLocation.lat.toFixed(4)}, {officeLocation.lng.toFixed(4)}
            </p>
          )}
        </div>

        {/* Max Commute Time */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Maximum Commute Time: {maxCommute} minutes
          </label>
          <input
            type="range"
            min="5"
            max="60"
            step="5"
            value={maxCommute}
            onChange={(e) => setMaxCommute(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>5 min</span>
            <span>30 min</span>
            <span>60 min</span>
          </div>
        </div>

        {/* Travel Mode */}
        <div>
          <label className="block text-sm font-medium mb-2">Travel Mode</label>
          <Select
            value={mode}
            onValueChange={(val) => setMode(val as any)}
            searchable={false}
            clearable={false}
            options={[
              { label: '🚗 Driving', value: 'driving' },
              { label: '🚇 Public Transit', value: 'transit' },
              { label: '🚶 Walking', value: 'walking' },
              { label: '🚴 Bicycling', value: 'bicycling' },
            ]}
          />
        </div>

        {/* Search Button */}
        <Button
          onClick={searchWithCommute}
          disabled={loading || !officeLocation}
          className="w-full"
        >
          {loading ? 'Searching...' : `Find Properties Within ${maxCommute} Minutes`}
        </Button>
      </div>

      <div className="text-xs text-gray-500 border-t pt-3">
        <p>💡 Tip: This feature uses real-time traffic data to find properties within your desired commute time.</p>
      </div>
    </div>
  );
}
