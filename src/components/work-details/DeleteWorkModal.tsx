import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface DeleteWorkModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    workTitle: string;
}

export function DeleteWorkModal({
    isOpen,
    onClose,
    onConfirm,
    workTitle
}: DeleteWorkModalProps) {
    const { t } = useTranslation();

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('work_details.danger.modal_title')}>
            <div style={{ textAlign: 'center', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                    <div style={{ background: '#fee2e2', padding: '1rem', borderRadius: '50%', color: '#dc2626' }}>
                        <AlertTriangle size={32} />
                    </div>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--color-text)' }}>
                    {t('work_details.danger.confirm_title', { title: workTitle })}
                </h3>
                <p style={{ marginBottom: '2rem', opacity: 0.7 }}>
                    {t('work_details.danger.confirm_desc')}
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <Button variant="ghost" onClick={onClose}>
                        {t('work_details.danger.cancel')}
                    </Button>
                    <Button
                        variant="primary"
                        onClick={onConfirm}
                        style={{ background: '#dc2626', borderColor: '#b91c1c' }}
                    >
                        {t('work_details.danger.confirm_delete')}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
