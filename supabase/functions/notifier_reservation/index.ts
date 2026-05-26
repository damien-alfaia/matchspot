// Edge Function Supabase — notification des réservations.
//
// Déclenchée par le front juste après l'INSERT dans `reservations`. Envoie
// deux emails via Resend :
//   - au client : confirmation avec récap du match et adresse du bar.
//   - au bar : alerte « nouvelle réservation » avec lien vers le dashboard.
//
// Variables d'environnement requises :
//   - RESEND_API_KEY       : clé API Resend (https://resend.com/api-keys)
//   - EMAIL_EXPEDITEUR     : adresse vérifiée (ex « MatchSpot <noreply@matchspot.fr> »)
//   - URL_APP              : base URL du front (ex https://matchspot.fr)
//
// Sécurité : la fonction lit la réservation via la `service_role` (bypass
// RLS), ce qui est sûr puisqu'elle reçoit seulement un `reservation_id`
// (UUID v4, non énumérable). On ne fait jamais confiance aux données
// envoyées par le client.
//
// Déploiement :
//   supabase functions deploy notifier_reservation
//   supabase secrets set RESEND_API_KEY=... EMAIL_EXPEDITEUR=... URL_APP=...

// @ts-nocheck — Cette fonction tourne dans Deno (Supabase Edge), pas dans
// l'environnement TS du front. Le typecheck du front l'ignore via
// tsconfig.include (qui ne cible que `web/src`).

import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const EMAIL_EXPEDITEUR =
  Deno.env.get('EMAIL_EXPEDITEUR') ?? 'MatchSpot <onboarding@resend.dev>';
const URL_APP = Deno.env.get('URL_APP') ?? 'https://matchspot.fr';

// Headers CORS — sans ça, le navigateur bloque l'appel cross-origin au
// preflight OPTIONS, et la fonction n'est jamais atteinte.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  // Préflight CORS : répondre 200 + headers, sans rien faire de plus.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const { reservation_id } = await req.json();
    if (!reservation_id) {
      return new Response('reservation_id requis', {
        status: 400,
        headers: corsHeaders,
      });
    }

    const supa = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    const { data: r, error } = await supa
      .from('reservations')
      .select(
        `*,
         diffusions(
           id, places_disponibles,
           matchs(numero_match, equipe_domicile, equipe_exterieur, coup_envoi_utc, stade, ville_hote),
           etablissements(
             id, nom, adresse, ville, fuseau_horaire, slug_public, telephone,
             organisation_id
           )
         )`,
      )
      .eq('id', reservation_id)
      .single();

    if (error || !r) {
      return new Response(`Réservation introuvable : ${error?.message}`, {
        status: 404,
        headers: corsHeaders,
      });
    }

    const d = r.diffusions;
    const m = d.matchs;
    const e = d.etablissements;

    const heureLocale = new Intl.DateTimeFormat('fr-FR', {
      timeZone: e.fuseau_horaire,
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(m.coup_envoi_utc));

    const urlBar = `${URL_APP}/etablissements/${e.slug_public}`;
    const urlDashboard = `${URL_APP}/tableau-de-bord/etablissements/${e.id}`;
    const matchLibelle = `${m.equipe_domicile} vs ${m.equipe_exterieur}`;

    // Récupération de l'email du propriétaire (utilisé seulement pour le
    // statut 'en_attente' qui notifie aussi le bar de la nouvelle résa).
    const emailsBar: string[] = [];
    if (r.statut === 'en_attente') {
      const { data: adhesions } = await supa
        .from('adhesions')
        .select('utilisateur_id')
        .eq('organisation_id', e.organisation_id)
        .eq('role', 'proprietaire')
        .limit(1)
        .maybeSingle();
      if (adhesions) {
        const { data: u } = await supa.auth.admin.getUserById(
          adhesions.utilisateur_id,
        );
        if (u?.user?.email) emailsBar.push(u.user.email);
      }
    }

    // Construction des mails à envoyer selon le statut courant de la résa.
    // - en_attente  : 2 mails (récap client + alerte bar).
    // - confirmee   : 1 mail au client (confirmation).
    // - annulee     : 1 mail au client (annulation).
    const envois: Array<Promise<void>> = [];

    if (r.statut === 'en_attente') {
      envois.push(envoyerResend({
        from: EMAIL_EXPEDITEUR,
        to: r.email_client,
        subject: `Votre réservation à ${e.nom} — ${matchLibelle}`,
        html: `
          <p>Bonjour ${escapeHtml(r.nom_client)},</p>
          <p>Votre demande de réservation a bien été enregistrée pour <strong>${matchLibelle}</strong>, le ${heureLocale} (heure du bar).</p>
          <p>
            <strong>${escapeHtml(e.nom)}</strong><br>
            ${e.adresse ? escapeHtml(e.adresse) + '<br>' : ''}
            ${e.telephone ? '📞 ' + escapeHtml(e.telephone) + '<br>' : ''}
          </p>
          <p>Groupe de ${r.taille_groupe} personne(s). Le bar vous confirmera par email ou téléphone.</p>
          <p><a href="${urlBar}">Voir la page du bar →</a></p>
          <p style="color:#888;font-size:12px;margin-top:24px">MatchSpot — où voir le match ?</p>
        `,
      }));

      if (emailsBar.length > 0) {
        envois.push(envoyerResend({
          from: EMAIL_EXPEDITEUR,
          to: emailsBar,
          subject: `Nouvelle réservation à ${e.nom} — ${matchLibelle}`,
          html: `
            <p>Une nouvelle réservation vient d'arriver :</p>
            <ul>
              <li><strong>Client :</strong> ${escapeHtml(r.nom_client)} (${escapeHtml(r.email_client)})</li>
              <li><strong>Groupe :</strong> ${r.taille_groupe} personne(s)</li>
              <li><strong>Match :</strong> ${matchLibelle}</li>
              <li><strong>Heure locale :</strong> ${heureLocale}</li>
            </ul>
            <p><a href="${urlDashboard}">Ouvrir le dashboard →</a></p>
          `,
        }));
      }
    } else if (r.statut === 'confirmee') {
      envois.push(envoyerResend({
        from: EMAIL_EXPEDITEUR,
        to: r.email_client,
        subject: `Confirmé ! Votre table à ${e.nom} pour ${matchLibelle}`,
        html: `
          <p>Bonjour ${escapeHtml(r.nom_client)},</p>
          <p>Bonne nouvelle : <strong>${escapeHtml(e.nom)}</strong> vient de confirmer votre réservation pour <strong>${matchLibelle}</strong>, le ${heureLocale} (heure du bar).</p>
          <p>Votre groupe de ${r.taille_groupe} personne(s) est attendu sur place. Pensez à arriver un peu en avance pour bien vous installer.</p>
          <p>
            <strong>${escapeHtml(e.nom)}</strong><br>
            ${e.adresse ? escapeHtml(e.adresse) + '<br>' : ''}
            ${e.telephone ? '📞 ' + escapeHtml(e.telephone) + '<br>' : ''}
          </p>
          <p><a href="${urlBar}">Revoir la page du bar →</a></p>
          <p style="color:#888;font-size:12px;margin-top:24px">MatchSpot — où voir le match ?</p>
        `,
      }));
    } else if (r.statut === 'annulee') {
      envois.push(envoyerResend({
        from: EMAIL_EXPEDITEUR,
        to: r.email_client,
        subject: `Réservation annulée — ${e.nom} pour ${matchLibelle}`,
        html: `
          <p>Bonjour ${escapeHtml(r.nom_client)},</p>
          <p>Votre réservation pour <strong>${matchLibelle}</strong> à <strong>${escapeHtml(e.nom)}</strong> a été annulée.</p>
          <p>Si vous voulez en savoir plus sur la raison, contactez directement le bar${e.telephone ? ` au ${escapeHtml(e.telephone)}` : ''}.</p>
          <p>Vous pouvez chercher un autre bar diffusant ce match sur <a href="${URL_APP}">MatchSpot</a>.</p>
          <p style="color:#888;font-size:12px;margin-top:24px">MatchSpot — où voir le match ?</p>
        `,
      }));
    }
    const resultats = await Promise.allSettled(envois);

    const erreurs = resultats
      .filter((x) => x.status === 'rejected')
      .map((x) => (x as PromiseRejectedResult).reason);

    return new Response(
      JSON.stringify({
        ok: erreurs.length === 0,
        envoyes: resultats.filter((x) => x.status === 'fulfilled').length,
        erreurs: erreurs.map(String),
      }),
      {
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      },
    );
  } catch (err) {
    return new Response(`Erreur : ${err}`, {
      status: 500,
      headers: corsHeaders,
    });
  }
});

async function envoyerResend(payload: Record<string, unknown>): Promise<void> {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`Resend ${r.status} : ${txt}`);
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );
}
