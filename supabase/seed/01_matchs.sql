-- Seed du calendrier officiel de la Coupe du Monde 2026.
-- 104 matchs, coups d'envoi convertis en UTC par Postgres via AT TIME ZONE.
-- Idempotent : ON CONFLICT (numero_match) DO NOTHING.
--
-- Sources et méthode documentées dans docs/CALENDRIER.md.
-- À exécuter APRÈS les migrations qui créent la table `matchs`.

INSERT INTO public.matchs (
    numero_match,
    phase,
    equipe_domicile,
    equipe_exterieur,
    coup_envoi_utc,
    stade,
    ville_hote
)
VALUES
    -- ====================================================================
    -- Phase de groupes (matchs 1 à 72)
    -- ====================================================================
    (1,  'groupes', 'Mexique',           'Afrique du Sud',     ('2026-06-11 13:00:00'::timestamp AT TIME ZONE 'America/Mexico_City'),  'Estadio Azteca',           'Mexico'),
    (2,  'groupes', 'Corée du Sud',      'Tchéquie',           ('2026-06-11 20:00:00'::timestamp AT TIME ZONE 'America/Mexico_City'),  'Estadio Akron',            'Zapopan'),
    (3,  'groupes', 'Canada',            'Bosnie-Herzégovine', ('2026-06-12 15:00:00'::timestamp AT TIME ZONE 'America/Toronto'),      'BMO Field',                'Toronto'),
    (4,  'groupes', 'États-Unis',        'Paraguay',           ('2026-06-12 18:00:00'::timestamp AT TIME ZONE 'America/Los_Angeles'),  'SoFi Stadium',             'Los Angeles'),
    (5,  'groupes', 'Haïti',             'Écosse',             ('2026-06-13 21:00:00'::timestamp AT TIME ZONE 'America/New_York'),     'Gillette Stadium',         'Boston'),
    (6,  'groupes', 'Australie',         'Turquie',            ('2026-06-13 21:00:00'::timestamp AT TIME ZONE 'America/Vancouver'),    'BC Place',                 'Vancouver'),
    (7,  'groupes', 'Brésil',            'Maroc',              ('2026-06-13 18:00:00'::timestamp AT TIME ZONE 'America/New_York'),     'MetLife Stadium',          'New York/New Jersey'),
    (8,  'groupes', 'Qatar',             'Suisse',             ('2026-06-13 12:00:00'::timestamp AT TIME ZONE 'America/Los_Angeles'),  'Levi''s Stadium',          'San Francisco Bay Area'),
    (9,  'groupes', 'Côte d''Ivoire',    'Équateur',           ('2026-06-14 19:00:00'::timestamp AT TIME ZONE 'America/New_York'),     'Lincoln Financial Field',  'Philadelphie'),
    (10, 'groupes', 'Allemagne',         'Curaçao',            ('2026-06-14 12:00:00'::timestamp AT TIME ZONE 'America/Chicago'),      'NRG Stadium',              'Houston'),
    (11, 'groupes', 'Pays-Bas',          'Japon',              ('2026-06-14 15:00:00'::timestamp AT TIME ZONE 'America/Chicago'),      'AT&T Stadium',             'Dallas'),
    (12, 'groupes', 'Suède',             'Tunisie',            ('2026-06-14 20:00:00'::timestamp AT TIME ZONE 'America/Monterrey'),    'Estadio BBVA',             'Monterrey'),
    (13, 'groupes', 'Arabie saoudite',   'Uruguay',            ('2026-06-15 18:00:00'::timestamp AT TIME ZONE 'America/New_York'),     'Hard Rock Stadium',        'Miami'),
    (14, 'groupes', 'Espagne',           'Cap-Vert',           ('2026-06-15 12:00:00'::timestamp AT TIME ZONE 'America/New_York'),     'Mercedes-Benz Stadium',    'Atlanta'),
    (15, 'groupes', 'Belgique',          'Égypte',             ('2026-06-15 12:00:00'::timestamp AT TIME ZONE 'America/Los_Angeles'),  'Lumen Field',              'Seattle'),
    (16, 'groupes', 'Iran',              'Nouvelle-Zélande',   ('2026-06-15 18:00:00'::timestamp AT TIME ZONE 'America/Los_Angeles'),  'SoFi Stadium',             'Los Angeles'),
    (17, 'groupes', 'France',            'Sénégal',            ('2026-06-16 15:00:00'::timestamp AT TIME ZONE 'America/New_York'),     'MetLife Stadium',          'New York/New Jersey'),
    (18, 'groupes', 'Irak',              'Norvège',            ('2026-06-16 18:00:00'::timestamp AT TIME ZONE 'America/New_York'),     'Gillette Stadium',         'Boston'),
    (19, 'groupes', 'Argentine',         'Algérie',            ('2026-06-16 20:00:00'::timestamp AT TIME ZONE 'America/Chicago'),      'Arrowhead Stadium',        'Kansas City'),
    (20, 'groupes', 'Autriche',          'Jordanie',           ('2026-06-16 21:00:00'::timestamp AT TIME ZONE 'America/Los_Angeles'),  'Levi''s Stadium',          'San Francisco Bay Area'),
    (21, 'groupes', 'Ghana',             'Panama',             ('2026-06-17 19:00:00'::timestamp AT TIME ZONE 'America/Toronto'),      'BMO Field',                'Toronto'),
    (22, 'groupes', 'Angleterre',        'Croatie',            ('2026-06-17 15:00:00'::timestamp AT TIME ZONE 'America/Chicago'),      'AT&T Stadium',             'Dallas'),
    (23, 'groupes', 'Portugal',          'RD Congo',           ('2026-06-17 12:00:00'::timestamp AT TIME ZONE 'America/Chicago'),      'NRG Stadium',              'Houston'),
    (24, 'groupes', 'Ouzbékistan',       'Colombie',           ('2026-06-17 20:00:00'::timestamp AT TIME ZONE 'America/Mexico_City'),  'Estadio Azteca',           'Mexico'),
    (25, 'groupes', 'Tchéquie',          'Afrique du Sud',     ('2026-06-18 12:00:00'::timestamp AT TIME ZONE 'America/New_York'),     'Mercedes-Benz Stadium',    'Atlanta'),
    (26, 'groupes', 'Suisse',            'Bosnie-Herzégovine', ('2026-06-18 12:00:00'::timestamp AT TIME ZONE 'America/Los_Angeles'),  'SoFi Stadium',             'Los Angeles'),
    (27, 'groupes', 'Canada',            'Qatar',              ('2026-06-18 15:00:00'::timestamp AT TIME ZONE 'America/Vancouver'),    'BC Place',                 'Vancouver'),
    (28, 'groupes', 'Mexique',           'Corée du Sud',       ('2026-06-18 19:00:00'::timestamp AT TIME ZONE 'America/Mexico_City'),  'Estadio Akron',            'Zapopan'),
    (29, 'groupes', 'Brésil',            'Haïti',              ('2026-06-19 20:30:00'::timestamp AT TIME ZONE 'America/New_York'),     'Lincoln Financial Field',  'Philadelphie'),
    (30, 'groupes', 'Écosse',            'Maroc',              ('2026-06-19 18:00:00'::timestamp AT TIME ZONE 'America/New_York'),     'Gillette Stadium',         'Boston'),
    (31, 'groupes', 'Turquie',           'Paraguay',           ('2026-06-19 20:00:00'::timestamp AT TIME ZONE 'America/Los_Angeles'),  'Levi''s Stadium',          'San Francisco Bay Area'),
    (32, 'groupes', 'États-Unis',        'Australie',          ('2026-06-19 12:00:00'::timestamp AT TIME ZONE 'America/Los_Angeles'),  'Lumen Field',              'Seattle'),
    (33, 'groupes', 'Allemagne',         'Côte d''Ivoire',     ('2026-06-20 16:00:00'::timestamp AT TIME ZONE 'America/Toronto'),      'BMO Field',                'Toronto'),
    (34, 'groupes', 'Équateur',          'Curaçao',            ('2026-06-20 19:00:00'::timestamp AT TIME ZONE 'America/Chicago'),      'Arrowhead Stadium',        'Kansas City'),
    (35, 'groupes', 'Pays-Bas',          'Suède',              ('2026-06-20 12:00:00'::timestamp AT TIME ZONE 'America/Chicago'),      'NRG Stadium',              'Houston'),
    (36, 'groupes', 'Tunisie',           'Japon',              ('2026-06-20 22:00:00'::timestamp AT TIME ZONE 'America/Monterrey'),    'Estadio BBVA',             'Monterrey'),
    (37, 'groupes', 'Uruguay',           'Cap-Vert',           ('2026-06-21 18:00:00'::timestamp AT TIME ZONE 'America/New_York'),     'Hard Rock Stadium',        'Miami'),
    (38, 'groupes', 'Espagne',           'Arabie saoudite',    ('2026-06-21 12:00:00'::timestamp AT TIME ZONE 'America/New_York'),     'Mercedes-Benz Stadium',    'Atlanta'),
    (39, 'groupes', 'Belgique',          'Iran',               ('2026-06-21 12:00:00'::timestamp AT TIME ZONE 'America/Los_Angeles'),  'SoFi Stadium',             'Los Angeles'),
    (40, 'groupes', 'Nouvelle-Zélande',  'Égypte',             ('2026-06-21 18:00:00'::timestamp AT TIME ZONE 'America/Vancouver'),    'BC Place',                 'Vancouver'),
    (41, 'groupes', 'Norvège',           'Sénégal',            ('2026-06-22 20:00:00'::timestamp AT TIME ZONE 'America/New_York'),     'MetLife Stadium',          'New York/New Jersey'),
    (42, 'groupes', 'France',            'Irak',               ('2026-06-22 17:00:00'::timestamp AT TIME ZONE 'America/New_York'),     'Lincoln Financial Field',  'Philadelphie'),
    (43, 'groupes', 'Argentine',         'Autriche',           ('2026-06-22 12:00:00'::timestamp AT TIME ZONE 'America/Chicago'),      'AT&T Stadium',             'Dallas'),
    (44, 'groupes', 'Jordanie',          'Algérie',            ('2026-06-22 20:00:00'::timestamp AT TIME ZONE 'America/Los_Angeles'),  'Levi''s Stadium',          'San Francisco Bay Area'),
    (45, 'groupes', 'Angleterre',        'Ghana',              ('2026-06-23 16:00:00'::timestamp AT TIME ZONE 'America/New_York'),     'Gillette Stadium',         'Boston'),
    (46, 'groupes', 'Panama',            'Croatie',            ('2026-06-23 19:00:00'::timestamp AT TIME ZONE 'America/Toronto'),      'BMO Field',                'Toronto'),
    (47, 'groupes', 'Portugal',          'Ouzbékistan',        ('2026-06-23 12:00:00'::timestamp AT TIME ZONE 'America/Chicago'),      'NRG Stadium',              'Houston'),
    (48, 'groupes', 'Colombie',          'RD Congo',           ('2026-06-23 20:00:00'::timestamp AT TIME ZONE 'America/Mexico_City'),  'Estadio Akron',            'Zapopan'),
    (49, 'groupes', 'Écosse',            'Brésil',             ('2026-06-24 18:00:00'::timestamp AT TIME ZONE 'America/New_York'),     'Hard Rock Stadium',        'Miami'),
    (50, 'groupes', 'Maroc',             'Haïti',              ('2026-06-24 18:00:00'::timestamp AT TIME ZONE 'America/New_York'),     'Mercedes-Benz Stadium',    'Atlanta'),
    (51, 'groupes', 'Suisse',            'Canada',             ('2026-06-24 12:00:00'::timestamp AT TIME ZONE 'America/Vancouver'),    'BC Place',                 'Vancouver'),
    (52, 'groupes', 'Bosnie-Herzégovine','Qatar',              ('2026-06-24 12:00:00'::timestamp AT TIME ZONE 'America/Los_Angeles'),  'Lumen Field',              'Seattle'),
    (53, 'groupes', 'Tchéquie',          'Mexique',            ('2026-06-24 19:00:00'::timestamp AT TIME ZONE 'America/Mexico_City'),  'Estadio Azteca',           'Mexico'),
    (54, 'groupes', 'Afrique du Sud',    'Corée du Sud',       ('2026-06-24 19:00:00'::timestamp AT TIME ZONE 'America/Monterrey'),    'Estadio BBVA',             'Monterrey'),
    (55, 'groupes', 'Curaçao',           'Côte d''Ivoire',     ('2026-06-25 16:00:00'::timestamp AT TIME ZONE 'America/New_York'),     'Lincoln Financial Field',  'Philadelphie'),
    (56, 'groupes', 'Équateur',          'Allemagne',          ('2026-06-25 16:00:00'::timestamp AT TIME ZONE 'America/New_York'),     'MetLife Stadium',          'New York/New Jersey'),
    (57, 'groupes', 'Japon',             'Suède',              ('2026-06-25 18:00:00'::timestamp AT TIME ZONE 'America/Chicago'),      'AT&T Stadium',             'Dallas'),
    (58, 'groupes', 'Tunisie',           'Pays-Bas',           ('2026-06-25 18:00:00'::timestamp AT TIME ZONE 'America/Chicago'),      'Arrowhead Stadium',        'Kansas City'),
    (59, 'groupes', 'Turquie',           'États-Unis',         ('2026-06-25 19:00:00'::timestamp AT TIME ZONE 'America/Los_Angeles'),  'SoFi Stadium',             'Los Angeles'),
    (60, 'groupes', 'Paraguay',          'Australie',          ('2026-06-25 19:00:00'::timestamp AT TIME ZONE 'America/Los_Angeles'),  'Levi''s Stadium',          'San Francisco Bay Area'),
    (61, 'groupes', 'Norvège',           'France',             ('2026-06-26 15:00:00'::timestamp AT TIME ZONE 'America/New_York'),     'Gillette Stadium',         'Boston'),
    (62, 'groupes', 'Sénégal',           'Irak',               ('2026-06-26 15:00:00'::timestamp AT TIME ZONE 'America/Toronto'),      'BMO Field',                'Toronto'),
    (63, 'groupes', 'Égypte',            'Iran',               ('2026-06-26 20:00:00'::timestamp AT TIME ZONE 'America/Los_Angeles'),  'Lumen Field',              'Seattle'),
    (64, 'groupes', 'Nouvelle-Zélande',  'Belgique',           ('2026-06-26 20:00:00'::timestamp AT TIME ZONE 'America/Vancouver'),    'BC Place',                 'Vancouver'),
    (65, 'groupes', 'Cap-Vert',          'Arabie saoudite',    ('2026-06-26 19:00:00'::timestamp AT TIME ZONE 'America/Chicago'),      'NRG Stadium',              'Houston'),
    (66, 'groupes', 'Uruguay',           'Espagne',            ('2026-06-26 18:00:00'::timestamp AT TIME ZONE 'America/Mexico_City'),  'Estadio Akron',            'Zapopan'),
    (67, 'groupes', 'Panama',            'Angleterre',         ('2026-06-27 17:00:00'::timestamp AT TIME ZONE 'America/New_York'),     'MetLife Stadium',          'New York/New Jersey'),
    (68, 'groupes', 'Croatie',           'Ghana',              ('2026-06-27 17:00:00'::timestamp AT TIME ZONE 'America/New_York'),     'Lincoln Financial Field',  'Philadelphie'),
    (69, 'groupes', 'Algérie',           'Autriche',           ('2026-06-27 21:00:00'::timestamp AT TIME ZONE 'America/Chicago'),      'Arrowhead Stadium',        'Kansas City'),
    (70, 'groupes', 'Jordanie',          'Argentine',          ('2026-06-27 21:00:00'::timestamp AT TIME ZONE 'America/Chicago'),      'AT&T Stadium',             'Dallas'),
    (71, 'groupes', 'Colombie',          'Portugal',           ('2026-06-27 19:30:00'::timestamp AT TIME ZONE 'America/New_York'),     'Hard Rock Stadium',        'Miami'),
    (72, 'groupes', 'RD Congo',          'Ouzbékistan',        ('2026-06-27 19:30:00'::timestamp AT TIME ZONE 'America/New_York'),     'Mercedes-Benz Stadium',    'Atlanta'),

    -- ====================================================================
    -- 16es de finale (R32, matchs 73 à 88)
    -- ====================================================================
    (73, '16es', '2e Groupe A',                                '2e Groupe B',                                ('2026-06-28 12:00:00'::timestamp AT TIME ZONE 'America/Los_Angeles'),  'SoFi Stadium',             'Los Angeles'),
    (74, '16es', '1er Groupe E',                               'Meilleur 3e Groupes A/B/C/D/F',              ('2026-06-29 16:30:00'::timestamp AT TIME ZONE 'America/New_York'),     'Gillette Stadium',         'Boston'),
    (75, '16es', '1er Groupe F',                               '2e Groupe C',                                ('2026-06-29 19:00:00'::timestamp AT TIME ZONE 'America/Monterrey'),    'Estadio BBVA',             'Monterrey'),
    (76, '16es', '1er Groupe C',                               '2e Groupe F',                                ('2026-06-29 12:00:00'::timestamp AT TIME ZONE 'America/Chicago'),      'NRG Stadium',              'Houston'),
    (77, '16es', '1er Groupe I',                               'Meilleur 3e Groupes C/D/F/G/H',              ('2026-06-30 17:00:00'::timestamp AT TIME ZONE 'America/New_York'),     'MetLife Stadium',          'New York/New Jersey'),
    (78, '16es', '2e Groupe E',                                '2e Groupe I',                                ('2026-06-30 12:00:00'::timestamp AT TIME ZONE 'America/Chicago'),      'AT&T Stadium',             'Dallas'),
    (79, '16es', '1er Groupe A',                               'Meilleur 3e Groupes C/E/F/H/I',              ('2026-06-30 19:00:00'::timestamp AT TIME ZONE 'America/Mexico_City'),  'Estadio Azteca',           'Mexico'),
    (80, '16es', '1er Groupe L',                               'Meilleur 3e Groupes E/H/I/J/K',              ('2026-07-01 12:00:00'::timestamp AT TIME ZONE 'America/New_York'),     'Mercedes-Benz Stadium',    'Atlanta'),
    (81, '16es', '1er Groupe D',                               'Meilleur 3e Groupes B/E/F/I/J',              ('2026-07-01 17:00:00'::timestamp AT TIME ZONE 'America/Los_Angeles'),  'Levi''s Stadium',          'San Francisco Bay Area'),
    (82, '16es', '1er Groupe G',                               'Meilleur 3e Groupes A/E/H/I/J',              ('2026-07-01 13:00:00'::timestamp AT TIME ZONE 'America/Los_Angeles'),  'Lumen Field',              'Seattle'),
    (83, '16es', '2e Groupe K',                                '2e Groupe L',                                ('2026-07-02 19:00:00'::timestamp AT TIME ZONE 'America/Toronto'),      'BMO Field',                'Toronto'),
    (84, '16es', '1er Groupe H',                               '2e Groupe J',                                ('2026-07-02 12:00:00'::timestamp AT TIME ZONE 'America/Los_Angeles'),  'SoFi Stadium',             'Los Angeles'),
    (85, '16es', '1er Groupe B',                               'Meilleur 3e Groupes E/F/G/I/J',              ('2026-07-02 20:00:00'::timestamp AT TIME ZONE 'America/Vancouver'),    'BC Place',                 'Vancouver'),
    (86, '16es', '1er Groupe J',                               '2e Groupe H',                                ('2026-07-03 18:00:00'::timestamp AT TIME ZONE 'America/New_York'),     'Hard Rock Stadium',        'Miami'),
    (87, '16es', '1er Groupe K',                               'Meilleur 3e Groupes D/E/I/J/L',              ('2026-07-03 20:30:00'::timestamp AT TIME ZONE 'America/Chicago'),      'Arrowhead Stadium',        'Kansas City'),
    (88, '16es', '2e Groupe D',                                '2e Groupe G',                                ('2026-07-03 13:00:00'::timestamp AT TIME ZONE 'America/Chicago'),      'AT&T Stadium',             'Dallas'),

    -- ====================================================================
    -- 8es de finale (matchs 89 à 96)
    -- ====================================================================
    (89, '8es', 'Vainqueur 16e #74', 'Vainqueur 16e #77', ('2026-07-04 17:00:00'::timestamp AT TIME ZONE 'America/New_York'),     'Lincoln Financial Field',  'Philadelphie'),
    (90, '8es', 'Vainqueur 16e #73', 'Vainqueur 16e #75', ('2026-07-04 12:00:00'::timestamp AT TIME ZONE 'America/Chicago'),      'NRG Stadium',              'Houston'),
    (91, '8es', 'Vainqueur 16e #76', 'Vainqueur 16e #78', ('2026-07-05 16:00:00'::timestamp AT TIME ZONE 'America/New_York'),     'MetLife Stadium',          'New York/New Jersey'),
    (92, '8es', 'Vainqueur 16e #79', 'Vainqueur 16e #80', ('2026-07-05 18:00:00'::timestamp AT TIME ZONE 'America/Mexico_City'),  'Estadio Azteca',           'Mexico'),
    (93, '8es', 'Vainqueur 16e #83', 'Vainqueur 16e #84', ('2026-07-06 14:00:00'::timestamp AT TIME ZONE 'America/Chicago'),      'AT&T Stadium',             'Dallas'),
    (94, '8es', 'Vainqueur 16e #81', 'Vainqueur 16e #82', ('2026-07-06 17:00:00'::timestamp AT TIME ZONE 'America/Los_Angeles'),  'Lumen Field',              'Seattle'),
    (95, '8es', 'Vainqueur 16e #86', 'Vainqueur 16e #88', ('2026-07-07 12:00:00'::timestamp AT TIME ZONE 'America/New_York'),     'Mercedes-Benz Stadium',    'Atlanta'),
    (96, '8es', 'Vainqueur 16e #85', 'Vainqueur 16e #87', ('2026-07-07 13:00:00'::timestamp AT TIME ZONE 'America/Vancouver'),    'BC Place',                 'Vancouver'),

    -- ====================================================================
    -- Quarts de finale (matchs 97 à 100)
    -- ====================================================================
    (97,  'quarts', 'Vainqueur 8e #89', 'Vainqueur 8e #90', ('2026-07-09 16:00:00'::timestamp AT TIME ZONE 'America/New_York'),     'Gillette Stadium',     'Boston'),
    (98,  'quarts', 'Vainqueur 8e #93', 'Vainqueur 8e #94', ('2026-07-10 12:00:00'::timestamp AT TIME ZONE 'America/Los_Angeles'),  'SoFi Stadium',         'Los Angeles'),
    (99,  'quarts', 'Vainqueur 8e #91', 'Vainqueur 8e #92', ('2026-07-11 17:00:00'::timestamp AT TIME ZONE 'America/New_York'),     'Hard Rock Stadium',    'Miami'),
    (100, 'quarts', 'Vainqueur 8e #95', 'Vainqueur 8e #96', ('2026-07-11 20:00:00'::timestamp AT TIME ZONE 'America/Chicago'),      'Arrowhead Stadium',    'Kansas City'),

    -- ====================================================================
    -- Demi-finales (matchs 101 et 102)
    -- ====================================================================
    (101, 'demis', 'Vainqueur Quart #97', 'Vainqueur Quart #98',  ('2026-07-14 14:00:00'::timestamp AT TIME ZONE 'America/Chicago'),   'AT&T Stadium',          'Dallas'),
    (102, 'demis', 'Vainqueur Quart #99', 'Vainqueur Quart #100', ('2026-07-15 15:00:00'::timestamp AT TIME ZONE 'America/New_York'),  'Mercedes-Benz Stadium', 'Atlanta'),

    -- ====================================================================
    -- Match pour la 3e place (103)
    -- ====================================================================
    (103, '3e_place', 'Perdant Demi #101', 'Perdant Demi #102', ('2026-07-18 17:00:00'::timestamp AT TIME ZONE 'America/New_York'), 'Hard Rock Stadium', 'Miami'),

    -- ====================================================================
    -- Finale (104)
    -- ====================================================================
    (104, 'finale', 'Vainqueur Demi #101', 'Vainqueur Demi #102', ('2026-07-19 15:00:00'::timestamp AT TIME ZONE 'America/New_York'), 'MetLife Stadium', 'New York/New Jersey')

ON CONFLICT (numero_match) DO NOTHING;
