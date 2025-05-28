// API configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  UPLOAD: `${API_BASE_URL}/api/upload`,
  VIDEO: {
    GENERATE: `${API_BASE_URL}/api/v1/video/generate`,
    STATUS: (id: string) => `${API_BASE_URL}/api/v1/video/status/${id}`,
  },
};
