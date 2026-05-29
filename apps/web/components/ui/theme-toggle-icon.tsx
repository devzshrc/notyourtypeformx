"use client";

import { motion, useReducedMotion } from "~/components/motion";
import type { CSSProperties } from "react";

const RAYS: Array<[number, number, number, number]> = [
    [12, 1, 12, 3],
    [12, 21, 12, 23],
    [1, 12, 3, 12],
    [21, 12, 23, 12],
    [4.2, 4.2, 5.6, 5.6],
    [18.4, 18.4, 19.8, 19.8],
    [18.4, 4.2, 19.8, 5.6],
    [4.2, 19.8, 5.6, 18.4],
];

const CENTER_ORIGIN: CSSProperties = { transformBox: "fill-box", transformOrigin: "center" };
const SPRING = { type: "spring", stiffness: 420, damping: 30, mass: 0.6 } as const;

/**
 * Animated sun ↔ moon. On `dark`, the rays retract and a mask circle slides in to
 * carve the disc into a crescent; on light it blooms back into a rayed sun.
 */
function ThemeToggleIcon({ dark, className }: { dark: boolean; className?: string }) {
    const shouldReduce = useReducedMotion();
    const t = shouldReduce ? { duration: 0.12 } : SPRING;

    return (
        <motion.svg
            viewBox="0 0 24 24"
            fill="none"
            className={className}
            style={CENTER_ORIGIN}
            animate={{ rotate: dark ? 45 : 0 }}
            transition={t}
        >
            <mask id="theme-moon-mask">
                <rect x="0" y="0" width="24" height="24" fill="white" />
                <motion.circle
                    r="7"
                    fill="black"
                    initial={false}
                    animate={{ cx: dark ? 17 : 30, cy: dark ? 7 : 0 }}
                    transition={t}
                />
            </mask>

            <motion.circle
                cx="12"
                cy="12"
                fill="currentColor"
                mask="url(#theme-moon-mask)"
                style={CENTER_ORIGIN}
                initial={false}
                animate={{ r: dark ? 8 : 5 }}
                transition={t}
            />

            <motion.g
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                style={CENTER_ORIGIN}
                initial={false}
                animate={{ opacity: dark ? 0 : 1, scale: dark ? 0.4 : 1, rotate: dark ? -45 : 0 }}
                transition={t}
            >
                {RAYS.map(([x1, y1, x2, y2], i) => (
                    <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
                ))}
            </motion.g>
        </motion.svg>
    );
}

export { ThemeToggleIcon };
