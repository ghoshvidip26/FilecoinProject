"use client";

import React from "react";

type FooterProps = {
  // Optional props can be added here
  copyrightText?: string;
  links?: Array<{
    title: string;
    url: string;
  }>;
};

export default function Footer({
  copyrightText = "© 2025 Brain MRI Analysis Platform",
  links = [
    { title: "Privacy Policy", url: "#" },
    { title: "Terms of Service", url: "#" },
    { title: "Contact", url: "#" },
  ],
}: FooterProps) {
  return (
    <footer className="w-full border-t border-gray-800/50 mt-16 py-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/50 to-gray-900/80 backdrop-blur-sm"></div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative group">
            <p className="text-gray-400 text-sm transition-colors duration-200 group-hover:text-gray-300">
              {copyrightText}
            </p>
            <div className="absolute -inset-x-4 -inset-y-2 bg-gray-800/0 group-hover:bg-gray-800/50 rounded-lg transition-all duration-300 -z-10"></div>
          </div>

          <div className="flex items-center gap-6">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.url}
                className="relative text-gray-400 hover:text-white text-sm transition-all duration-200 group"
              >
                <span>{link.title}</span>
                <span className="absolute -inset-x-2 -inset-y-1 bg-gray-800/0 group-hover:bg-gray-800/50 rounded-md transition-all duration-300 -z-10"></span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
