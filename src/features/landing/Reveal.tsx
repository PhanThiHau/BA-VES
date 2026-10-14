import { type CSSProperties, type ElementType, type ReactNode } from "react";

export type RevealVariant = "up" | "left" | "right" | "zoom" | "fade" | "none";

interface RevealProps {
  children: ReactNode;
  variant?: RevealVariant;
  delay?: number;
  duration?: number;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
}

export function Reveal({
  children,
  variant = "up",
  delay = 0,
  duration = 650,
  as: Tag = "div",
  className = "",
  style,
}: RevealProps) {
  const aosAnimation =
    variant === "left"
      ? "fade-right"
      : variant === "right"
      ? "fade-left"
      : variant === "zoom"
      ? "zoom-in"
      : variant === "fade"
      ? "fade"
      : variant === "none"
      ? undefined
      : "fade-up";

  return (
    <Tag
      data-aos={aosAnimation}
      data-aos-delay={delay > 0 ? delay : undefined}
      data-aos-duration={duration}
      data-aos-easing="ease-in-out"
      data-aos-once="true"
      className={className}
      style={style}
    >
      {children}
    </Tag>
  );
}