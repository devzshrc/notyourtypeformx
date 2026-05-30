"use client";

import type { CardComponentProps } from "onborda";
import { useOnborda } from "onborda";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const contentVariants = {
  enter: { opacity: 0, y: 8, scale: 0.98 },
  center: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8, scale: 0.98 },
};

export function TourCard({
  step,
  currentStep,
  totalSteps,
  nextStep,
  prevStep,
  arrow,
}: CardComponentProps) {
  const { closeOnborda } = useOnborda();
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="relative">
      {arrow}
      <div className="w-80 rounded-xl border border-border/60 bg-card shadow-2xl">
        {/* Progress bar */}
        <div className="h-1 w-full overflow-hidden rounded-t-xl bg-muted/50">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 260, damping: 34 }}
          />
        </div>

        {/* Close button */}
        <button
          onClick={closeOnborda}
          className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground/60 transition-colors hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>

        {/* Content */}
        <div className="px-5 pb-2 pt-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              variants={contentVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            >
              {step.icon && (
                <span className="mb-3 inline-flex size-10 items-center justify-center rounded-lg bg-primary/10 text-lg">
                  {step.icon}
                </span>
              )}
              <h3 className="text-sm font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {step.content}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between border-t border-border/60 px-5 py-3">
          <span className="text-xs text-muted-foreground/60">
            {currentStep + 1} / {totalSteps}
          </span>
          <div className="flex items-center gap-1.5">
            {currentStep > 0 && (
              <button
                onClick={prevStep}
                className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <ChevronLeft className="size-3.5" />
                Back
              </button>
            )}
            {currentStep + 1 < totalSteps ? (
              <button
                onClick={nextStep}
                className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.97]"
              >
                Next
                <ChevronRight className="size-3.5" />
              </button>
            ) : (
              <button
                onClick={() => {
                  localStorage.setItem("schema-onboarding-seen", "true");
                  closeOnborda();
                }}
                className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.97]"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
