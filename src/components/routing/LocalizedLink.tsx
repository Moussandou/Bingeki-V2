import { Link as RouterLink, NavLink as RouterNavLink, useNavigate } from 'react-router-dom';
import type { LinkProps, NavLinkProps } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const useLocalizedNavigate = () => {
    const navigate = useNavigate();
    const { i18n } = useTranslation();
    const lang = i18n.language === 'en' ? 'en' : 'fr';

    return (to: string | number, options?: any) => {
        if (typeof to === 'string' && to.startsWith('/') && !to.startsWith('/fr') && !to.startsWith('/en')) {
            navigate(`/${lang}${to}`, options);
        } else {
            navigate(to as any, options);
        }
    };
};

export const Link = ({ to, ...props }: LinkProps) => {
    const { i18n } = useTranslation();
    const lang = i18n.language === 'en' ? 'en' : 'fr';

    const getLocalizedTo = (target: string | object) => {
        if (typeof target === 'string' && target.startsWith('/') && !target.startsWith('/fr') && !target.startsWith('/en')) {
            return `/${lang}${target}`;
        }
        return target;
    };

    return <RouterLink to={getLocalizedTo(to)} {...props} />;
};

export const NavLink = ({ to, ...props }: NavLinkProps) => {
    const { i18n } = useTranslation();
    const lang = i18n.language === 'en' ? 'en' : 'fr';

    const getLocalizedTo = (target: string | object) => {
        if (typeof target === 'string' && target.startsWith('/') && !target.startsWith('/fr') && !target.startsWith('/en')) {
            return `/${lang}${target}`;
        }
        return target;
    };

    return <RouterNavLink to={getLocalizedTo(to)} {...props} />;
};
