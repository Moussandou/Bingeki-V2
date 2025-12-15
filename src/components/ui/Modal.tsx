import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.7)',
                            backdropFilter: 'blur(5px)',
                            zIndex: 999
                        }}
                    />
                    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, pointerEvents: 'none' }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            style={{ pointerEvents: 'auto', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}
                        >
                            <Card variant="glass" style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    {title && <h3 style={{ fontSize: '1.5rem' }}>{title}</h3>}
                                    <Button variant="ghost" size="icon" onClick={onClose}>
                                        <X size={20} />
                                    </Button>
                                </div>
                                {children}
                            </Card>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
