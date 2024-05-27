"use client";
export default function LoadingSpinner({ size }: { size?: string }) {
    let sizeClass = "spinner-border-md";
    if (size === "sm") {
        sizeClass = "spinner-border-sm";
    }
    return (
        <>
            <div className={`spinner-border ${sizeClass}`} role="status"></div>
        </>
    );
}
