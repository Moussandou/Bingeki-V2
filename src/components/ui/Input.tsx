import React from 'react';
import { cn } from '@/utils/cn';
import styles from './Input.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, error, ...props }, ref) => {
        return (
            <div className={styles.inputWrapper}>
                <input
                    ref={ref}
                    className={cn(styles.input, error && styles.error, className)}
                    {...props}
                />
            </div>
        );
    }
);

Input.displayName = "Input";
