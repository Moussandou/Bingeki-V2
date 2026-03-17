import React, { useState, useRef, useEffect } from 'react';
import { Download, Layout, Type, Palette, Search, Plus, Trash2, Settings } from 'lucide-react';
import html2canvas from 'html2canvas';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import styles from './SocialGenerator.module.css';

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

const BINGEKI_BGS = [
    { id: 'attack', url: 'https://cdn.myanimelist.net/images/manga/2/3786l.jpg', label: 'L\'Attaque des Titans' },
    { id: 'onepiece', url: 'https://cdn.myanimelist.net/images/manga/2/253146l.jpg', label: 'One Piece' },
    { id: 'berserk', url: 'https://cdn.myanimelist.net/images/manga/1/157897l.jpg', label: 'Berserk' },
    { id: 'frieren', url: 'https://cdn.myanimelist.net/images/anime/1015/138006l.jpg', label: 'Frieren' },
];

type DynamicElement = {
    id: string;
    content: string;
    x: number;
    y: number;
    color: string;
    fontSize: number;
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
    const [elements, setElements] = useState<DynamicElement[]>([
        {
            id: 'title-1',
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

    // Calculate scale to fit preview window
    useEffect(() => {
        const calculateScale = () => {
            if (!wrapperRef.current) return;
            const containerWidth = wrapperRef.current.clientWidth;
            const containerHeight = wrapperRef.current.clientHeight;
            
            const availableWidth = containerWidth - 120;
            const availableHeight = containerHeight - 120;
            
            const scaleX = availableWidth / currentFormat.width;
            const scaleY = availableHeight / currentFormat.height;
            
            setScale(Math.min(scaleX, scaleY));
        };

        calculateScale();
        window.addEventListener('resize', calculateScale);
        return () => window.removeEventListener('resize', calculateScale);
    }, [currentFormat]);

    // --- Actions ---

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

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setBackgroundImage(url);
        }
    };

    const addElement = (isTitle: boolean) => {
        const newEl: DynamicElement = {
            id: `el-${Date.now()}`,
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
                <div className={styles.controlGroup}>
                    <label>Contenu</label>
                    <textarea 
                        value={el.content}
                        onChange={(e) => updateElement(el.id, { content: e.target.value })}
                        style={{ background: '#f5f5f5', color: '#000', border: '2px solid #000' }}
                    />
                </div>
                
                <div className={styles.rowGroup}>
                    <div className={styles.controlGroup}>
                        <label>Taille (px)</label>
                        <Input 
                            type="number" 
                            value={el.fontSize}
                            onChange={(e) => updateElement(el.id, { fontSize: parseInt(e.target.value) || 20 })}
                        />
                    </div>
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
                </div>

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

                <div className={styles.checkboxGroup}>
                    <label>
                        <input 
                            type="checkbox" 
                            checked={el.shadow}
                            onChange={(e) => updateElement(el.id, { shadow: e.target.checked })}
                        />
                        Ombre portées Manga (Text Shadow)
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
                <h1 style={{fontSize: '3rem', fontWeight: 900, textTransform: 'uppercase'}}>Social Generator <span style={{color: 'var(--color-primary)'}}>V2</span></h1>
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

                            <div className={styles.controlGroup}>
                                <label><Palette size={16} style={{display: 'inline', marginRight: 8}}/> Fonds rapides Bingeki</label>
                                <select 
                                    onChange={(e) => setBackgroundImage(e.target.value)}
                                    value={backgroundImage || ''}
                                >
                                    <option value="">Pattern par défaut (Aucun)</option>
                                    {BINGEKI_BGS.map(bg => (
                                        <option key={bg.id} value={bg.url}>{bg.label}</option>
                                    ))}
                                </select>
                            </div>

                            <label className={styles.imageUpload} style={{ border: '2px dashed #000', color: '#000', marginTop: '1rem' }}>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleImageUpload} 
                                    style={{ display: 'none' }} 
                                />
                                {backgroundImage && !BINGEKI_BGS.find(b => b.url === backgroundImage) 
                                    ? 'Changer l\'image Uploadée' 
                                    : 'Uploader une image locale'}
                            </label>
                            
                            {backgroundImage && (
                                <Button 
                                    variant="ghost" 
                                    style={{width: '100%', color: 'red', marginTop: '0.5rem'}}
                                    onClick={() => setBackgroundImage(null)}
                                >
                                    <Trash2 size={16}/> Retirer l'image
                                </Button>
                            )}
                        </div>
                    )}

                    {activeTab === 'elements' && (
                        <div className={styles.tabContent}>
                            <div style={{display: 'flex', gap: '0.5rem', marginBottom: '1rem'}}>
                                <Button variant="secondary" onClick={() => addElement(true)} style={{flex: 1}}>
                                    <Plus size={16}/> Gros Titre
                                </Button>
                                <Button variant="secondary" onClick={() => addElement(false)} style={{flex: 1}}>
                                    <Plus size={16}/> Texte
                                </Button>
                            </div>

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
                        >
                            {/* Base Theme Wrapper, visible if no valid image is set */}
                            {!backgroundImage && (
                                <div className={styles.baseBgPattern}>
                                    <div className="manga-halftone" style={{opacity: 0.1}}></div>
                                </div>
                            )}

                            {/* Black gradient overlay to help text readability on busy images */}
                            <div className={styles.overlayGradient}></div>

                            <div className={styles.brandWatermark}>BINGEKI</div>
                            
                            {/* Dynamic Elements */}
                            {elements.map(el => (
                                <motion.div 
                                    key={el.id}
                                    drag 
                                    dragMomentum={false}
                                    className={`${el.isTitle ? styles.presetBasicTitle : styles.presetBasicText} ${selectedElementId === el.id ? styles.selectedElement : ''}`}
                                    onPointerDown={() => setSelectedElementId(el.id)}
                                    style={{ 
                                        left: el.x, 
                                        top: el.y,
                                        color: el.color,
                                        fontSize: `${el.fontSize}px`,
                                        fontWeight: el.fontWeight,
                                        textShadow: el.shadow ? (el.isTitle ? '4px 4px 0 var(--color-primary), 0 4px 12px rgba(0,0,0,0.5)' : '2px 2px 0 #000, 0 2px 8px rgba(0,0,0,0.8)') : 'none',
                                        background: el.bgColor,
                                        position: 'absolute'
                                    }}
                                    onDragEnd={(_, info) => {
                                        updateElement(el.id, {
                                            x: el.x + info.offset.x,
                                            y: el.y + info.offset.y
                                        });
                                    }}
                                >
                                    {el.content}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
