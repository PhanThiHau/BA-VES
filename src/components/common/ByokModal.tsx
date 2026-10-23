import { useEffect, useState } from "react";
import { CheckCircle2, KeyRound, Loader2, Sparkles, X, XCircle } from "lucide-react";
import { aiService } from "../../services/aiService";
import { Button } from "../ui/Button";

interface ByokModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ByokModal({ isOpen, onClose }: ByokModalProps) {
  const [provider, setProvider] = useState<"OpenAI" | "Gemini">("Gemini");
  const [model, setModel] = useState("gemini-1.5-pro");
  const [apiKey, setApiKey] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const saved = aiService.getSavedConfig();
      if (saved) {
        setProvider(saved.provider);
        setModel(saved.model);
        setApiKey(saved.apiKey);
      }
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleProviderChange = (p: "OpenAI" | "Gemini") => {
    setProvider(p);
    setModel(p === "Gemini" ? "gemini-1.5-pro" : "gpt-4o");
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setTestResult({ success: false, message: "Vui lòng nhập API Key trước khi kiểm tra." });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const res = await aiService.validateConnection({ provider, model, apiKey });
      if (res.isValid) {
        aiService.saveConfig({ provider, model, apiKey });
        setTestResult({
          success: true,
          message: res.message || "Kết nối AI thành công! Cấu hình đã được lưu trên thiết bị.",
        });
      } else {
        setTestResult({
          success: false,
          message: res.message || "Xác thực API Key thất bại.",
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || "Không thể kết nối tới máy chủ kiểm tra API Key.",
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSaveOnly = () => {
    if (!apiKey.trim()) {
      setTestResult({ success: false, message: "Vui lòng nhập API Key." });
      return;
    }
    aiService.saveConfig({ provider, model, apiKey });
    setTestResult({
      success: true,
      message: "Đã lưu cấu hình thành công!",
    });
    setTimeout(() => onClose(), 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl border border-slate/20 bg-white p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate hover:text-navy"
          aria-label="Đóng"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brass/10 text-brass">
            <KeyRound size={20} />
          </span>
          <div>
            <h2 className="font-display text-lg font-bold text-navy">Cài đặt API Key AI (BYOK)</h2>
            <p className="text-xs text-slate">Bring Your Own Key · Tự mang API Key của bạn</p>
          </div>
        </div>

        <div className="mt-5 space-y-4 text-xs font-sans">
          {/* Provider Selection */}
          <div>
            <label className="block font-bold text-navy uppercase text-[10px] tracking-wider mb-1.5">
              Nhà cung cấp AI (Provider)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleProviderChange("Gemini")}
                className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 font-bold transition-all ${
                  provider === "Gemini"
                    ? "border-navy bg-navy text-white shadow-sm"
                    : "border-slate/20 bg-offwhite text-slate hover:border-slate/40 hover:text-navy"
                }`}
              >
                <Sparkles size={14} className="text-brass" /> Google Gemini
              </button>
              <button
                type="button"
                onClick={() => handleProviderChange("OpenAI")}
                className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 font-bold transition-all ${
                  provider === "OpenAI"
                    ? "border-navy bg-navy text-white shadow-sm"
                    : "border-slate/20 bg-offwhite text-slate hover:border-slate/40 hover:text-navy"
                }`}
              >
                OpenAI (ChatGPT)
              </button>
            </div>
          </div>

          {/* Model Selection */}
          <div>
            <label className="block font-bold text-navy uppercase text-[10px] tracking-wider mb-1.5">
              Mô hình (Model)
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate/20 bg-white px-3 font-medium text-navy outline-none focus:border-navy focus:ring-2 focus:ring-navy/10"
            >
              {provider === "Gemini" ? (
                <>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro (Khuyên dùng)</option>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash (Tốc độ cao)</option>
                  <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                </>
              ) : (
                <>
                  <option value="gpt-4o">GPT-4o (Khuyên dùng)</option>
                  <option value="gpt-4o-mini">GPT-4o Mini (Tiết kiệm)</option>
                  <option value="o1-preview">OpenAI o1-preview</option>
                </>
              )}
            </select>
          </div>

          {/* API Key */}
          <div>
            <label className="block font-bold text-navy uppercase text-[10px] tracking-wider mb-1.5">
              API Key bí mật
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={provider === "Gemini" ? "AIzaSy..." : "sk-..."}
              className="h-10 w-full rounded-xl border border-slate/20 bg-white px-3 font-mono text-xs text-navy outline-none focus:border-navy focus:ring-2 focus:ring-navy/10"
            />
            <p className="mt-1 text-[10px] text-slate/80">
              * Key chỉ được lưu cục bộ trên trình duyệt của bạn và gửi kèm qua header an toàn.
            </p>
          </div>

          {/* Test Status Message */}
          {testResult && (
            <div
              className={`flex items-start gap-2 rounded-xl p-3 ${
                testResult.success
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border border-rose-200 bg-rose-50 text-rose-800"
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 size={16} className="shrink-0 text-emerald-600 mt-0.5" />
              ) : (
                <XCircle size={16} className="shrink-0 text-rose-600 mt-0.5" />
              )}
              <span className="text-xs leading-relaxed">{testResult.message}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2.5 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              disabled={testing}
              onClick={handleTestConnection}
            >
              {testing ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Đang kiểm tra...
                </>
              ) : (
                "Kiểm tra kết nối"
              )}
            </Button>
            <Button
              type="button"
              className="flex-1"
              disabled={testing || !apiKey}
              onClick={handleSaveOnly}
            >
              Lưu cấu hình
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
