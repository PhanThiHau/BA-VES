import { apiClient, getStoredByokConfig, setStoredByokConfig, type ByokConfig } from "./apiClient";

export interface ValidateAiConnectionPayload {
  provider: "OpenAI" | "Gemini";
  model: string;
  apiKey: string;
}

export interface ValidateAiConnectionResult {
  isValid: boolean;
  message?: string;
  provider: string;
  model: string;
}

export const aiService = {
  // FE-05: Modal Cài đặt API Key AI (Bring Your Own Key)
  async validateConnection(payload: ValidateAiConnectionPayload): Promise<ValidateAiConnectionResult> {
    return apiClient.post<ValidateAiConnectionResult>("/api/ai/connections/validate", payload, {
      "X-AI-Provider": payload.provider,
      "X-AI-Model": payload.model,
      "X-AI-Key": payload.apiKey,
    });
  },

  getSavedConfig(): ByokConfig | null {
    return getStoredByokConfig();
  },

  saveConfig(config: ByokConfig) {
    setStoredByokConfig(config);
  },
};
