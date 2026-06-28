import React, { useState } from 'react';

export default function ThreeBackground() {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  return (
    <div
      className="fixed inset-0 select-none pointer-events-none w-full h-full overflow-hidden bg-[#020617]"
      style={{ zIndex: -10 }}
    >
      {/* Base background */}
      <div className="absolute inset-0 bg-[#020617]" />

      {/* 
        Vivid, Ultra-Bright Cinematic Video Background:
        - Opacity set to 95% - 100% for maximum visibility
        - Filters: brightness-130, contrast-115, saturate-140 to make the colors pop beautifully and look extremely high-quality and crisp.
        - No blur filters on the video itself to maintain razor-sharp quality.
      */}
      <video
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 brightness-130 contrast-115 saturate-140 ${
          isVideoLoaded ? 'opacity-95 md:opacity-100' : 'opacity-0'
        }`}
        src="https://res.cloudinary.com/dt7bmkp7x/video/upload/VID-20260627-WA0057_rdjdgq.mp4"
        autoPlay
        loop
        muted
        playsInline
        onCanPlayThrough={() => setIsVideoLoaded(true)}
      />

      {/* Very light radial vignette gradient overlay to frame the video without washing it out */}
      <div className="absolute inset-0 bg-radial-[circle_at_center,transparent_45%,rgba(2,6,23,0.45)_100%] pointer-events-none" />

      {/* 
        Zero backdrop blur to keep the video perfectly sharp and detailed.
        We use a very subtle dark overlay (only 15% opacity) so the texts remain extremely clean and readable while letting the full glory of the video shine through.
      */}
      <div className="absolute inset-0 bg-slate-950/15 pointer-events-none" />

      {/* Soft gradient fades at the very top and bottom to seamlessly transition into sections */}
      <div className="absolute top-0 inset-x-0 h-36 bg-gradient-to-b from-[#020617] to-transparent opacity-80" />
      <div className="absolute bottom-0 inset-x-0 h-36 bg-gradient-to-t from-[#020617] to-transparent opacity-80" />
    </div>
  );
}
