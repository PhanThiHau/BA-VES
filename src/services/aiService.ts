import { apiClient, getStoredByokConfig, setStoredByokConfig, type ByokConfig } from "./apiClient";

export interface ValidateAiConnectionPayload {
  provider: "OpenAI" | "Gemini";
  model: string;
  apiKey: string;
}

export interface ValidateAiConnectionResult {
  valid?: boolean;
  isValid: boolean;
  message?: string;
  provider: string;
  model: string;
}

export const aiService = {
  // FE-05: Modal Cài đặt API Key AI (Bring Your Own Key)
  async validateConnection(payload: ValidateAiConnectionPayload): Promise<ValidateAiConnectionResult> {
    const raw = await apiClient.post<any>("/api/ai/connections/validate", payload, {
      "X-AI-Provider": payload.provider,
      "X-AI-Model": payload.model,
      "X-AI-Key": payload.apiKey,
    });
    const isValid = Boolean(raw.valid ?? raw.isValid);
    return {
      valid: isValid,
      isValid,
      message: raw.message,
      provider: raw.provider || payload.provider,
      model: raw.model || payload.model,
    };
  },

  getSavedConfig(): ByokConfig | null {
    return getStoredByokConfig();
  },

  saveConfig(config: ByokConfig) {
    setStoredByokConfig(config);
  },
};
