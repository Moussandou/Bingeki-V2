#!/bin/bash

# Configuration
WIKI_REPO_URL="https://github.com/Moussandou/Bingeki-V2.wiki.git"
TEMP_DIR=".wiki_temp"

echo "🔄 Initialisation de la synchronisation Wiki..."

# 1. Nettoyage précédent
rm -rf $TEMP_DIR

# 2. Clone du Wiki
echo "📥 Clonage du repository Wiki..."
git clone $WIKI_REPO_URL $TEMP_DIR

if [ ! -d "$TEMP_DIR" ]; then
    echo "❌ Erreur: Impossible de cloner le Wiki."
    echo "👉 Avez-vous cliqué sur 'Create the first page' dans l'onglet Wiki de GitHub ?"
    exit 1
fi

# 3. Copie des fichiers docs/ vers le dossier temporaire
echo "📂 Copie des fichiers de documentation..."
cp -R docs/* $TEMP_DIR/

# 4. Commit et Push
cd $TEMP_DIR
git add .
git commit -m "docs: sync from main repository"
echo "🚀 Envoi vers GitHub Wiki..."
git push origin master

# 5. Nettoyage
cd ..
rm -rf $TEMP_DIR

echo "✅ Succès ! Votre Wiki GitHub est à jour."
