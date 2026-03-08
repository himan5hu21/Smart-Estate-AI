'use client';

import { useState } from 'react';
import { aiClient } from '@/lib/ai-client';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Input';
import { Select } from '@/ui/Select';
import MapPicker from '@/ui/MapPicker';

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
  const [showMapPicker, setShowMapPicker] = useState(false);

  const setOfficeFromCoords = (lat: number, lng: number) => {
    setOfficeLocation({ lat, lng });
    setLocationInput(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
  };

  const tryParseLocationInput = () => {
    const parts = locationInput.split(',').map((value) => value.trim());
    if (parts.length !== 2) return;

    const lat = Number(parts[0]);
    const lng = Number(parts[1]);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return;

    setOfficeFromCoords(lat, lng);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setOfficeFromCoords(position.coords.latitude, position.coords.longitude);
        setLoading(false);
      },
      () => {
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
      <h3 className="text-lg font-semibold">Find Properties by Commute Time</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Office Location</label>
          <div className="flex flex-wrap gap-2">
            <Input
              type="text"
              placeholder="Latitude, Longitude"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onBlur={tryParseLocationInput}
              className="flex-1 min-w-[220px]"
            />
            <Button type="button" onClick={getCurrentLocation} disabled={loading} variant="outline">
              Use Current
            </Button>
            <Button type="button" onClick={() => setShowMapPicker((prev) => !prev)} variant="outline">
              {showMapPicker ? 'Hide Map' : 'Select on Map'}
            </Button>
          </div>

          {officeLocation && (
            <p className="text-xs text-gray-500 mt-1">
              Location set: {officeLocation.lat.toFixed(4)}, {officeLocation.lng.toFixed(4)}
            </p>
          )}

          {showMapPicker && (
            <div className="mt-3">
              <MapPicker
                initialLat={officeLocation?.lat}
                initialLng={officeLocation?.lng}
                onLocationSelect={(lat, lng) => setOfficeFromCoords(lat, lng)}
              />
            </div>
          )}
        </div>

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

        <div>
          <label className="block text-sm font-medium mb-2">Travel Mode</label>
          <Select
            value={mode}
            onValueChange={(val) => setMode(val as any)}
            searchable={false}
            clearable={false}
            options={[
              { label: 'Driving', value: 'driving' },
              { label: 'Public Transit', value: 'transit' },
              { label: 'Walking', value: 'walking' },
              { label: 'Bicycling', value: 'bicycling' },
            ]}
          />
        </div>

        <Button
          onClick={searchWithCommute}
          disabled={loading || !officeLocation}
          className="w-full"
        >
          {loading ? 'Searching...' : `Find Properties Within ${maxCommute} Minutes`}
        </Button>
      </div>

      <div className="text-xs text-gray-500 border-t pt-3">
        <p>Tip: This feature uses real-time traffic data to find properties within your desired commute time.</p>
      </div>
    </div>
  );
}
