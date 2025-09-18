"use client";
import { useState } from "react";
import axios from "axios";
import { ethers } from "ethers";
import { ABI } from "@/abi";
import WalletButton from "./components/WalletButton";
import FileUpload from "./components/FileUpload";
import PredictionResult from "./components/PredictionResult";
import Steps from "./components/Steps";

declare global {
  interface Window {
    ethereum?: any;
  }
}

// Define the workflow steps
const workflowSteps = [
  { number: 1, title: "Connect Wallet" },
  { number: 2, title: "Upload Scan" },
  { number: 3, title: "Analyze" },
  { number: 4, title: "Store Result" },
];

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [cid, setCid] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [connected, setConnected] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isStoring, setIsStoring] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Calculate the current step based on state
  let currentStep = 1;
  if (connected) currentStep = 2;
  if (file && connected) currentStep = 3;
  if (prediction && !cid) currentStep = 4;
  if (cid) currentStep = 4;

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError("Please install MetaMask to connect your wallet.");
      return;
    }

    try {
      // Check current chain
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();

      // If not Filecoin Calibration (314159), request switch
      if (network.chainId !== BigInt(314159)) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x4CB2F" }], // 314159 in hex
          });
        } catch (switchError: any) {
          // If the chain hasn't been added yet, add it
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0x4CB2F", // 314159
                  chainName: "Filecoin - Calibration Testnet",
                  rpcUrls: ["https://api.calibration.node.glif.io/rpc/v1"],
                  blockExplorerUrls: ["https://calibration.filscan.io"],
                  nativeCurrency: {
                    name: "tFIL",
                    symbol: "tFIL",
                    decimals: 18,
                  },
                },
              ],
            });
          } else {
            throw switchError;
          }
        }
      }

      // Reconnect after switch
      const signer = await provider.getSigner();
      const _walletAddress = await signer.getAddress();
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "",
        ABI.abi,
        signer
      );
      console.log("Network:", network);
      console.log("✅ Connected to Filecoin Calibration");
      console.log("Wallet:", _walletAddress);
      console.log("Contract:", contract);

      setConnected(true);
      setWalletAddress(_walletAddress);
      setError(null);
    } catch (err) {
      console.error("❌ Wallet connection error:", err);
      setError("Failed to connect wallet. Please try again.");
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setPrediction(null);
    setCid("");
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setPrediction(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Make the request to your backend API for classification
      const res = await axios.post("http://127.0.0.1:3001/classify", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setPrediction({
        result: res.data.class || "Analysis Complete",
        confidence: res.data.confidence || null,
        className: res.data.class,
      });
    } catch (error: any) {
      console.error("Analysis error:", error);
      setError(
        error.response?.data?.error ||
          "Failed to analyze the image. Please try again."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStoreOnFilecoin = async () => {
    if (!file) {
      setError("No file to store.");
      return;
    }

    setIsStoring(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(
        "https://api.nft.storage/upload", // ✅ no trailing slash
        formData,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_NFT_STORAGE_API_KEY}`,
          },
        }
      );

      setCid(res.data.value.cid);
      console.log("CID:", res.data.value.cid);
    } catch (error: any) {
      console.error("Storage error:", error);
      setError(
        error.response?.data?.error ||
          "Failed to store on Filecoin. Please try again."
      );
    } finally {
      setIsStoring(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      {/* Header with wallet connection */}
      <header className="w-full px-6 py-4 border-b border-gray-800">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Brain MRI Analysis</h1>
          <WalletButton
            onConnect={connectWallet}
            connected={connected}
            walletAddress={walletAddress}
          />
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Progress steps */}
        <Steps currentStep={currentStep} steps={workflowSteps} />

        {/* Error alert */}
        {error && (
          <div className="mb-8 p-4 border border-red-700/50 bg-red-900/20 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
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
                <p className="text-sm text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column: File Upload and Analysis */}
          <div className="space-y-6">
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <h2 className="text-xl font-semibold mb-4">Upload MRI Scan</h2>
              <FileUpload
                onFileSelect={handleFileSelect}
                file={file}
                disabled={!connected}
              />

              {file && (
                <div className="mt-6">
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/50 text-white rounded-lg transition"
                  >
                    {isAnalyzing ? "Analyzing..." : "Analyze MRI Scan"}
                  </button>
                </div>
              )}
            </div>

            {/* Information card */}
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
              <h3 className="text-lg font-medium mb-2">
                About Brain Tumor Detection
              </h3>
              <p className="text-gray-400 text-sm">
                This tool uses AI to analyze MRI scans and detect potential
                brain tumors. The system can identify different types of tumors
                including glioma, meningioma, and pituitary tumors.
              </p>
              <div className="mt-4 bg-blue-900/20 border border-blue-800/30 rounded-lg p-3 text-xs text-blue-300">
                <p className="font-medium">Important Note</p>
                <p className="mt-1">
                  This is a research tool and not intended for clinical
                  diagnosis. Always consult with healthcare professionals for
                  medical advice.
                </p>
              </div>
            </div>
          </div>

          {/* Right column: Results */}
          <div>
            {(isAnalyzing || prediction || error) && (
              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>

                <PredictionResult
                  isLoading={isAnalyzing}
                  prediction={prediction}
                  error={error || undefined}
                  onSaveToFilecoin={handleStoreOnFilecoin}
                  isSaving={isStoring}
                  cidResult={cid || undefined}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-gray-800 mt-16 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 Brain MRI Analysis Platform
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
