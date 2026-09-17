const RU: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ё: 'e',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'j',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'h',
  ц: 'c',
  ч: 'ch',
  ш: 'sh',
  щ: 'sch',
  ъ: '',
  ы: 'y',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
};

export function slugify(value: string) {
  const translit = value
    .trim()
    .toLowerCase()
    .split('')
    .map((char) => RU[char] ?? char)
    .join('');
  return translit
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export function uniqueSlug(
  name: string,
  id: number,
  siblings: { id: number; name: string }[],
) {
  const base = slugify(name) || `id-${id}`;
  const same = siblings.filter(
    (item) => slugify(item.name) === slugify(name) && item.id !== id,
  );
  return same.length > 0 ? `${base}-${id}` : base;
}

export function partSlug(part: { id: number; name: string }) {
  const name = slugify(part.name);
  return name ? `${part.id}-${name}` : String(part.id);
}
