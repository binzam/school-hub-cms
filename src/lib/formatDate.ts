export function formatDate(iso: string, locale: string) {
  try {
    return new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(iso))
  } catch {
    return iso.slice(0, 10) // unknown locale tag
  }
}