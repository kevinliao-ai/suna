// Types
export interface VideoModel {
  id: string;
  name: string;
  description: string;
  is_recommended: boolean;
  thumbnail?: string;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
  version?: string;
  resolution?: string;
  fps?: number;
  max_duration?: number;
}

export interface VideoGenerationRequest {
  prompt: string;
  negative_prompt?: string;
  duration: number;
  model_id: string;
  is_public: boolean;
}

export interface VideoGenerationResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  prompt: string;
  negative_prompt?: string;
  duration: number;
  model_id: string;
  is_public: boolean;
  progress?: number;
  result_url?: string;
  error?: string;
}

// Helper function to make API calls
async function fetchJson<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `API request failed with status ${response.status}`
    );
  }

  return response.json();
}

// Video Generation API
export const videoApi = {
  // Generate a new video
  async generateVideo(params: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    return fetchJson('/api/v1/video/generate', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  // Get generation status
  async getGenerationStatus(generationId: string): Promise<VideoGenerationResponse> {
    return fetchJson(`/api/v1/video/status/${generationId}`);
  },

  // List available models
  async listModels(): Promise<VideoModel[]> {
    return fetchJson('/api/v1/video/models');
  },

  // Poll for generation status with exponential backoff
  async pollGenerationStatus(
    generationId: string,
    onProgress?: (progress: number) => void,
    maxAttempts = 30,
    initialDelay = 1000
  ): Promise<VideoGenerationResponse> {
    const poll = async (attempt = 0): Promise<VideoGenerationResponse> => {
      const status = await this.getGenerationStatus(generationId);
      
      // Update progress if callback provided
      if (onProgress && status.progress !== undefined) {
        onProgress(status.progress);
      }

      // If generation is complete or failed, return the status
      if (['completed', 'failed'].includes(status.status)) {
        return status;
      }


      // If we've reached max attempts, return current status
      if (attempt >= maxAttempts) {
        return status;
      }


      // Calculate next delay with exponential backoff (max 10s)
      const delay = Math.min(initialDelay * Math.pow(1.5, attempt), 10000);
      
      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Continue polling
      return poll(attempt + 1);
    };

    return poll();
  },

  // Generate video with progress tracking
  async generateVideoWithProgress(
    params: VideoGenerationRequest,
    onProgress: (progress: number) => void,
    onComplete: (result: VideoGenerationResponse) => void,
    onError: (error: Error) => void
  ): Promise<() => void> {
    let isCancelled = false;
    
    const startGeneration = async () => {
      try {
        // Start the generation
        const response = await this.generateVideo(params);
        
        if (isCancelled) return;
        
        // Start polling for status
        const result = await this.pollGenerationStatus(
          response.id,
          (progress) => {
            if (!isCancelled) {
              onProgress(progress);
            }
          }
        );
        
        if (!isCancelled) {
          onComplete(result);
        }
      } catch (error) {
        if (!isCancelled) {
          onError(error instanceof Error ? error : new Error(String(error)));
        }
      }
    };
    
    // Start the generation in the background
    startGeneration();
    
    // Return a cleanup function to cancel the operation
    return () => {
      isCancelled = true;
    };
  }
};
