import { describe, expect, it } from 'vitest';
import { extraireNumeroMatch, slugifierMatch } from './slugMatch';

describe('slugifierMatch', () => {
  it('génère un slug propre pour France-Sénégal', () => {
    expect(
      slugifierMatch({
        numero_match: 17,
        equipe_domicile: 'France',
        equipe_exterieur: 'Sénégal',
      }),
    ).toBe('17-france-senegal');
  });

  it("gère les caractères spéciaux et apostrophes (Côte d'Ivoire)", () => {
    expect(
      slugifierMatch({
        numero_match: 9,
        equipe_domicile: "Côte d'Ivoire",
        equipe_exterieur: 'Équateur',
      }),
    ).toBe('9-cote-d-ivoire-equateur');
  });

  it('gère les placeholders éliminatoires', () => {
    expect(
      slugifierMatch({
        numero_match: 89,
        equipe_domicile: 'Vainqueur 16e #74',
        equipe_exterieur: 'Vainqueur 16e #77',
      }),
    ).toBe('89-vainqueur-16e-74-vainqueur-16e-77');
  });
});

describe('extraireNumeroMatch', () => {
  it('parse le numéro depuis un slug complet', () => {
    expect(extraireNumeroMatch('17-france-senegal')).toBe(17);
    expect(extraireNumeroMatch('104-vainqueur-demi-101-vainqueur-demi-102')).toBe(104);
  });

  it('accepte juste le numéro', () => {
    expect(extraireNumeroMatch('1')).toBe(1);
    expect(extraireNumeroMatch('72')).toBe(72);
  });

  it('rejette les numéros hors plage', () => {
    expect(extraireNumeroMatch('0')).toBeNull();
    expect(extraireNumeroMatch('105')).toBeNull();
    expect(extraireNumeroMatch('999-truc')).toBeNull();
  });

  it('rejette les slugs sans numéro initial', () => {
    expect(extraireNumeroMatch('france-senegal')).toBeNull();
    expect(extraireNumeroMatch('')).toBeNull();
    expect(extraireNumeroMatch(undefined)).toBeNull();
  });
});
