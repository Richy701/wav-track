import React from 'react';

interface DawIconProps {
  className?: string;
}

export const FLStudioIcon: React.FC<DawIconProps> = ({ className }) => (
  <img 
    src="/assets/daw-logos/fl-studio.png" 
    alt="FL Studio"
    className={className}
  />
);

export const AbletonIcon: React.FC<DawIconProps> = ({ className }) => (
  <img 
    src="/assets/daw-logos/ableton.png" 
    alt="Ableton Live"
    className={`dark:invert ${className}`}
  />
);

export const LogicProIcon: React.FC<DawIconProps> = ({ className }) => (
  <img 
    src="/assets/daw-logos/Logic pro.png" 
    alt="Logic Pro"
    className={className}
  />
);

export const ProToolsIcon: React.FC<DawIconProps> = ({ className }) => (
  <img 
    src="/assets/daw-logos/pro-tools.png" 
    alt="Pro Tools"
    className={className}
  />
);

export const StudioOneIcon: React.FC<DawIconProps> = ({ className }) => (
  <img 
    src="/assets/daw-logos/Studio one.png" 
    alt="Studio One"
    className={`dark:invert ${className}`}
  />
);

export const BitwigIcon: React.FC<DawIconProps> = ({ className }) => (
  <img 
    src="/assets/daw-logos/bitwig.png" 
    alt="Bitwig"
    className={className}
  />
);

export const ReaperIcon: React.FC<DawIconProps> = ({ className }) => (
  <img 
    src="/assets/daw-logos/reaper.png" 
    alt="Reaper"
    className={className}
  />
); 