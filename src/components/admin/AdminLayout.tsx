import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';

export function AdminLayout() {
    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            background: '#f0f0f0', // Light gray background for contrast
            color: '#000',
            fontFamily: 'Inter, sans-serif'
        }}>
            <AdminSidebar />

            <main style={{
                flex: 1,
                marginLeft: '280px', // Matches sidebar width
                padding: '3rem',
                overflowY: 'auto'
            }}>
                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto'
                }}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
