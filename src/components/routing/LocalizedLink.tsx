import { Link as RouterLink, NavLink as RouterNavLink, useNavigate } from 'react-router-dom';
import type { LinkProps, NavLinkProps } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// eslint-disable-next-line react-refresh/only-export-components
export const useLocalizedNavigate = () => {
    const navigate = useNavigate();
    const { i18n } = useTranslation();
    const lang = i18n.language === 'en' ? 'en' : 'fr';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (to: string | number, options?: any) => {
        if (typeof to === 'string' && to.startsWith('/')) {
            const isAlreadyPrefixed = to.startsWith('/fr/') || to.startsWith('/en/') || to === '/fr' || to === '/en';
            if (!isAlreadyPrefixed) {
                navigate(`/${lang}${to}`, options);
                return;
            }
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        navigate(to as any, options);
    };
};

const getLocalizedPath = (target: string | object, lang: string) => {
    if (typeof target === 'string' && target.startsWith('/')) {
        const isAlreadyPrefixed = target.startsWith('/fr/') || target.startsWith('/en/') || target === '/fr' || target === '/en';
        if (!isAlreadyPrefixed) {
            return `/${lang}${target}`;
        }
    }
    return target;
};

export const Link = ({ to, ...props }: LinkProps) => {
    const { i18n } = useTranslation();
    const lang = i18n.language === 'en' ? 'en' : 'fr';
    return <RouterLink to={getLocalizedPath(to, lang)} {...props} />;
};

export const NavLink = ({ to, ...props }: NavLinkProps) => {
    const { i18n } = useTranslation();
    const lang = i18n.language === 'en' ? 'en' : 'fr';
    return <RouterNavLink to={getLocalizedPath(to, lang)} {...props} />;
};
