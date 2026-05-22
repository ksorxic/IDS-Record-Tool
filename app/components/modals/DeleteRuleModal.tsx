"use client";

import {AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  ruleName: string;
}

export default function DeleteRuleModal({ isOpen, onClose, onConfirm, ruleName }: DeleteModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-150 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/40"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            className="relative w-full max-w-md overflow-hidden rounded-4xl border border-white/40 bg-white/90 p-8 shadow-[0_30px_100px_rgba(15,23,42,0.3)] backdrop-blur-2xl"
          >
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 shadow-inner">
                <AlertTriangle className="h-8 w-8" />
              </div>
              
              <h3 className="mt-6 text-xl font-bold text-slate-900">Delete Detection Rule</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Are you sure you want to delete <span className="font-semibold text-slate-900">{ruleName}</span>? 
                This action is permanent and cannot be undone.
              </p>

              <div className="mt-8 flex w-full gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className="flex-1 rounded-xl bg-rose-500 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/20 transition hover:bg-rose-600 active:scale-95"
                >
                  Delete Rule
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}