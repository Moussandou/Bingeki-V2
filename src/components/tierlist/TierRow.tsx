
import { useTranslation } from 'react-i18next';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem, TierItemDisplay } from './SortableItem';
import { X } from 'lucide-react';
import styles from './TierRow.module.css';

interface TierItem {
    id: number | string;
    name: string;
    image: string;
}

interface TierRowProps {
    tier: {
        id: string;
        label: string;
        color: string;
        items: TierItem[];
    };
    onLabelChange?: (newLabel: string) => void;
    onColorChange?: (newColor: string) => void;
    onDelete?: () => void;
    readOnly?: boolean;
}

export function TierRow({ tier, onLabelChange, onColorChange, onDelete, readOnly = false }: TierRowProps) {
    const { t } = useTranslation();
    const { setNodeRef } = useDroppable({
        id: tier.id,
        disabled: readOnly
    });

    return (
        <div className={styles.row}>
            {/* Label Column — background stays inline (dynamic tier color) */}
            <div
                className={styles.labelCell}
                style={{ background: tier.color }}
            >
                {readOnly ? (
                    <div className={styles.labelText}>
                        {tier.label}
                    </div>
                ) : (
                    <>
                        <input
                            value={tier.label}
                            onChange={(e) => onLabelChange && onLabelChange(e.target.value)}
                            className={styles.labelInput}
                        />
                        <input
                            type="color"
                            value={tier.color}
                            onChange={(e) => onColorChange && onColorChange(e.target.value)}
                            className={styles.colorPicker}
                        />
                    </>
                )}
            </div>

            {/* Droppable Area */}
            {readOnly ? (
                <div className={styles.droppable}>
                    {tier.items.map((item) => (
                        <TierItemDisplay key={item.id} character={item} />
                    ))}
                </div>
            ) : (
                <SortableContext
                    id={tier.id}
                    items={tier.items.map(item => `${tier.id}-${item.id}`)}
                    strategy={horizontalListSortingStrategy}
                >
                    <div ref={setNodeRef} className={styles.droppable}>
                        {tier.items.map((item) => (
                            <SortableItem
                                key={`${tier.id}-${item.id}`}
                                id={`${tier.id}-${item.id}`}
                                character={item}
                            />
                        ))}
                        {tier.items.length === 0 && (
                            <div className={styles.dropPlaceholder}>
                                {t('tierlist.drop_items_here')}
                            </div>
                        )}
                    </div>
                </SortableContext>
            )}

            {/* Controls */}
            {!readOnly && (
                <div className={styles.controls}>
                    {onDelete && (
                        <button onClick={onDelete} className={styles.deleteButton}>
                            <X size={20} />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
