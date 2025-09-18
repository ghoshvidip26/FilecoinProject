"use client";

import React, { useState } from "react";

type PredictionResultProps = {
  isLoading: boolean;
  prediction?: {
    result: string;
    confidence?: number;
    className?: string;
  };
  error?: string;
  onSaveToFilecoin: () => Promise<void>;
  isSaving: boolean;
  cidResult?: string;
};

export default function PredictionResult({
  isLoading,
  prediction,
  error,
  onSaveToFilecoin,
  isSaving,
  cidResult,
}: PredictionResultProps) {
  if (isLoading) {
    return (
      <div className="w-full p-6 bg-gray-800/50 rounded-xl border border-gray-700">
        <div className="flex flex-col items-center justify-center py-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-300">Analyzing MRI scan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6 bg-red-900/20 rounded-xl border border-red-700/50">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-6 w-6 text-red-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-300">Analysis Error</h3>
            <div className="mt-2 text-sm text-red-200">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!prediction) {
    return null;
  }

  // Map prediction classes to human-readable formats and descriptions
  const resultMap: {
    [key: string]: {
      label: string;
      description: string;
      severity: "low" | "moderate" | "high";
    };
  } = {
    glioma: {
      label: "Glioma Detected",
      description:
        "Glioma is a type of tumor that occurs in the brain and spinal cord. Gliomas begin in the glial cells that surround and support neurons.",
      severity: "high",
    },
    meningioma: {
      label: "Meningioma Detected",
      description:
        "Meningiomas are tumors that arise from the meninges — the membranes that surround your brain and spinal cord. Most meningiomas are noncancerous.",
      severity: "moderate",
    },
    pituitary: {
      label: "Pituitary Tumor Detected",
      description:
        "Pituitary tumors are abnormal growths that develop in the pituitary gland. Some pituitary tumors result in too many hormones that regulate important functions of your body.",
      severity: "moderate",
    },
    no_tumor: {
      label: "No Tumor Detected",
      description:
        "No signs of brain tumor were detected in the scan. The brain tissue appears normal.",
      severity: "low",
    },
  };

  // Determine which result to display, fallback to generic if not in our map
  const resultKey = prediction.className?.toLowerCase() || "";
  const resultInfo = resultMap[resultKey] || {
    label: prediction.result || "Analysis Complete",
    description:
      "Please consult with a medical professional for a complete interpretation of these results.",
    severity: "moderate",
  };

  // Color schemes based on severity
  const colorScheme = {
    high: "bg-red-900/30 border-red-700/50 text-red-300",
    moderate: "bg-amber-900/30 border-amber-700/50 text-amber-300",
    low: "bg-green-900/30 border-green-700/50 text-green-300",
  };

  return (
    <div
      className={`w-full p-6 rounded-xl border transition-all ${
        colorScheme[resultInfo.severity]
      }`}
    >
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">{resultInfo.label}</h3>
          {prediction.confidence && (
            <div className="px-3 py-1 text-sm rounded-full bg-white/10">
              {(prediction.confidence * 100).toFixed(1)}% confidence
            </div>
          )}
        </div>

        <p className="text-gray-300 mb-6">{resultInfo.description}</p>

        {!cidResult && (
          <button
            onClick={onSaveToFilecoin}
            disabled={isSaving}
            className="flex justify-center items-center gap-2 w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/50 text-white rounded-lg transition"
          >
            {isSaving ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Storing on Filecoin...</span>
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span>Store Result on Filecoin</span>
              </>
            )}
          </button>
        )}

        {cidResult && (
          <div className="bg-blue-900/30 border border-blue-700/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-blue-300">
                Stored on Filecoin
              </h4>
              <svg
                className="h-5 w-5 text-green-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="mt-1 text-sm font-mono text-gray-400 break-all">
              {cidResult}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
