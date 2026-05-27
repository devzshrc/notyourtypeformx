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
const EASE = [0.23, 1, 0.32, 1] as const; // Strong ease-out (Emil Kowalski)
const SPRING_DEFAULT = { type: "spring", stiffness: 300, damping: 30 } as const;
const SPRING_SNAPPY  = { type: "spring", stiffness: 400, damping: 17 } as const;
const SPRING_SLOW    = { type: "spring", stiffness: 200, damping: 28 } as const;

// ─── will-change style objects (module-level to prevent new object per render) ─
const WC_TRANSFORM:         CSSProperties = { willChange: "transform" };
const WC_OPACITY_TRANSFORM: CSSProperties = { willChange: "opacity, transform" };
const WC_OPACITY:           CSSProperties = { willChange: "opacity" };

// ─── Module-level variants (never inline — per performance guidelines) ────────

const fadeInVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
};

const fadeInViewVariants: Variants = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0 },
};

const staggerContainerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07, delayChildren: 0 } },
};

const staggerItemVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { ...SPRING_DEFAULT } },
};

const staggerViewContainerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
};

const staggerViewItemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { ...SPRING_DEFAULT } },
};

const slideInVariants: Record<string, Variants> = {
    left:  { hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } },
    right: { hidden: { opacity: 0, x:  20 }, visible: { opacity: 1, x: 0 } },
    up:    { hidden: { opacity: 0, y: -20 }, visible: { opacity: 1, y: 0 } },
    down:  { hidden: { opacity: 0, y:  20 }, visible: { opacity: 1, y: 0 } },
};

const scaleInVariants: Variants = {
    hidden: { opacity: 0, scale: 0.93 },
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
                : { duration: 0.35, delay, ease: EASE }
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
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeInViewVariants}
            transition={shouldReduce
                ? { duration: 0 }
                : { duration: 0.5, delay, ease: EASE }
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
            initial={{ opacity: 0, y: shouldReduce ? 0 : 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: shouldReduce ? 0 : -6 }}
            transition={{ duration: 0.22, ease: EASE }}
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
    amount = -4,
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
            whileHover={shouldReduce ? {} : { scale: 1.03 }}
            whileTap={shouldReduce ? {} : { scale: 0.97 }}
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
            whileHover={shouldReduce ? {} : { scale: 1.015, y: -3 }}
            whileTap={shouldReduce ? {} : { scale: 0.99 }}
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
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5, delay, repeat: Infinity, ease: "easeInOut" }}
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
            animate={{ opacity: [1, 0.6, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
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
