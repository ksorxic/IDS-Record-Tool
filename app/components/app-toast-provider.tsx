"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TOAST_DURATION_MS, getToastTheme, type ToastKind } from "@/lib/toast-config";

type ToastRecord = {
  id: string;
  message: string;
  kind: ToastKind;
};

type ToastContextValue = {
  showToast: (kind: ToastKind, message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function ToastIcon({ kind }: { kind: ToastKind }) {
  const theme = getToastTheme(kind);
  return (
    <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl shadow-inner ${theme.iconClassName}`}>
      {theme.iconName === "check" && <CheckCircle2 className="h-5 w-5" />}
      {theme.iconName === "x" && <XCircle className="h-5 w-5" />}
      {theme.iconName === "alert" && <AlertTriangle className="h-5 w-5" />}
      {theme.iconName === "info" && <Info className="h-5 w-5" />}
    </span>
  );
}

export function AppToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const timersRef = useRef<Map<string, number>>(new Map());

  const removeToast = useCallback((id: string) => {
    const timeoutId = timersRef.current.get(id);
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      timersRef.current.delete(id);
    }
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((kind: ToastKind, message: string) => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, kind, message }]);
    const timeoutId = window.setTimeout(() => removeToast(id), TOAST_DURATION_MS);
    timersRef.current.set(id, timeoutId);
  }, [removeToast]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div 
        className="pointer-events-none fixed inset-x-0 top-6 z-120 flex flex-col items-center px-4"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative flex w-full max-w-md flex-col items-center">
          <AnimatePresence mode="popLayout">
            {toasts.map((toast, index) => {
              const theme = getToastTheme(toast.kind);
              
              // Υπολογισμός θέσης στη στοίβα (τα νεότερα είναι μπροστά)
              const reversedIndex = toasts.length - 1 - index;
              const isStacked = reversedIndex >= 5 && !isHovered;
              
              // Δυναμικά styles για το stacking
              const variants = {
                initial: { opacity: 0, y: -20, filter: "blur(10px)", scale: 0.9 },
                animate: {
                  opacity: isStacked ? 0 : 1,
                  y: isHovered ? 0 : (reversedIndex * 12), // Spread αν είναι hovered, αλλιώς μικρό offset
                  scale: isHovered ? 1 : 1 - (reversedIndex * 0.05), // Μικραίνουν όσο πάνε προς τα πίσω
                  zIndex: toasts.length - reversedIndex,
                  filter: "blur(0px)",
                },
                exit: { 
                  opacity: 0, 
                  scale: 0.8, 
                  filter: "blur(10px)", 
                  transition: { duration: 0.2 } 
                }
              };

              return (
                <motion.div
                  key={toast.id}
                  layout
                  variants={variants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className={`
                    pointer-events-auto absolute w-full rounded-[1.75rem] border border-white/40 
                    px-5 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.1)] backdrop-blur-xl transition-shadow
                    ${isHovered ? 'relative mb-3 shadow-2xl' : 'shadow-md'}
                    ${theme.containerClassName}
                  `}
                >
                  <div className="flex items-start gap-4">
                    <ToastIcon kind={toast.kind} />
                    <div className="min-w-0 flex-1 pt-0.5 text-slate-900">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">
                        {toast.kind}
                      </p>
                      <p className="mt-0.5 text-sm font-medium leading-relaxed">
                        {toast.message}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useAppToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useAppToast must be used within AppToastProvider");
  return context;
}
