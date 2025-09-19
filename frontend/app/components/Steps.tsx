"use client";

import React from "react";

type StepsProps = {
  currentStep: number;
  steps: {
    number: number;
    title: string;
    description?: string;
  }[];
};

export default function Steps({ currentStep, steps }: StepsProps) {
  return (
    <div
      className="w-full mx-auto px-4 py-6"
      role="region"
      aria-label="Progress"
    >
      <ol
        className="relative flex items-center justify-between w-full max-w-4xl mx-auto"
        role="list"
        aria-label="Progress steps"
      >
        {steps.map((step, index) => {
          const isActive = step.number === currentStep;
          const isCompleted = step.number < currentStep;
          const isLast = index === steps.length - 1;

          return (
            <li
              key={step.number}
              className="flex flex-col items-center relative w-full"
            >
              {/* Connector line */}
              {!isLast && (
                <div
                  className={`absolute top-7 left-1/2 w-full h-1 -z-10 transition-all duration-300
                    ${
                      isCompleted
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 shadow-sm shadow-blue-500/20"
                        : "bg-gray-700/50"
                    }`}
                ></div>
              )}

              {/* Step circle */}
              <div
                className={`
                  group flex items-center justify-center w-14 h-14 rounded-full border-2 
                  transition-all duration-300 ease-out relative
                  ${
                    isActive
                      ? "bg-gradient-to-br from-blue-500 to-indigo-600 border-blue-400 scale-110 shadow-lg shadow-blue-500/30"
                      : ""
                  }
                  ${
                    isCompleted
                      ? "bg-gradient-to-br from-blue-600 to-indigo-700 border-blue-500/50 shadow-md shadow-blue-500/20"
                      : ""
                  }
                  ${
                    !isActive && !isCompleted
                      ? "bg-gray-800/80 border-gray-700/50 hover:bg-gray-800 hover:border-gray-600/50"
                      : ""
                  }
                `}
              >
                {isCompleted ? (
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <span
                    className={`text-lg font-medium ${
                      isActive ? "text-white" : "text-gray-400"
                    }`}
                  >
                    {step.number}
                  </span>
                )}
              </div>

              {/* Step title */}
              <p
                className={`mt-3 text-sm text-center transition-colors duration-300 ${
                  isActive
                    ? "text-white font-medium"
                    : isCompleted
                    ? "text-gray-300"
                    : "text-gray-500"
                }`}
              >
                {step.title}
              </p>

              {/* Step description (optional) */}
              {step.description && (
                <p
                  className={`mt-1 text-xs text-center max-w-[120px] ${
                    isActive
                      ? "text-gray-300"
                      : isCompleted
                      ? "text-gray-400"
                      : "text-gray-600"
                  }`}
                >
                  {step.description}
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
