import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/utils/cn';
import styles from './Button.module.css';

interface ButtonProps extends HTMLMotionProps<"button"> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'manga';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
    icon?: React.ReactNode;
    children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, icon, children, ...props }, ref) => {
        return (
            <motion.button
                ref={ref}
                className={cn(styles.button, styles[variant], styles[size], className)}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                initial={false}
                {...props}
            >
                {isLoading ? (
                    <span className="animate-spin" style={{ display: 'inline-block', width: '1em', height: '1em', border: '2px solid currentColor', borderRadius: '50%', borderTopColor: 'transparent' }} />
                ) : icon ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
                ) : null}
                {children}
            </motion.button>
        );
    }
);

Button.displayName = "Button";
