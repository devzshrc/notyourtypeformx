"use client";

import {
    motion,
    AnimatePresence,
    useInView,
    useMotionValue,
    useSpring,
    useTransform,
    useScroll,
    useReducedMotion,
    type Variants,
} from "motion/react";
import { useRef, useEffect, type ReactNode, type CSSProperties } from "react";

// ─── Shared easing & spring configs (module-level, never recreated) ─────────
// Extremely subtle: opacity-led, near-zero travel, no overshoot. Motion should be
// felt, not seen. Both springs are over-damped (no bounce) so transforms just settle.
const EASE      = [0.4, 0, 0.2, 1] as const; // gentle in-out (entrances + transitions)
const EASE_SOFT = [0.4, 0, 0.2, 1] as const; // same curve — keep everything uniform & soft
const SPRING_DEFAULT = { type: "spring", stiffness: 260, damping: 34, mass: 1 } as const; // soft, no overshoot
const SPRING_SNAPPY  = { type: "spring", stiffness: 320, damping: 32, mass: 1 } as const; // gentle, no overshoot

// ─── will-change style objects (module-level to prevent new object per render) ─
const WC_TRANSFORM:         CSSProperties = { willChange: "transform" };
const WC_OPACITY_TRANSFORM: CSSProperties = { willChange: "opacity, transform" };
const WC_OPACITY:           CSSProperties = { willChange: "opacity" };

// ─── Module-level variants (never inline — per performance guidelines) ────────

const fadeInVariants: Variants = {
    hidden: { opacity: 0, y: 3 },
    visible: { opacity: 1, y: 0 },
};

const fadeInViewVariants: Variants = {
    hidden: { opacity: 0, y: 5 },
    visible: { opacity: 1, y: 0 },
};

const staggerContainerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.035, delayChildren: 0 } },
};

const staggerItemVariants: Variants = {
    hidden: { opacity: 0, y: 4 },
    visible: { opacity: 1, y: 0, transition: { ...SPRING_DEFAULT } },
};

const staggerViewContainerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.04 } },
};

const staggerViewItemVariants: Variants = {
    hidden: { opacity: 0, y: 5 },
    visible: { opacity: 1, y: 0, transition: { ...SPRING_DEFAULT } },
};

const slideInVariants: Record<string, Variants> = {
    left:  { hidden: { opacity: 0, x: -6 }, visible: { opacity: 1, x: 0 } },
    right: { hidden: { opacity: 0, x:  6 }, visible: { opacity: 1, x: 0 } },
    up:    { hidden: { opacity: 0, y: -6 }, visible: { opacity: 1, y: 0 } },
    down:  { hidden: { opacity: 0, y:  6 }, visible: { opacity: 1, y: 0 } },
};

const scaleInVariants: Variants = {
    hidden: { opacity: 0, scale: 0.99 },
    visible: { opacity: 1, scale: 1, transition: { ...SPRING_SNAPPY } },
};

// ─── FadeIn — on mount, subtle y-slide with opacity ──────────────────────────
export function FadeIn({
    children,
    delay = 0,
    className = "",
}: {
    children: ReactNode;
    delay?: number;
    className?: string;
}) {
    const shouldReduce = useReducedMotion();
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInVariants}
            transition={shouldReduce
                ? { duration: 0 }
                : { duration: 0.3, delay, ease: EASE }
            }
            style={WC_OPACITY_TRANSFORM}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// ─── FadeInView — fade in when scrolled into viewport ────────────────────────
export function FadeInView({
    children,
    delay = 0,
    className = "",
}: {
    children: ReactNode;
    delay?: number;
    className?: string;
}) {
    const shouldReduce = useReducedMotion();
    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={fadeInViewVariants}
            transition={shouldReduce
                ? { duration: 0 }
                : { duration: 0.4, delay, ease: EASE }
            }
            style={WC_OPACITY_TRANSFORM}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// ─── StaggerList — mount stagger for lists ────────────────────────────────────
export function StaggerList({
    children,
    className = "",
    delay = 0,
}: {
    children: ReactNode;
    className?: string;
    delay?: number;
}) {
    const shouldReduce = useReducedMotion();
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={shouldReduce ? {} : {
                ...staggerContainerVariants,
                visible: {
                    transition: { staggerChildren: 0.07, delayChildren: delay },
                },
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function StaggerItem({
    children,
    className = "",
}: {
    children: ReactNode;
    className?: string;
}) {
    const shouldReduce = useReducedMotion();
    return (
        <motion.div
            variants={shouldReduce ? {} : staggerItemVariants}
            style={WC_OPACITY_TRANSFORM}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// ─── StaggerView — viewport-triggered stagger ─────────────────────────────────
export function StaggerView({
    children,
    className = "",
}: {
    children: ReactNode;
    className?: string;
}) {
    const shouldReduce = useReducedMotion();
    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={shouldReduce ? {} : staggerViewContainerVariants}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function StaggerViewItem({
    children,
    className = "",
}: {
    children: ReactNode;
    className?: string;
}) {
    const shouldReduce = useReducedMotion();
    return (
        <motion.div
            variants={shouldReduce ? {} : staggerViewItemVariants}
            style={WC_OPACITY_TRANSFORM}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// ─── SlideIn — directional entrance ──────────────────────────────────────────
export function SlideIn({
    children,
    direction = "right",
    delay = 0,
    className = "",
}: {
    children: ReactNode;
    direction?: "left" | "right" | "up" | "down";
    delay?: number;
    className?: string;
}) {
    const shouldReduce = useReducedMotion();
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={shouldReduce ? {} : slideInVariants[direction]}
            transition={{ ...SPRING_DEFAULT, delay }}
            style={WC_OPACITY_TRANSFORM}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// ─── ScaleIn — scale-up entrance ─────────────────────────────────────────────
export function ScaleIn({
    children,
    delay = 0,
    className = "",
}: {
    children: ReactNode;
    delay?: number;
    className?: string;
}) {
    const shouldReduce = useReducedMotion();
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={shouldReduce ? {} : scaleInVariants}
            transition={{ ...SPRING_SNAPPY, delay }}
            style={WC_OPACITY_TRANSFORM}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// ─── PageTransition — page-level enter/exit ───────────────────────────────────
export function PageTransition({
    children,
    className = "",
}: {
    children: ReactNode;
    className?: string;
}) {
    const shouldReduce = useReducedMotion();
    return (
        <motion.div
            initial={{ opacity: 0, y: shouldReduce ? 0 : 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: shouldReduce ? 0 : -3 }}
            transition={shouldReduce ? { duration: 0 } : { duration: 0.22, ease: EASE_SOFT }}
            style={WC_OPACITY_TRANSFORM}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// ─── Gesture wrappers ─────────────────────────────────────────────────────────

/** Lift card on hover — spring, hardware accelerated */
export function HoverLift({
    children,
    className = "",
    amount = -2,
}: {
    children: ReactNode;
    className?: string;
    amount?: number;
}) {
    const shouldReduce = useReducedMotion();
    return (
        <motion.div
            whileHover={shouldReduce ? {} : { y: amount }}
            transition={SPRING_DEFAULT}
            style={WC_TRANSFORM}
            className={className}
        >
            {children}
        </motion.div>
    );
}

/** Scale on hover + press — for buttons/clickables */
export function ScaleTap({
    children,
    className = "",
}: {
    children: ReactNode;
    className?: string;
}) {
    const shouldReduce = useReducedMotion();
    return (
        <motion.div
            whileHover={shouldReduce ? {} : { scale: 1.01 }}
            whileTap={shouldReduce ? {} : { scale: 0.985 }}
            transition={SPRING_SNAPPY}
            style={WC_TRANSFORM}
            className={className}
        >
            {children}
        </motion.div>
    );
}

/** Gentler scale for cards */
export function ScaleCard({
    children,
    className = "",
}: {
    children: ReactNode;
    className?: string;
}) {
    const shouldReduce = useReducedMotion();
    return (
        <motion.div
            whileHover={shouldReduce ? {} : { scale: 1.006, y: -1.5 }}
            whileTap={shouldReduce ? {} : { scale: 0.994 }}
            transition={SPRING_DEFAULT}
            style={WC_TRANSFORM}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// ─── Float — ambient floating animation ──────────────────────────────────────
export function Float({
    children,
    className = "",
    delay = 0,
}: {
    children: ReactNode;
    className?: string;
    delay?: number;
}) {
    const shouldReduce = useReducedMotion();
    if (shouldReduce) return <div className={className}>{children}</div>;
    return (
        <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 6.5, delay, repeat: Infinity, ease: "easeInOut" }}
            style={WC_TRANSFORM}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// ─── Pulse — opacity pulse for live indicators ───────────────────────────────
export function Pulse({
    children,
    className = "",
}: {
    children: ReactNode;
    className?: string;
}) {
    const shouldReduce = useReducedMotion();
    if (shouldReduce) return <div className={className}>{children}</div>;
    return (
        <motion.div
            animate={{ opacity: [1, 0.82, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={WC_OPACITY}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// ─── AnimatedNumber counter (scroll-triggered) ────────────────────────────────
export function CountUp({
    value,
    suffix = "",
    className = "",
}: {
    value: number;
    suffix?: string;
    className?: string;
}) {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true });
    const motionVal = useMotionValue(0);
    const springVal = useSpring(motionVal, { stiffness: 60, damping: 20, restDelta: 0.5 });
    const display = useTransform(springVal, (v) => `${Math.round(v)}${suffix}`);
    const shouldReduce = useReducedMotion();

    useEffect(() => {
        if (isInView) motionVal.set(shouldReduce ? value : value);
    }, [isInView, value, motionVal, shouldReduce]);

    return <motion.span ref={ref} className={className}>{display}</motion.span>;
}

// ─── Re-exports ───────────────────────────────────────────────────────────────
export {
    AnimatePresence,
    motion,
    useInView,
    useMotionValue,
    useSpring,
    useTransform,
    useScroll,
    useReducedMotion,
};

export type { Variants };
