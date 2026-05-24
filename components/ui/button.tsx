import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "gold" | "dark" | "ghost";
};

export function Button({ className, variant = "gold", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-black uppercase tracking-[0.08em] transition duration-300 disabled:cursor-not-allowed disabled:opacity-60",
        variant === "gold" &&
          "bg-rovix-gold text-black shadow-gold hover:-translate-y-0.5 hover:bg-[#ffe45a] hover:shadow-gold-strong",
        variant === "dark" &&
          "border border-white/15 bg-white/8 text-white hover:border-rovix-gold/70 hover:bg-white/12",
        variant === "ghost" && "text-white/70 hover:bg-white/10 hover:text-white",
        className
      )}
      {...props}
    />
  );
}
