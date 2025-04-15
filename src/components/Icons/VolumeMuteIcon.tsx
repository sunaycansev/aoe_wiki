import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}
export const VolumeMuteIcon = ({ size = 24, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    fill="currentColor"
    viewBox="0 0 16 16"
    {...props}
  >
    <path d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06zm7.137 2.096a.5.5 0 0 1 0 .708L11.207 8l2.647 2.646a.5.5 0 0 1-.708.708L10.5 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L9.793 8 7.146 5.354a.5.5 0 1 1 .708-.708L10.5 7.293l2.646-2.647a.5.5 0 0 1 .708 0z" />
  </svg>
);
