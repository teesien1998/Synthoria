"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Timeline,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineHeading,
  TimelineLine,
} from "@/components/ui/timeline";

interface ReasoningTimelineProps {
  reasoning: string;
  isExpanded: boolean;
  setIsExpanded: (isExpanded: boolean) => void;
  durationMs?: number;
  onToggle: () => void;
}

const ReasoningTimeline = ({
  reasoning,
  isExpanded,
  setIsExpanded,
  durationMs,
  onToggle,
}: ReasoningTimelineProps) => {
  // Parse the reasoning text into logical steps
  const parseReasoningSteps = (text: string) => {
    // Split by bullet points or numbered lists
    const lines = text.split("\n").filter((line) => line.trim());
    const steps: string[] = [];
    let currentStep = "";

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Check if line starts with bullet point, number, or is a new step
      if (
        trimmedLine.startsWith("•") ||
        trimmedLine.startsWith("*") ||
        trimmedLine.startsWith("-") ||
        /^\d+\./.test(trimmedLine) ||
        (currentStep && trimmedLine.length > 50 && !trimmedLine.startsWith(" "))
      ) {
        if (currentStep) {
          steps.push(currentStep.trim());
        }

        // Remove bullet points and numbers
        currentStep = trimmedLine
          .replace(/^[•*-]\s*/, "")
          .replace(/^\d+\.\s*/, "");
      } else {
        // Continue building current step
        currentStep += (currentStep ? " " : "") + trimmedLine;
      }
    }

    if (currentStep) {
      steps.push(currentStep.trim());
    }

    // If no clear steps found, treat each paragraph as a step
    if (steps.length === 0) {
      return text.split("\n\n").filter((step) => step.trim());
    }

    return steps;
  };

  const steps = parseReasoningSteps(reasoning);

  const formatReasoningDuration = (ms?: number) => {
    if (typeof ms !== "number" || !Number.isFinite(ms) || ms <= 0) {
      return "View thoughts";
    }

    const totalSeconds = ms / 1000;

    if (totalSeconds < 1) {
      return "Thought for <1s";
    }

    if (totalSeconds < 60) {
      const seconds = Math.round(totalSeconds);
      return `Thought for ${seconds}s`;
    }

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.round(totalSeconds % 60);
    if (seconds === 0) {
      return `Thought for ${minutes}m`;
    }
    return `Thought for ${minutes}m ${seconds}s`;
  };

  const durationLabel = formatReasoningDuration(durationMs);

  return (
    <div>
      <button
        onClick={onToggle}
        className="cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
      >
        {durationLabel}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <Timeline>
                <TimelineItem status="done">
                  <TimelineDot status="current" />
                  <TimelineLine done />
                  <TimelineContent className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-normal">
                    {reasoning}
                  </TimelineContent>
                </TimelineItem>

                <TimelineItem status="done">
                  <TimelineDot status="done" />
                  <TimelineHeading className="text-sm text-green-700 dark:text-green-400 font-medium">
                    Done
                  </TimelineHeading>
                </TimelineItem>
              </Timeline>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReasoningTimeline;
