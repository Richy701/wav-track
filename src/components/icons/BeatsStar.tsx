import React from 'react';

interface BeatsStarProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export const BeatsStar = ({ className, ...props }: BeatsStarProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Star shape */}
      <path
        fill="currentColor"
        d="M12 2l2.4 7.4h7.6l-6.2 4.5 2.4 7.4-6.2-4.5-6.2 4.5 2.4-7.4-6.2-4.5h7.6z"
      />
      {/* Musical note overlay */}
      <path
        fill="none"
        strokeWidth="1.5"
        d="M14.5 8.5a2 2 0 01-2 2M12.5 10.5v4"
      />
      <circle
        fill="none"
        strokeWidth="1.5"
        cx="10.5"
        cy="14.5"
        r="2"
      />
    </svg>
  );
}; 