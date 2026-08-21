// Slugifier maison : translittère les accents au lieu de les supprimer.
// (Le slugify par défaut de Payload efface les caractères non-ASCII :
// « Les sœurs » devenait "les-surs", « hébreu » devenait "hbreu".)
export const slugifier = (texte: string): string =>
  texte
    .toLowerCase()
    .replace(/œ/g, 'oe') // œ
    .replace(/æ/g, 'ae') // æ
    // décompose les lettres accentuées (é → e + accent) puis retire les diacritiques
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
