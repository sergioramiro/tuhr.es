import { marked } from 'marked';

/**
 * Slugger: convierte texto de heading a slug válido para IDs de ancla.
 * - Minúsculas, espacios → guiones, sin caracteres especiales
 * - Deduplica si aparece el mismo heading dos veces
 */
const slugCounts = new Map<string, number>();

function slug(text: string): string {
  const base = text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')  // quitar tildes
    .replace(/[^a-z0-9\s-]/g, '')                      // solo alfanumérico
    .trim()
    .replace(/\s+/g, '-')                               // espacios → guión
    .replace(/-+/g, '-');                               // guiones múltiples

  const count = slugCounts.get(base) || 0;
  slugCounts.set(base, count + 1);
  return count > 0 ? `${base}-${count}` : base;
}

// Renderer custom: añade id a todos los headings
const renderer = {
  heading({ text, depth }: { text: string; depth: number; raw: string }) {
    const id = slug(text.replace(/<[^>]+>/g, '')); // quitar tags HTML del texto
    return `<h${depth} id="${id}">${text}</h${depth}>`;
  },
};

marked.use({ renderer });

/** Resetear slugger entre páginas (importante en SSR de Astro) */
export function resetSlugger() {
  slugCounts.clear();
}

export { marked };
