"use client";

import { useState, useEffect } from "react";

interface BreakingNewsProps {
  messages?: string[];
}

const defaultMessages = [
  "Admissions open for Academic Year 2083! Apply online or visit our campus. Early bird discounts available.",
  "First Term Examinations commence from Jestha 11, 2083. Download the routine from the notice board.",
  "Annual Sports Meet 2083: Registration closes on Baisakh 25. Contact class teacher for details.",
];

export default function BreakingNews({ messages = defaultMessages }: BreakingNewsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (messages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [messages.length]);

  return (
    <div className="bg-accent text-white overflow-hidden">
      <div className="container-custom flex items-center gap-3 py-2">
        <span className="shrink-0 bg-white text-accent text-xs font-bold px-3 py-0.5 rounded-full animate-pulse uppercase tracking-wider">
          Breaking
        </span>
        <div className="overflow-hidden flex-1">
          <p
            key={currentIndex}
            className="text-sm whitespace-nowrap animate-slidein"
          >
            {messages[currentIndex]}
          </p>
        </div>
      </div>
    </div>
  );
}
