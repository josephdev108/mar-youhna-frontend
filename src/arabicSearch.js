/** Normalize Arabic text for fuzzy name search (ignore hamza, tashkeel, etc.). */
export function normalizeArabicForSearch(text) {
  if (text == null || text === '') return ''

  let value = String(text).trim()
  // Remove tashkeel
  value = value.replace(/[\u064B-\u065F\u0670]/g, '')
  // Alef / hamza / ya / taa marbuta variants
  value = value
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ؤ/g, 'و')
    .replace(/[ئى]/g, 'ي')
    .replace(/ة/g, 'ه')
  value = value.replace(/\s+/g, ' ')

  return value.toLowerCase()
}

export function matchesArabicSearch(haystack, needle) {
  const query = normalizeArabicForSearch(needle)
  if (!query) return true
  return normalizeArabicForSearch(haystack).includes(query)
}

export function matchesMemberSearch(member, query) {
  const raw = String(query ?? '').trim()
  if (!raw) return true
  if (member?.phone?.includes(raw)) return true
  if (matchesArabicSearch(member?.name, raw)) return true
  if (matchesArabicSearch(member?.batch, raw)) return true
  return false
}
