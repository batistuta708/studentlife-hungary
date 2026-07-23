import { HTMLAttributes } from "react";
import clsx from "clsx";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  hoverable?: boolean;
}

export function Card({ glass, hoverable, className, children, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        glass ? "glass" : "card",
        "rounded-2xl p-5",
        hoverable && "transition hover:-translate-y-0.5 hover:shadow-md",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
