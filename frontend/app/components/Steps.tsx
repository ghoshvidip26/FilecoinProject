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
    <div className="w-full max-w-3xl mx-auto px-4">
      <ol className="relative flex items-center justify-between w-full mb-8">
        {steps.map((step) => {
          // Determine step state
          const isActive = step.number === currentStep;
          const isCompleted = step.number < currentStep;

          return (
            <li
              key={step.number}
              className="flex flex-col items-center relative"
            >
              {/* Line connector */}
              {step.number < steps.length && (
                <div
                  className={`absolute top-4 h-0.5 w-full left-1/2 -z-10 ${
                    isCompleted ? "bg-blue-500" : "bg-gray-700"
                  }`}
                ></div>
              )}

              {/* Step circle */}
              <div
                className={`
                  flex items-center justify-center w-8 h-8 rounded-full border-2 
                  ${isActive ? "bg-blue-600 border-blue-400" : ""}
                  ${isCompleted ? "bg-blue-600 border-blue-500" : ""}
                  ${
                    !isActive && !isCompleted
                      ? "bg-gray-800 border-gray-700"
                      : ""
                  }
                `}
              >
                {isCompleted ? (
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                ) : (
                  <span
                    className={`text-sm ${
                      isActive ? "text-white" : "text-gray-400"
                    }`}
                  >
                    {step.number}
                  </span>
                )}
              </div>

              {/* Step title */}
              <p
                className={`mt-2 text-sm ${
                  isActive
                    ? "text-white font-medium"
                    : isCompleted
                    ? "text-gray-300"
                    : "text-gray-500"
                }`}
              >
                {step.title}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
