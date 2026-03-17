import React, { useState, useRef, useEffect } from 'react';
import { Download, Layout, Type, Search, Plus, Trash2, Settings, Moon, Sun, Image as ImageIcon } from 'lucide-react';
import html2canvas from 'html2canvas';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import styles from './SocialGenerator.module.css';
import bgDashboard from '@/assets/theme/bg_dashboard.png';

type FormatData = {
    id: string;
    label: string;
    width: number;
    height: number;
};

const FORMATS: FormatData[] = [
    { id: 'square', label: 'Instagram (1:1)', width: 1080, height: 1080 },
    { id: 'landscape', label: 'Paysage (16:9)', width: 1920, height: 1080 },
    { id: 'story', label: 'Story / TikTok (9:16)', width: 1080, height: 1920 },
];

type DynamicElement = {
    id: string;
    type: 'text' | 'image';
    content: string; // Text content or Image URL
    x: number;
    y: number;
    color: string;
    fontSize: number; // Also used as a generic scale metric for images
    fontWeight: number | string;
    shadow: boolean;
    bgColor: string;
    isTitle: boolean;
};

export default function SocialGenerator() {
    const canvasRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    
    // UI states
    const [activeTab, setActiveTab] = useState<'format' | 'elements'>('format');
    const [isGenerating, setIsGenerating] = useState(false);
    
    // Canvas states
    const [format, setFormat] = useState<string>('square');
    const [scale, setScale] = useState(0.4);
    const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
    const [isDarkTheme, setIsDarkTheme] = useState(true);
    
    const [elements, setElements] = useState<DynamicElement[]>([
        {
            id: 'title-1',
            type: 'text',
            content: 'DÉCOUVREZ BINGEKI !',
            x: 0,
            y: 0,
            color: '#FFFFFF',
            fontSize: 80,
            fontWeight: 900,
            shadow: true,
            bgColor: 'transparent',
            isTitle: true
        },
        {
            id: 'desc-1',
            type: 'text',
            content: 'La plateforme ultime pour suivre vos animés.',
            x: 0,
            y: 0,
            color: '#FFFFFF',
            fontSize: 40,
            fontWeight: 700,
            shadow: true,
            bgColor: 'rgba(0,0,0,0.6)',
            isTitle: false
        }
    ]);
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });

    // Jikan Search states
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const currentFormat = FORMATS.find(f => f.id === format) || FORMATS[0];

    // Auto layout initial positions based on format
    useEffect(() => {
        setElements(prev => prev.map(el => {
            if (el.x === 0 && el.y === 0) {
                // Approximate center-ish positions
                return {
                    ...el,
                    x: el.isTitle ? 50 : 50,
                    y: el.isTitle ? 100 : 300
                }
            }
            return el;
        }));
    }, [format]);

    // Better scaling to ensure canvas always fits
    useEffect(() => {
        const calculateScale = () => {
            if (!wrapperRef.current) return;
            // Get available space minus some safe padding
            const containerWidth = wrapperRef.current.clientWidth - 40; 
            const containerHeight = Math.min(window.innerHeight - 200, wrapperRef.current.clientHeight - 40);
            
            const scaleX = containerWidth / currentFormat.width;
            const scaleY = containerHeight / currentFormat.height;
            
            // Take the smallest scale so both dimensions fit completely without scrolling
            setScale(Math.min(scaleX, scaleY));
        };

        calculateScale();
        // Recalculate if images load or format changes
        const timeout = setTimeout(calculateScale, 100);
        window.addEventListener('resize', calculateScale);
        return () => {
            window.removeEventListener('resize', calculateScale);
            clearTimeout(timeout);
        };
    }, [currentFormat]);

    // --- Actions ---

    const handlePointerDown = (e: React.PointerEvent, id: string) => {
        // e.stopPropagation();
        setSelectedElementId(id);
        setDraggingId(id);
        setDragStartPos({ x: e.clientX, y: e.clientY });
        
        // Use pointer capture so we don't lose the element if cursor moves fast
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!draggingId) return;
        
        // Prevent default text selection during drag
        e.preventDefault();

        const el = elements.find(el => el.id === draggingId);
        if (!el) return;

        const dx = (e.clientX - dragStartPos.x) / scale;
        const dy = (e.clientY - dragStartPos.y) / scale;

        updateElement(draggingId, {
            x: el.x + dx,
            y: el.y + dy
        });
        
        setDragStartPos({ x: e.clientX, y: e.clientY });
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (draggingId) {
            (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
            setDraggingId(null);
        }
    };

    const handleJikanSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(searchQuery)}&limit=5`);
            const data = await res.json();
            setSearchResults(data.data || []);
        } catch (e) {
            console.error("Jikan Search failed", e);
        } finally {
            setIsSearching(false);
        }
    };

    const handleImageUploadAsBg = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setBackgroundImage(url);
        }
    };

    const handleImageUploadAsElement = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            const newEl: DynamicElement = {
                id: `el-${Date.now()}`,
                type: 'image',
                content: url,
                x: 100,
                y: 100,
                color: '#FFFFFF', // Not used for images but required by type
                fontSize: 100, // Used as width % for images initially, or px size
                fontWeight: 400,
                shadow: true,
                bgColor: 'transparent',
                isTitle: false
            };
            setElements([...elements, newEl]);
            setSelectedElementId(newEl.id);
            setActiveTab('elements');
        }
        // Reset the input value so user can upload the same image again if needed
        e.target.value = '';
    };

    const addTextElement = (isTitle: boolean) => {
        const newEl: DynamicElement = {
            id: `el-${Date.now()}`,
            type: 'text',
            content: isTitle ? 'NOUVEAU TITRE' : 'Nouveau texte',
            x: 100,
            y: 100,
            color: '#FFFFFF',
            fontSize: isTitle ? 80 : 40,
            fontWeight: isTitle ? 900 : 700,
            shadow: true,
            bgColor: isTitle ? 'transparent' : 'rgba(0,0,0,0.6)',
            isTitle
        };
        setElements([...elements, newEl]);
        setSelectedElementId(newEl.id);
        setActiveTab('elements');
    };

    const updateElement = (id: string, updates: Partial<DynamicElement>) => {
        setElements(elements.map(el => el.id === id ? { ...el, ...updates } : el));
    };

    const deleteElement = (id: string) => {
        setElements(elements.filter(el => el.id !== id));
        if (selectedElementId === id) setSelectedElementId(null);
    };

    const handleDownload = async () => {
        if (!canvasRef.current || isGenerating) return;
        setIsGenerating(true);
        
        // Hide selection styling temporarily
        const oldSelected = selectedElementId;
        setSelectedElementId(null);
        
        // Need to wait for React to remove selection borders before capture
        await new Promise(r => setTimeout(r, 50)); 
        
        try {
            const canvas = await html2canvas(canvasRef.current, {
                scale: 1, 
                useCORS: true,
                allowTaint: true,
                backgroundColor: null,
                width: currentFormat.width,
                height: currentFormat.height,
            });

            const image = canvas.toDataURL('image/png', 1.0);
            const link = document.createElement('a');
            link.download = `bingeki-social-${format}-${Date.now()}.png`;
            link.href = image;
            link.click();
            
        } catch (error) {
            console.error('Failed to generate image:', error);
            alert('Images from Jikan API might block download due to strict CORS rules on external images. Try local images if this fails persistently.');
        } finally {
            setIsGenerating(false);
            setSelectedElementId(oldSelected);
        }
    };

    const renderPropertiesPanel = () => {
        const el = elements.find(e => e.id === selectedElementId);
        if (!el) return <div className={styles.emptyState}>Sélectionnez un élément sur le canvas ou ajoutez-en un pour le modifier.</div>;

        return (
            <div className={styles.propertiesPanel}>
                <h4><Settings size={16} /> Propriétés :</h4>
                
                {el.type === 'text' && (
                    <div className={styles.controlGroup}>
                        <label>Contenu</label>
                        <textarea 
                            value={el.content}
                            onChange={(e) => updateElement(el.id, { content: e.target.value })}
                            style={{ background: '#f5f5f5', color: '#000', border: '2px solid #000' }}
                        />
                    </div>
                )}
                
                <div className={styles.rowGroup}>
                    <div className={styles.controlGroup}>
                        <label>Taille {el.type === 'image' ? '(% ou px)' : '(px)'}</label>
                        <Input 
                            type="number" 
                            value={el.fontSize}
                            onChange={(e) => updateElement(el.id, { fontSize: parseInt(e.target.value) || 20 })}
                        />
                    </div>
                    {el.type === 'text' && (
                        <div className={styles.controlGroup}>
                            <label>Poids</label>
                            <select 
                                value={el.fontWeight} 
                                onChange={(e) => updateElement(el.id, { fontWeight: e.target.value })}
                            >
                                <option value="400">Normal</option>
                                <option value="700">Gras (Bold)</option>
                                <option value="900">Super Gras (Black)</option>
                            </select>
                        </div>
                    )}
                </div>

                {el.type === 'text' && (
                    <div className={styles.rowGroup}>
                        <div className={styles.controlGroup}>
                            <label>Couleur Texte</label>
                            <input 
                                type="color" 
                                value={el.color}
                                onChange={(e) => updateElement(el.id, { color: e.target.value })}
                                className={styles.colorPicker}
                            />
                        </div>
                        {!el.isTitle && (
                            <div className={styles.controlGroup}>
                                <label>Couleur Fond (RGBA/Hex)</label>
                                <Input 
                                    type="text" 
                                    value={el.bgColor}
                                    onChange={(e) => updateElement(el.id, { bgColor: e.target.value })}
                                />
                            </div>
                        )}
                    </div>
                )}

                <div className={styles.checkboxGroup}>
                    <label>
                        <input 
                            type="checkbox" 
                            checked={el.shadow}
                            onChange={(e) => updateElement(el.id, { shadow: e.target.checked })}
                        />
                        Ombre Manga (Drop Shadow)
                    </label>
                </div>

                <Button variant="outline" onClick={() => deleteElement(el.id)} className={styles.deleteBtn} style={{ borderColor: 'red', color: 'red' }}>
                    <Trash2 size={16} /> Supprimer l'élément
                </Button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 style={{fontSize: '3rem', fontWeight: 900, textTransform: 'uppercase'}}>Social Generator <span style={{color: 'var(--color-primary)'}}>V2.1</span></h1>
                <Button 
                    variant="manga"
                    onClick={handleDownload}
                    disabled={isGenerating}
                >
                    <Download size={20} />
                    {isGenerating ? 'Capture en cours...' : 'GÉNÉRER POST'}
                </Button>
            </header>

            <div className={styles.content}>
                {/* Controls Sidebar */}
                <Card variant="manga" className={styles.controls} style={{ height: 'fit-content' }}>
                    <div className={styles.tabsMenu}>
                        <button 
                            className={`${styles.tabBtn} ${activeTab === 'format' ? styles.active : ''}`}
                            onClick={() => setActiveTab('format')}
                        >
                            <Layout size={16} /> Fond & Format
                        </button>
                        <button 
                            className={`${styles.tabBtn} ${activeTab === 'elements' ? styles.active : ''}`}
                            onClick={() => setActiveTab('elements')}
                        >
                            <Type size={16} /> Textes & Éléments
                        </button>
                    </div>

                    {activeTab === 'format' && (
                        <div className={styles.tabContent}>
                            <div className={styles.controlGroup}>
                                <label><Layout size={16} style={{display: 'inline', marginRight: 8}}/> Format de l'image</label>
                                <select 
                                    value={format} 
                                    onChange={(e) => setFormat(e.target.value)}
                                >
                                    {FORMATS.map(f => (
                                        <option key={f.id} value={f.id}>{f.label} ({f.width}x{f.height})</option>
                                    ))}
                                </select>
                            </div>

                            <hr className={styles.divider} />

                            <div className={styles.controlGroup}>
                                <label><Search size={16} style={{display: 'inline', marginRight: 8}}/> Recherche Jikan API</label>
                                <div style={{display: 'flex', gap: '0.5rem'}}>
                                    <Input 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Titre animé/manga..."
                                        onKeyDown={(e) => e.key === 'Enter' && handleJikanSearch()}
                                    />
                                    <Button onClick={handleJikanSearch} disabled={isSearching}>
                                        Go
                                    </Button>
                                </div>
                                {searchResults.length > 0 && (
                                    <div className={styles.searchResults}>
                                        {searchResults.map(res => (
                                            <div 
                                                key={res.mal_id} 
                                                className={styles.searchResultItem}
                                                onClick={() => setBackgroundImage(res.images?.jpg?.large_image_url || res.images?.jpg?.image_url)}
                                            >
                                                <img src={res.images?.jpg?.image_url} alt={res.title} />
                                                <span>{res.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <hr className={styles.divider} />

                            <label className={styles.imageUpload} style={{ border: '2px dashed #000', color: '#000' }}>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleImageUploadAsBg} 
                                    style={{ display: 'none' }} 
                                />
                                Uploader Image de Fond Local
                            </label>
                            
                            {backgroundImage && (
                                <Button 
                                    variant="ghost" 
                                    style={{width: '100%', color: 'red', marginTop: '0.5rem'}}
                                    onClick={() => setBackgroundImage(null)}
                                >
                                    <Trash2 size={16}/> Retirer l'image de fond
                                </Button>
                            )}

                            {!backgroundImage && (
                                <div className={styles.controlGroup} style={{marginTop: '1rem'}}>
                                    <label>Thème du fond par défaut</label>
                                    <div style={{display: 'flex', gap: '0.5rem'}}>
                                        <Button 
                                            variant={isDarkTheme ? 'manga' : 'outline'} 
                                            onClick={() => setIsDarkTheme(true)}
                                            style={{flex: 1}}
                                        >
                                            <Moon size={16} style={{marginRight: 6}} /> Sombre
                                        </Button>
                                        <Button 
                                            variant={!isDarkTheme ? 'manga' : 'outline'} 
                                            onClick={() => setIsDarkTheme(false)}
                                            style={{flex: 1}}
                                        >
                                            <Sun size={16} style={{marginRight: 6}} /> Clair
                                        </Button>
                                    </div>
                                </div>
                            )}

                        </div>
                    )}

                    {activeTab === 'elements' && (
                        <div className={styles.tabContent}>
                            <div style={{display: 'flex', gap: '0.5rem', marginBottom: '1rem'}}>
                                <Button variant="secondary" onClick={() => addTextElement(true)} style={{flex: 1}}>
                                    <Plus size={16}/> Gros Titre
                                </Button>
                                <Button variant="secondary" onClick={() => addTextElement(false)} style={{flex: 1}}>
                                    <Plus size={16}/> Texte
                                </Button>
                            </div>
                            
                            <label className={styles.imageUpload} style={{ border: '2px dashed var(--color-primary)', color: 'var(--color-primary)', padding: '0.75rem', marginBottom: '1rem' }}>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleImageUploadAsElement} 
                                    style={{ display: 'none' }} 
                                />
                                <ImageIcon size={16} style={{display: 'inline', marginRight: 8}}/> Ajouter Image Élément
                            </label>

                            <hr className={styles.divider} />

                            {renderPropertiesPanel()}
                        </div>
                    )}
                </Card>

                {/* Preview Area */}
                <div className={styles.previewArea} ref={wrapperRef}>
                    <div 
                        className={styles.canvasWrapper}
                        style={{
                            transform: `scale(${scale})`,
                            width: currentFormat.width,
                            height: currentFormat.height
                        }}
                    >
                        {/* Actual Export Target */}
                        <div 
                            ref={canvasRef}
                            className={`${styles.postCanvas} ${styles[format]}`}
                            style={{
                                backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
                                overflow: 'hidden' // Ensure dragged items don't overflow format
                            }}
                            onPointerDown={(e) => {
                                if (e.target === e.currentTarget) setSelectedElementId(null);
                            }}
                        >
                            {/* Base Theme Wrapper, visible if no valid image is set */}
                            {!backgroundImage && (
                                <div 
                                    className={`${styles.baseBgPattern} ${isDarkTheme ? styles.themeDark : styles.themeLight}`}
                                    style={{
                                        backgroundImage: `url(${bgDashboard})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        backgroundBlendMode: isDarkTheme ? 'color-burn' : 'overlay',
                                    }}
                                >
                                </div>
                            )}

                            <div className={styles.brandWatermark} style={{color: !backgroundImage && !isDarkTheme ? '#000' : 'var(--color-primary)'}}>
                                <img src="/logo.png" alt="Bingeki" className={styles.brandLogo} />
                                BINGEKI
                            </div>
                            
                            {/* Dynamic Elements */}
                            {elements.map(el => (
                                <div 
                                    key={el.id}
                                    className={`${el.type === 'image' ? styles.presetImage : (el.isTitle ? styles.presetBasicTitle : styles.presetBasicText)} ${selectedElementId === el.id ? styles.selectedElement : ''} ${draggingId === el.id ? styles.isDragging : ''}`}
                                    onPointerDown={(e) => handlePointerDown(e, el.id)}
                                    onPointerMove={handlePointerMove}
                                    onPointerUp={handlePointerUp}
                                    style={{ 
                                        left: el.x, 
                                        top: el.y,
                                        position: 'absolute',
                                        color: el.type === 'text' ? el.color : undefined,
                                        fontSize: el.type === 'text' ? `${el.fontSize}px` : undefined,
                                        fontWeight: el.type === 'text' ? el.fontWeight : undefined,
                                        textShadow: el.type === 'text' && el.shadow ? (el.isTitle ? '4px 4px 0 var(--color-primary), 0 4px 12px rgba(0,0,0,0.5)' : '2px 2px 0 #000, 0 2px 8px rgba(0,0,0,0.8)') : 'none',
                                        background: el.bgColor
                                    }}
                                >
                                    {el.type === 'text' ? (
                                        <div 
                                            contentEditable={selectedElementId === el.id} // Only editable when selected so we can drag it easily
                                            suppressContentEditableWarning
                                            onBlur={(e) => updateElement(el.id, { content: e.currentTarget.innerText })}
                                            onPointerDown={(e) => {
                                                if (selectedElementId === el.id) e.stopPropagation(); // If already selected, let user click to put cursor without dragging
                                            }}
                                            style={{
                                                outline: 'none',
                                                minWidth: '50px',
                                                cursor: selectedElementId === el.id ? 'text' : 'inherit',
                                                display: 'inline-block',
                                                width: '100%',
                                                whiteSpace: 'pre-wrap',
                                                wordBreak: 'break-word',
                                            }}
                                        >
                                            {el.content}
                                        </div>
                                    ) : (
                                        <div style={{
                                            filter: el.shadow ? 'drop-shadow(6px 6px 0px var(--color-primary)) drop-shadow(0 4px 12px rgba(0,0,0,0.5))' : 'none'
                                        }}>
                                            <img 
                                                src={el.content} 
                                                alt="Uploaded Element" 
                                                style={{ width: `${el.fontSize}px`, height: 'auto', display: 'block', pointerEvents: 'none' }}
                                                crossOrigin="anonymous"
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
