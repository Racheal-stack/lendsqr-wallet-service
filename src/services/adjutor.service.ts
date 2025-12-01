import axios, { AxiosInstance } from 'axios';
import config from '../config';

interface KarmaCheckResponse {
  status: string;
  message: string;
  'mock-response'?: string;
  data: {
    karma_identity: string;
    amount_in_contention: string;
    reason: string | null;
    default_date: string;
    karma_type: {
      karma: string;
    };
    karma_identity_type: {
      identity_type: string;
    };
    reporting_entity: {
      name: string;
      email: string;
    };
  } | null;
  meta?: {
    cost: number;
    balance: number;
  };
}

export class AdjutorService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.adjutor.apiUrl,
      headers: {
        'Authorization': `Bearer ${config.adjutor.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
  }

  async isBlacklisted(identity: string): Promise<boolean> {
    try {
      if (!config.adjutor.apiKey) {
        return false;
      }

      const response = await this.client.get<KarmaCheckResponse>(
        `/verification/karma/${encodeURIComponent(identity)}`
      );

      if (response.data?.['mock-response']) {
        return false;
      }

      if (response.data?.status === 'success' && response.data?.data) {
        return true;
      }

      return false;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return false;
      }
      
      return false;
    }
  }

  async checkIdentities(email: string, phoneNumber: string): Promise<boolean> {
    const [emailBlacklisted, phoneBlacklisted] = await Promise.all([
      this.isBlacklisted(email),
      this.isBlacklisted(phoneNumber),
    ]);

    return emailBlacklisted || phoneBlacklisted;
  }
}

export const adjutorService = new AdjutorService();
