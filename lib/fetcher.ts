import { staticFetcher } from './mock-data';

// Simulate API responses with static data
export const fetcher = async (url: string) => {
  console.log('Static fetching:', url);

  try {
    // Use static data instead of making real API calls
    const data = await staticFetcher(url);
    console.log('Static API Response for', url, ':', data);
    return data;
  } catch (error) {
    console.error('Static fetch error:', error);
    throw error;
  }
};

// Keep the original API instance for future use, but don't use it now
export const api = {
  get: async (url: string) => {
    return { data: await fetcher(url) };
  },
  post: async (url: string, data: any) => {
    console.log('Static POST to', url, 'with data:', data);
    return { data: { success: true } };
  },
  put: async (url: string, data: any) => {
    console.log('Static PUT to', url, 'with data:', data);
    return { data: { success: true } };
  },
  delete: async (url: string) => {
    console.log('Static DELETE to', url);
    return { data: { success: true } };
  }
};

export default fetcher;