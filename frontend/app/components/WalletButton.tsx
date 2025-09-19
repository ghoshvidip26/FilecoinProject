"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react"; // lightweight spinner

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
      <div
        className="flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 
        bg-gradient-to-r from-blue-700/30 to-indigo-800/30 backdrop-blur-md cursor-default"
        title={walletAddress}
      >
        <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
        <span className="text-sm font-medium text-gray-200 tracking-wide">
          {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isLoading}
      className="flex items-center gap-2 px-5 py-2.5 rounded-full 
      bg-gradient-to-r from-blue-600 to-indigo-600 
      hover:from-blue-500 hover:to-indigo-500 
      disabled:opacity-60 text-white font-medium shadow-lg shadow-blue-500/20 
      transition-all duration-200 ease-in-out active:scale-95"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Connecting...</span>
        </>
      ) : (
        <span className="text-sm">Connect Wallet</span>
      )}
    </button>
  );
}
