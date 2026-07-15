import type { SVGProps } from "react";

type IranFlagProps = SVGProps<SVGSVGElement> & {
  title?: string;
};

/** Simplified Iranian flag (green / white / red with emblem) */
export function IranFlag({
  title = "پرچم جمهوری اسلامی ایران",
  className = "h-6 w-9",
  ...props
}: IranFlagProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 900 525"
      role="img"
      aria-label={title}
      className={className}
      {...props}
    >
      <title>{title}</title>
      <rect width="900" height="175" y="0" fill="#239F40" />
      <rect width="900" height="175" y="175" fill="#FFFFFF" />
      <rect width="900" height="175" y="350" fill="#DA0000" />
      <g fill="#DA0000" transform="translate(450 262.5)">
        <path d="M0-58c-8 18-22 30-38 36 16 4 28 16 34 34 6-18 18-30 34-34-16-6-30-18-38-36z" />
        <circle r="10" />
        <path d="M-42 48h84v8H-42z" />
        <path d="M-28 22h8v30h-8zm16 0h8v30h-8zm16 0h8v30h-8zm16 0h8v30h-8z" />
      </g>
    </svg>
  );
}
