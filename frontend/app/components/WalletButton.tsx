"use client";

import { useState } from "react";
import Image from "next/image";
import { ethers } from "ethers";

type WalletButtonProps = {
  onConnect: () => Promise<void>;
  connected: boolean;
  walletAddress: string;
};

export default function WalletButton({
  onConnect,
  connected,
  walletAddress,
}: WalletButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      await onConnect();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (connected) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-blue-900/30 rounded-full border border-blue-500/30">
        <div className="h-2 w-2 rounded-full bg-green-400"></div>
        <span className="text-sm text-gray-300">
          {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isLoading}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/50 text-white rounded-full transition-all duration-200 ease-in-out"
    >
      <span className="text-sm">
        {isLoading ? "Connecting..." : "Connect Wallet"}
      </span>
    </button>
  );
}
