import { ElementType, ReactNode } from 'react';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'outline' | 'glass-light' | 'glass-dark';

interface BadgeProps {
    children: ReactNode;
    variant?: BadgeVariant;
    icon?: ElementType;
    className?: string;
}

export default function Badge({ children, variant = 'default', icon: Icon, className = '' }: BadgeProps) {
    const baseStyles = "inline-flex items-center px-3 py-1.5 rounded-full text-[var(--text-scale-sm)] font-medium transition-colors border";

    const variants: Record<BadgeVariant, string> = {
        default: "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-transparent",
        primary: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-transparent",
        success: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-transparent",
        warning: "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 border-transparent",
        danger: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-transparent",
        outline: "bg-transparent text-[var(--foreground)] border-slate-200 dark:border-slate-700",
        "glass-light": "bg-white/90 dark:bg-white/80 backdrop-blur-md text-slate-900 border-white/20 shadow-sm",
        "glass-dark": "bg-black/60 dark:bg-black/40 backdrop-blur-md text-white border-white/10 shadow-sm",
    };

    return (
        <span className={`${baseStyles} ${variants[variant]} ${className}`}>
            {Icon && <Icon className="h-3.5 w-3.5 mr-1" />}
            {children}
        </span>
    );
}
