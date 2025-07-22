# 📄 PDF360 – Web App de traitement de fichiers PDF

**PDF360** est une plateforme PHP complète pour manipuler des fichiers PDF : fusion, division, rotation, signature, édition visuelle et plus encore.

## 📦 Fonctionnalités

- 🔗 Fusionner plusieurs fichiers PDF
- ✂️ Diviser un fichier PDF par pages
- 🔄 Tourner des pages PDF
- ✍️ Éditer le contenu d’un PDF (ajouter du texte, formes…)
- 🖊️ Ajouter une signature sur un PDF
- 📤 Téléversement facile des fichiers
- 📥 Télécharger les résultats

## 🛠️ Technologies

- PHP (vanilla)
- pdf-lib.js (JavaScript)
- HTML/CSS/JS (frontend)
- Composer (pour les dépendances PHP)

## 📁 Structure du projet

```bash
📁 includes/pdf-utils       # Classes PHP pour traitement PDF
📁 public                   # Frontend & pages principales
📁 public/assets            # CSS, JS, images
📁 public/uploads           # Fichiers PDF uploadés
📁 public/downloads         # Fichiers PDF traités à télécharger
📁 vendor                   # Dépendances Composer
composer.json              # Fichier des dépendances PHP
php.ini                    # Config PHP personnalisée
