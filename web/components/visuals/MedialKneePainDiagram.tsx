'use client';
import React from 'react';
import Image from 'next/image';

interface MedialKneePainDiagramProps {
  className?: string;
  painAreaX?: string; // Percentage from left, e.g., '50%'
  painAreaY?: string; // Percentage from top, e.g., '50%'
  painAreaSize?: string; // Size of the glowing circle, e.g., '120px'
}

export default function MedialKneePainDiagram({
  className = '',
  painAreaX = '50%',
  painAreaY = '50%',
  painAreaSize = '120px'
}: MedialKneePainDiagramProps) {
  return (
    <div className={`relative overflow-hidden rounded-xl border border-gray-200 bg-white max-w-2xl mx-auto shadow-sm ${className}`}>
      {/* Light gray grid background */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          backgroundImage: 'linear-gradient(to right, #f0f0f0 1px, transparent 1px), linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* The image container */}
      <div className="relative w-full aspect-square md:aspect-[4/3] flex items-center justify-center p-4">
        {/* We use next/image to render the anatomically correct medial knee */}
        <Image 
          src="/images/illustrations/real-knee-medial-v2.png"
          alt="Medial anatomy of the knee"
          fill
          className="object-contain drop-shadow-md relative z-10 p-6"
          priority
        />

        {/* The glowing pain highlight (placed over the MCL area) */}
        {/* We use mix-blend-multiply and blur to make it look like a natural glow */}
        <div 
          className="absolute z-20 rounded-full bg-orange-600/50 mix-blend-multiply blur-2xl"
          style={{
            left: painAreaX,
            top: painAreaY,
            width: painAreaSize,
            height: painAreaSize,
            transform: 'translate(-50%, -50%)',
          }}
        />
        
        {/* Inner bright core for the pain glow */}
        <div 
          className="absolute z-20 rounded-full bg-orange-400/60 mix-blend-screen blur-xl"
          style={{
            left: painAreaX,
            top: painAreaY,
            width: `calc(${painAreaSize} * 0.6)`,
            height: `calc(${painAreaSize} * 0.6)`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>
    </div>
  );
}
