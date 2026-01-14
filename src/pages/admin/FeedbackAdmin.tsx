import { useState, useEffect } from 'react';
import { Star, Mail, Trash2, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { getAllFeedback, deleteFeedback, updateFeedbackStatus, type FeedbackData } from '@/firebase/firestore';

export default function AdminFeedback() {
    const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFeedback();
    }, []);

    const loadFeedback = async () => {
        setLoading(true);
        try {
            const data = await getAllFeedback();
            setFeedbacks(data);
        } catch (e) {
            console.error("Failed to load feedback", e);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Supprimer ce feedback définitivement ?")) {
            try {
                await deleteFeedback(id);
                setFeedbacks(prev => prev.filter(f => f.id !== id));
            } catch (e) {
                alert("Erreur lors de la suppression");
            }
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: string | undefined) => {
        const newStatus = currentStatus === 'resolved' ? 'open' : 'resolved';
        try {
            await updateFeedbackStatus(id, newStatus);
            setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status: newStatus } : f));
        } catch (e) {
            alert("Erreur lors de la mise à jour du statut");
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'bug': return 'bg-red-500';
            case 'feature': return 'bg-blue-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-heading text-4xl uppercase">Feedback Center</h1>
                    <p className="border-l-2 border-black pl-2 text-gray-500 italic">
                        {feedbacks.filter(f => (f as any).status !== 'resolved').length} tickets en attente
                    </p>
                </div>
                <button onClick={loadFeedback} className="font-mono text-sm underline hover:text-primary">
                    Rafraîchir
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {loading ? (
                    <p>Chargement des messages...</p>
                ) : feedbacks.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        Aucun message pour le moment.
                    </div>
                ) : (
                    feedbacks.map((item) => (
                        <Card
                            key={item.id}
                            variant="manga"
                            className={`p-6 flex flex-col justify-between h-auto min-h-[250px] relative group ${(item as any).status === 'resolved' ? 'opacity-75 grayscale hover:grayscale-0 hover:opacity-100 transition-all' : ''}`}
                        >
                            {/* Badges */}
                            <div className="absolute -top-3 -right-3 flex gap-2">
                                <div className={`${getCategoryColor(item.category)} text-white px-3 py-1 border-2 border-black font-black uppercase text-xs shadow-[2px_2px_0_#000]`}>
                                    {item.category}
                                </div>
                                {(item as any).status === 'resolved' && (
                                    <div className="bg-green-500 text-white px-3 py-1 border-2 border-black font-black uppercase text-xs shadow-[2px_2px_0_#000] flex items-center gap-1">
                                        <CheckCircle size={12} strokeWidth={3} /> Résolu
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-heading text-lg leading-tight uppercase">
                                            {item.userName || 'Anonyme'}
                                        </h3>
                                        <span className="text-xs text-gray-400 font-mono">
                                            {new Date(item.timestamp).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 bg-black text-white px-2 py-1 font-bold text-sm">
                                        <Star size={12} fill="currentColor" /> {item.rating}/10
                                    </div>
                                </div>

                                <div className="relative mb-6">
                                    <MessageSquare size={48} className="absolute -top-2 -left-2 opacity-5 text-black" />
                                    <p className="text-gray-700 leading-relaxed font-medium relative z-10">
                                        "{item.message}"
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100 mt-auto gap-2">
                                {item.contactEmail ? (
                                    <a href={`mailto:${item.contactEmail}`} className="flex items-center gap-2 text-xs font-bold uppercase hover:bg-black hover:text-white px-2 py-1 transition-colors rounded-sm" title={item.contactEmail}>
                                        <Mail size={14} /> Répondre
                                    </a>
                                ) : (
                                    <span className="text-xs text-gray-400 italic">Pas d'email</span>
                                )}

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleToggleStatus(item.id, (item as any).status)}
                                        className={`p-2 border-2 border-black transition-transform hover:-translate-y-1 ${(item as any).status === 'resolved' ? 'bg-yellow-400' : 'bg-green-400'}`}
                                        title={(item as any).status === 'resolved' ? "Rouvrir" : "Marquer comme résolu"}
                                    >
                                        {(item as any).status === 'resolved' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="p-2 border-2 border-black bg-white hover:bg-red-500 hover:text-white transition-colors"
                                        title="Supprimer"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
