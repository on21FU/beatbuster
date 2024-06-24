"use client";

type ColorOptions = "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "light" | "dark"
type Sizes = "sm" | "md" | "lg" | "xl"

export default function LoadingSpinner({ size = "md", color = "primary" }: { size?: Sizes, color?: ColorOptions }) {
    return (
        <>
            <div className={`spinner-border spinner-border-${size} text-${color}`} role="status"></div>
        </>
    );
}
