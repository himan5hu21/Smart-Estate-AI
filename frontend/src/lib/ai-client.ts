/**
 * AI Features Client
 * Connects to Python backend for AI features
 */

const AI_BACKEND_URL = process.env.NEXT_PUBLIC_AI_BACKEND_URL || 'http://localhost:8000';

export interface CommuteRequest {
  office_location: {
    latitude: number;
    longitude: number;
  };
  max_commute_minutes: number;
  mode?: 'driving' | 'transit' | 'walking' | 'bicycling';
  property_filters?: any;
}

export interface PropertyDescriptionRequest {
  property_data: any;
  tone?: 'professional' | 'casual' | 'luxury';
}

export interface InquiryResponseRequest {
  inquiry: any;
  property_data: any;
}

export interface AlertPreference {
  user_id: string;
  office_location: {
    latitude: number;
    longitude: number;
  };
  max_commute_minutes: number;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  property_type?: string;
  locations?: string[];
  amenities?: string[];
  enabled: boolean;
}

class AIClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = AI_BACKEND_URL;
  }

  // Commute Features
  async findPropertiesWithinCommute(request: CommuteRequest) {
    const response = await fetch(`${this.baseUrl}/api/commute/find-properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to find properties');
    }

    return response.json();
  }

  async calculateSingleCommute(
    propertyLocation: { latitude: number; longitude: number },
    officeLocation: { latitude: number; longitude: number },
    mode: string = 'driving'
  ) {
    const response = await fetch(
      `${this.baseUrl}/api/commute/calculate-single?mode=${mode}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_location: propertyLocation,
          office_location: officeLocation,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to calculate commute');
    }

    return response.json();
  }

  async batchCalculateCommutes(
    propertyIds: number[],
    officeLocation: { latitude: number; longitude: number },
    mode: string = 'driving'
  ) {
    const response = await fetch(
      `${this.baseUrl}/api/commute/batch-calculate?mode=${mode}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_ids: propertyIds,
          office_location: officeLocation,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to batch calculate commutes');
    }

    return response.json();
  }

  // AI Description Generation
  async generatePropertyDescription(request: PropertyDescriptionRequest) {
    const response = await fetch(`${this.baseUrl}/api/ai/generate-description`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to generate description');
    }

    return response.json();
  }

  // AI Inquiry Response
  async suggestInquiryResponse(request: InquiryResponseRequest) {
    const response = await fetch(`${this.baseUrl}/api/ai/suggest-inquiry-response`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to generate response suggestions');
    }

    return response.json();
  }

  // AI Property Valuation
  async valueProperty(propertyData: any, comparableProperties: any[]) {
    const response = await fetch(`${this.baseUrl}/api/ai/value-property`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        property_data: propertyData,
        comparable_properties: comparableProperties,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to value property');
    }

    return response.json();
  }

  // AI Property Matching
  async matchProperties(userPreferences: any, properties: any[], topN: number = 5) {
    const response = await fetch(`${this.baseUrl}/api/ai/match-properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_preferences: userPreferences,
        properties: properties,
        top_n: topN,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to match properties');
    }

    return response.json();
  }

  // Alerts
  async createAlert(alert: AlertPreference) {
    const response = await fetch(`${this.baseUrl}/api/alerts/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alert),
    });

    if (!response.ok) {
      throw new Error('Failed to create alert');
    }

    return response.json();
  }

  async getUserAlerts(userId: string) {
    const response = await fetch(`${this.baseUrl}/api/alerts/user/${userId}`);

    if (!response.ok) {
      throw new Error('Failed to get alerts');
    }

    return response.json();
  }

  async updateAlert(alertId: string, alert: AlertPreference) {
    const response = await fetch(`${this.baseUrl}/api/alerts/${alertId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alert),
    });

    if (!response.ok) {
      throw new Error('Failed to update alert');
    }

    return response.json();
  }

  async deleteAlert(alertId: string) {
    const response = await fetch(`${this.baseUrl}/api/alerts/${alertId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete alert');
    }

    return response.json();
  }

  async checkNewPropertiesForAlert(alertId: string) {
    const response = await fetch(
      `${this.baseUrl}/api/alerts/check-new-properties/${alertId}`,
      { method: 'POST' }
    );

    if (!response.ok) {
      throw new Error('Failed to check new properties');
    }

    return response.json();
  }

  // Pricing Info
  async getAIPricing() {
    const response = await fetch(`${this.baseUrl}/api/ai/pricing`);

    if (!response.ok) {
      throw new Error('Failed to get pricing');
    }

    return response.json();
  }
}

export const aiClient = new AIClient();
