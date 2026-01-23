/**
 * FolderModal Component
 * Modal for creating and editing folders
 */

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { FOLDER_COLORS, FOLDER_EMOJIS } from '@/store/libraryStore';
import type { Folder } from '@/store/libraryStore';
import styles from './FolderModal.module.css';

interface FolderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string, color: string, emoji: string) => void;
    folder?: Folder | null; // If provided, we're editing
}

export function FolderModal({ isOpen, onClose, onSave, folder }: FolderModalProps) {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [color, setColor] = useState<string>(FOLDER_COLORS[0]);
    const [emoji, setEmoji] = useState<string>(FOLDER_EMOJIS[0]);

    useEffect(() => {
        if (folder) {
            setName(folder.name);
            setColor(folder.color);
            setEmoji(folder.emoji);
        } else {
            setName('');
            setColor(FOLDER_COLORS[0]);
            setEmoji(FOLDER_EMOJIS[0]);
        }
    }, [folder, isOpen]);

    const handleSubmit = () => {
        if (!name.trim()) return;
        onSave(name.trim(), color, emoji);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>
                    <X size={24} />
                </button>

                <h2 className={styles.title}>
                    {folder ? t('folders.edit') : t('folders.create')}
                </h2>

                <div className={styles.form}>
                    <div className={styles.field}>
                        <label>{t('folders.name')}</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t('folders.name_placeholder')}
                            className={styles.input}
                            maxLength={30}
                            autoFocus
                        />
                    </div>

                    <div className={styles.field}>
                        <label>{t('folders.emoji')}</label>
                        <div className={styles.emojiGrid}>
                            {FOLDER_EMOJIS.map((e) => (
                                <button
                                    key={e}
                                    type="button"
                                    onClick={() => setEmoji(e)}
                                    className={`${styles.emojiBtn} ${emoji === e ? styles.selected : ''}`}
                                >
                                    {e}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.field}>
                        <label>{t('folders.color')}</label>
                        <div className={styles.colorGrid}>
                            {FOLDER_COLORS.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(c)}
                                    className={`${styles.colorBtn} ${color === c ? styles.selected : ''}`}
                                    style={{ background: c }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className={styles.preview}>
                        <span style={{ color }}>{emoji}</span>
                        <span>{name || t('folders.name_placeholder')}</span>
                    </div>

                    <div className={styles.actions}>
                        <Button variant="outline" onClick={onClose}>
                            {t('common.cancel')}
                        </Button>
                        <Button onClick={handleSubmit} disabled={!name.trim()}>
                            {folder ? t('common.save') : t('folders.create_btn')}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
