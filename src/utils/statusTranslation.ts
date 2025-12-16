// Utility to translate work status to French
export const statusToFrench = (status: string): string => {
    const translations: Record<string, string> = {
        'reading': 'En cours',
        'completed': 'Terminé',
        'plan_to_read': 'À lire',
        'on_hold': 'En pause',
        'dropped': 'Abandonné',
    };
    return translations[status] || status;
};
