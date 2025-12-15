import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { motion } from 'framer-motion';

interface LayoutProps {
    children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
    return (
        <>
            <div className="manga-bg-container">
                <div className="manga-halftone" />
                <div className="manga-speedlines" />
            </div>
            <Header />
            <motion.main
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                style={{ paddingTop: '80px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
            >
                {children}
                <Footer />
            </motion.main>
        </>
    );
}
