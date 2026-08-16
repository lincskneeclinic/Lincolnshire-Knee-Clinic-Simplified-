"use client";

import React, { createContext, useCallback, useContext, useRef, useState } from "react";

interface Toast {
  id: number;
  kind: "success" | "error";
  message: string;
}

interface ConfirmState {
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  resolve: (value: boolean) => void;
}

interface PromptState {
  message: string;
  defaultValue?: string;
  multiline?: boolean;
  placeholder?: string;
  resolve: (value: string | null) => void;
}

interface DashboardFeedbackContextValue {
  toastSuccess: (message: string) => void;
  toastError: (message: string) => void;
  confirmAction: (message: string, options?: { confirmLabel?: string; danger?: boolean }) => Promise<boolean>;
  promptAction: (message: string, options?: { defaultValue?: string; multiline?: boolean; placeholder?: string }) => Promise<string | null>;
}

const DashboardFeedbackContext = createContext<DashboardFeedbackContextValue | null>(null);

export function useToast() {
  const ctx = useContext(DashboardFeedbackContext);
  if (!ctx) throw new Error("useToast must be used within DashboardFeedbackProvider");
  return { success: ctx.toastSuccess, error: ctx.toastError };
}

export function useConfirm() {
  const ctx = useContext(DashboardFeedbackContext);
  if (!ctx) throw new Error("useConfirm must be used within DashboardFeedbackProvider");
  return ctx.confirmAction;
}

export function usePrompt() {
  const ctx = useContext(DashboardFeedbackContext);
  if (!ctx) throw new Error("usePrompt must be used within DashboardFeedbackProvider");
  return ctx.promptAction;
}

export function DashboardFeedbackProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [promptState, setPromptState] = useState<PromptState | null>(null);
  const [promptValue, setPromptValue] = useState("");
  const nextToastId = useRef(0);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback((kind: Toast["kind"], message: string) => {
    const id = nextToastId.current++;
    setToasts((prev) => [...prev, { id, kind, message }]);
    setTimeout(() => dismissToast(id), kind === "error" ? 6000 : 3500);
  }, [dismissToast]);

  const toastSuccess = useCallback((message: string) => pushToast("success", message), [pushToast]);
  const toastError = useCallback((message: string) => pushToast("error", message), [pushToast]);

  const confirmAction = useCallback((message: string, options?: { confirmLabel?: string; danger?: boolean }) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({ message, resolve, ...options });
    });
  }, []);

  const promptAction = useCallback((message: string, options?: { defaultValue?: string; multiline?: boolean; placeholder?: string }) => {
    return new Promise<string | null>((resolve) => {
      setPromptValue(options?.defaultValue || "");
      setPromptState({ message, resolve, ...options });
    });
  }, []);

  const value: DashboardFeedbackContextValue = { toastSuccess, toastError, confirmAction, promptAction };

  return (
    <DashboardFeedbackContext.Provider value={value}>
      {children}

      {/* Toast stack */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-xl border px-4 py-3 text-xs font-semibold shadow-2xl backdrop-blur animate-fadeIn flex items-start gap-2 ${
              t.kind === "success"
                ? "bg-portal-surface border-clinical-teal/40 text-portal-accent-text"
                : "bg-portal-surface border-red-500/40 text-portal-error-text"
            }`}
          >
            <span className="shrink-0">{t.kind === "success" ? "✓" : "⚠"}</span>
            <span className="flex-1 leading-relaxed">{t.message}</span>
            <button
              onClick={() => dismissToast(t.id)}
              className="text-portal-text/40 hover:text-portal-text/80 cursor-pointer shrink-0"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Confirm modal */}
      {confirmState && (
        <div className="fixed inset-0 z-[110] bg-portal-bg/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-portal-surface border border-portal-border/10 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-5">
            <p className="text-sm text-portal-text leading-relaxed">{confirmState.message}</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  confirmState.resolve(false);
                  setConfirmState(null);
                }}
                className="border border-portal-border/20 text-portal-text/80 hover:bg-portal-text/5 text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmState.resolve(true);
                  setConfirmState(null);
                }}
                className={`text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer ${
                  confirmState.danger
                    ? "bg-red-500/90 hover:bg-red-500 text-white"
                    : "bg-clinical-teal hover:bg-clinical-teal-hover text-deep-navy"
                }`}
              >
                {confirmState.confirmLabel || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prompt modal */}
      {promptState && (
        <div className="fixed inset-0 z-[110] bg-portal-bg/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-portal-surface border border-portal-border/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <p className="text-sm text-portal-text leading-relaxed">{promptState.message}</p>
            {promptState.multiline ? (
              <textarea
                autoFocus
                value={promptValue}
                onChange={(e) => setPromptValue(e.target.value)}
                placeholder={promptState.placeholder}
                rows={4}
                className="w-full bg-portal-surface-alt border border-portal-border/20 text-portal-text rounded-lg p-3 text-xs focus:border-clinical-teal focus:outline-none resize-none"
              />
            ) : (
              <input
                autoFocus
                type="text"
                value={promptValue}
                onChange={(e) => setPromptValue(e.target.value)}
                placeholder={promptState.placeholder}
                className="w-full bg-portal-surface-alt border border-portal-border/20 text-portal-text rounded-lg p-2.5 text-xs focus:border-clinical-teal focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    promptState.resolve(promptValue || null);
                    setPromptState(null);
                  }
                }}
              />
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  promptState.resolve(null);
                  setPromptState(null);
                }}
                className="border border-portal-border/20 text-portal-text/80 hover:bg-portal-text/5 text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  promptState.resolve(promptValue || null);
                  setPromptState(null);
                }}
                className="bg-clinical-teal hover:bg-clinical-teal-hover text-deep-navy text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardFeedbackContext.Provider>
  );
}
