import { CURRICULUM } from '../content/curriculum';

export interface SearchResult {
  type: 'lesson' | 'formula' | 'simulation';
  moduleId: string;
  moduleTitle: string;
  lessonId: string;
  lessonTitle: string;
  title: string;
  subtitle?: string;
  href: string;
  tags: string[];
  score?: number;
}

export function buildSearchIndex(): SearchResult[] {
  const results: SearchResult[] = [];

  for (const mod of CURRICULUM.modules) {
    for (const lesson of mod.lessons) {
      results.push({
        type: 'lesson',
        moduleId: mod.id,
        moduleTitle: mod.title,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        title: lesson.title,
        subtitle: lesson.subtitle,
        href: `/modules/${mod.id}/${lesson.id}`,
        tags: lesson.tags ?? [],
      });

      for (const section of lesson.sections) {
        if (section.type === 'formula') {
          results.push({
            type: 'formula',
            moduleId: mod.id,
            moduleTitle: mod.title,
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            title: section.label,
            subtitle: `Formula in ${lesson.title}`,
            href: `/modules/${mod.id}/${lesson.id}`,
            tags: lesson.tags ?? [],
          });
        }
        if (section.type === 'simulation') {
          results.push({
            type: 'simulation',
            moduleId: mod.id,
            moduleTitle: mod.title,
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            title: section.title,
            subtitle: `Simulation in ${lesson.title}`,
            href: `/modules/${mod.id}/${lesson.id}`,
            tags: lesson.tags ?? [],
          });
        }
      }
    }
  }

  return results;
}

export function searchIndex(index: SearchResult[], query: string): SearchResult[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  return index
    .map(item => {
      let score = 0;
      const titleLower = item.title.toLowerCase();
      const subtitleLower = (item.subtitle ?? '').toLowerCase();
      const tagsStr = item.tags.join(' ').toLowerCase();
      const moduleLower = item.moduleTitle.toLowerCase();

      if (titleLower === q) score += 100;
      else if (titleLower.startsWith(q)) score += 60;
      else if (titleLower.includes(q)) score += 40;
      if (subtitleLower.includes(q)) score += 15;
      if (tagsStr.includes(q)) score += 25;
      if (moduleLower.includes(q)) score += 10;
      if (score > 0 && item.type === 'lesson') score += 5;

      return { ...item, score };
    })
    .filter(item => (item.score ?? 0) > 0)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 8);
}
