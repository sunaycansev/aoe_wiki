import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}
export const PlayIcon = ({ size = 24, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    fill="currentColor"
    viewBox="0 0 16 16"
    {...props}
  >
    <path d="M10.804 8 5 4.633v6.734L10.804 8z" />
  </svg>
);
