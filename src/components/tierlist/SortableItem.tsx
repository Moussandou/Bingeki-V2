
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableItemProps {
    id: string; // Unique ID (e.g., "S-1234")
    character: {
        id: number;
        name: string;
        image: string;
    };
}

export function TierItemDisplay({ character, style }: { character: any, style?: React.CSSProperties }) {
    return (
        <div
            className="tier-item"
            style={{
                ...style,
                position: 'relative',
                touchAction: 'none'
            }}
        >
            <div style={{
                width: '80px',
                height: '80px',
                backgroundImage: `url(${character.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '4px',
                border: '2px solid black',
                cursor: 'inherit'
            }} />
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'rgba(0,0,0,0.8)',
                color: 'white',
                fontSize: '0.6rem',
                padding: '2px',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
            }}>
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
