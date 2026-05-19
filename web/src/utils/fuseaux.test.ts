import { describe, expect, it } from 'vitest';
import {
  formaterDate,
  formaterDateHeure,
  formaterHeure,
} from './fuseaux';

// Le match d'ouverture : 11 juin 2026, 13:00 heure de Mexico (UTC-6).
// → 19:00:00 UTC.
const OUVERTURE_UTC = '2026-06-11T19:00:00.000Z';

// La finale : 19 juillet 2026, 15:00 heure de New York (UTC-4 en juillet).
// → 19:00:00 UTC.
const FINALE_UTC = '2026-07-19T19:00:00.000Z';

describe('formaterHeure — conversion fuseau', () => {
  it("affiche l'ouverture en heure de Paris", () => {
    // CEST en juin = UTC+2 → 21:00.
    expect(formaterHeure(OUVERTURE_UTC, 'Europe/Paris')).toBe('21:00');
  });

  it("affiche l'ouverture en heure de New York", () => {
    // EDT en juin = UTC-4 → 15:00.
    expect(formaterHeure(OUVERTURE_UTC, 'America/New_York')).toBe('15:00');
  });

  it("affiche l'ouverture en heure de Mexico (heure locale du stade)", () => {
    // CST année-round = UTC-6 → 13:00.
    expect(formaterHeure(OUVERTURE_UTC, 'America/Mexico_City')).toBe('13:00');
  });

  it('affiche la finale en heure de Paris', () => {
    // CEST → 21:00.
    expect(formaterHeure(FINALE_UTC, 'Europe/Paris')).toBe('21:00');
  });

  it('affiche la finale en heure de New York (heure locale du stade)', () => {
    // EDT → 15:00.
    expect(formaterHeure(FINALE_UTC, 'America/New_York')).toBe('15:00');
  });

  it('affiche la finale en heure de Los Angeles', () => {
    // PDT en juillet = UTC-7 → 12:00.
    expect(formaterHeure(FINALE_UTC, 'America/Los_Angeles')).toBe('12:00');
  });
});

describe('formaterDate — fuseau influe sur la date affichée', () => {
  it('reste le 11 juin à Paris pour 19:00 UTC', () => {
    expect(formaterDate(OUVERTURE_UTC, 'Europe/Paris')).toContain('11 juin');
  });

  it('reste le 11 juin à New York pour 19:00 UTC', () => {
    expect(formaterDate(OUVERTURE_UTC, 'America/New_York')).toContain(
      '11 juin',
    );
  });
});

describe('formaterDateHeure — combiné', () => {
  it("combine date et heure à Paris pour l'ouverture", () => {
    const valeur = formaterDateHeure(OUVERTURE_UTC, 'Europe/Paris');
    expect(valeur).toMatch(/11/);
    expect(valeur).toMatch(/juin/);
    expect(valeur).toMatch(/21:00/);
  });
});
