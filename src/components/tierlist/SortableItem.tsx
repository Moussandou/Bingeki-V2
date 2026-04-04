import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styles from './SortableItem.module.css';

interface SortableItemProps {
    id: string; // Unique ID (e.g., "S-1234")
    character: {
        id: number | string;
        name: string;
        image: string;
    };
}

export function TierItemDisplay({ character, style, isDragging }: { character: SortableItemProps['character'], style?: React.CSSProperties, isDragging?: boolean }) {
    return (
        <div
            className={`${styles.tierItemWrapper} ${isDragging ? styles.dragging : ''}`}
            style={style}
        >
            <div
                className={styles.tierItem}
                style={{ backgroundImage: `url(${character.image})` }}
            />
            <div className={styles.nameOverlay}>
                {character.name}
            </div>
        </div>
    );
}

export function SortableItem({ id, character }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        touchAction: 'none',
        position: 'relative' as const,
        cursor: 'grab'
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <TierItemDisplay character={character} />
        </div>
    );
}
