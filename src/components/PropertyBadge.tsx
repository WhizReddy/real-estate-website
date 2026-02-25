import { ElementType } from 'react';

interface PropertyBadgeProps {
    icon: ElementType;
    value: string | number;
    label: string;
}

export default function PropertyBadge({ icon: Icon, value, label }: PropertyBadgeProps) {
    return (
        <div className="card text-center p-[var(--spacing-lg)] bg-primary/5 hover:bg-primary/10 border-transparent hover:border-primary/20 hover:shadow-md transition-all duration-300">
            <Icon className="h-6 w-6 text-[var(--primary)] mx-auto mb-[var(--spacing-sm)]" />
            <div className="text-[var(--text-scale-h2)] font-bold text-gray-900 dark:text-white leading-tight mb-1">{value}</div>
            <div className="text-[var(--text-scale-sm)] text-gray-600 dark:text-gray-400 font-medium">{label}</div>
        </div>
    );
}
