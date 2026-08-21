/**
 * The word this tab uses for a physical address — **the tenant's own**, in one place.
 *
 * It used to have two words. The filter row asked `getLabel` for `terms.sites` and
 * printed the tenant's noun ("Site"); the table's column header, its footer count and
 * the grouped list's summaries printed a fixed `Property`/`Properties` from the locale
 * file, on the reasoning that "property" is this view's own word for the thing every
 * tenant has. Both readings were defensible on their own and the pair was not: one
 * screen, one object, two names, ten pixels apart — a dropdown labelled `Site` above a
 * column headed `Property` narrowing the same rows.
 *
 * Settled in favour of the tenant's word, which is the one the rest of the app uses and
 * the one a franchise can change. Stated here rather than in either consumer so the
 * question cannot be answered twice again: the filter row, the year matrix and the
 * grouped list all read this.
 *
 * **The plural is the source and the singular is derived**, because `terms.sites` is
 * the only key the tenant actually sets. Trimming a trailing `s` is crude and it is
 * what the filter row already did; it is right for the words tenants use here (Sites →
 * Site, Buildings → Building) and it degrades to the plural rather than to nothing for
 * anything it cannot cut. A tenant whose singular is genuinely irregular needs its own
 * label key, not a cleverer regex.
 */
export const siteTerms = (getLabel, t) => {
  const plural = getLabel?.('terms', 'sites', t) || 'Sites';
  /* `|| plural` catches the one-letter case: `s` would otherwise trim to nothing and
     print an empty column header. */
  const singular = plural.replace(/s$/i, '') || plural;

  return { singular, plural };
};

export default siteTerms;
