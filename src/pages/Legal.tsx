import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Legal() {
    return (
        <Layout>
            <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
                <Link to="/">
                    <Button variant="ghost" icon={<ArrowLeft size={20} />} style={{ marginBottom: '2rem' }}>
                        RETOUR
                    </Button>
                </Link>

                <div className="manga-panel" style={{ background: '#fff', padding: '3rem', color: '#000' }}>
                    <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '3rem', marginBottom: '2rem', textTransform: 'uppercase' }}>
                        MENTIONS LÉGALES & RGPD
                    </h1>

                    <section style={{ marginBottom: '3rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '1rem', borderBottom: '2px solid #000', paddingBottom: '0.5rem' }}>1. ÉDITEUR DU SITE</h2>
                        <p><strong>Nom :</strong> Moussandou Mroivili</p>
                        <p><strong>Adresse :</strong> Marseille, France</p>
                        <p><strong>Contact :</strong> moussandou.m@gmail.com | 07 81 63 32 78</p>
                        <p><strong>Statut :</strong> Développeur Freelance / Projet Personnel</p>
                    </section>

                    <section style={{ marginBottom: '3rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '1rem', borderBottom: '2px solid #000', paddingBottom: '0.5rem' }}>2. HÉBERGEMENT</h2>
                        <p>Ce site est hébergé par Firebase (Google LLC).</p>
                        <p>Certaines données (images) peuvent être stockées via d'autres services tiers.</p>
                    </section>

                    <section style={{ marginBottom: '3rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '1rem', borderBottom: '2px solid #000', paddingBottom: '0.5rem' }}>3. PROPRIÉTÉ INTELLECTUELLE</h2>
                        <p>Le design, la structure et le code de "Bingeki Experience" sont la propriété exclusive de l'éditeur.</p>
                        <p>Les images d'œuvres (mangas/animes) sont utilisées à titre d'illustration et restent la propriété de leurs ayants droit respectifs.</p>
                    </section>

                    <section style={{ marginBottom: '3rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '1rem', borderBottom: '2px solid #000', paddingBottom: '0.5rem' }}>4. DONNÉES PERSONNELLES (RGPD)</h2>
                        <p style={{ marginBottom: '1rem' }}>Conformément au Règlement Général sur la Protection des Données (RGPD), nous vous informons que :</p>
                        <ul style={{ listStyle: 'disc', paddingLeft: '2rem', lineHeight: '1.6' }}>
                            <li><strong>Collecte :</strong> Les données collectées (email, image de profil, progression) sont uniquement utilisées pour le fonctionnement de l'application (sauvegarde de la bibliothèque, gamification).</li>
                            <li><strong>Responsable :</strong> Moussandou Mroivili est le responsable du traitement des données.</li>
                            <li><strong>Droit d'accès :</strong> Vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Vous pouvez supprimer votre compte et toutes les données associées directement depuis les paramètres de l'application ou en nous contactant.</li>
                            <li><strong>Partage :</strong> Aucune donnée personnelle n'est vendue à des tiers.</li>
                            <li><strong>Cookies :</strong> Ce site utilise uniquement des cookies techniques nécessaires à l'authentification (Firebase Auth).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '1rem', borderBottom: '2px solid #000', paddingBottom: '0.5rem' }}>5. CONTACT</h2>
                        <p>Pour toute question relative à ces mentions légales ou à vos données, veuillez contacter : <strong>moussandou.m@gmail.com</strong></p>
                    </section>
                </div>
            </div>
        </Layout>
    );
}
