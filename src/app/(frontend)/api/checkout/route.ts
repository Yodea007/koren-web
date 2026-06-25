import type Stripe from 'stripe'

import { enCentimesStripe } from '@/utilities/commerce'
import { getServerSideURL } from '@/utilities/getURL'
import { resoudrePanier, type ItemPanier } from '@/utilities/panier'
import { getStripe } from '@/utilities/stripe'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Crée une session Stripe Checkout (hébergée). Les PRIX et le PORT sont recalculés
// côté serveur depuis Payload : on ne fait jamais confiance aux montants du client.
// Chaque ligne porte sa `ref` dans la metadata produit → le webhook reconstitue la
// commande de façon fiable, quelle que soit la taille du panier.
export async function POST(req: Request): Promise<Response> {
  const stripe = getStripe()
  if (!stripe) {
    return Response.json({ error: 'Le paiement en ligne n’est pas encore activé.' }, { status: 503 })
  }

  let items: ItemPanier[] = []
  try {
    const body = (await req.json()) as { lignes?: ItemPanier[] }
    items = Array.isArray(body.lignes) ? body.lignes : []
  } catch {
    return Response.json({ error: 'Requête invalide.' }, { status: 400 })
  }

  const { lignes, port } = await resoudrePanier(items)
  if (lignes.length === 0) {
    return Response.json({ error: 'Votre panier est vide ou indisponible.' }, { status: 400 })
  }

  const origin = req.headers.get('origin') || getServerSideURL()

  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = lignes.map((l) => ({
    quantity: l.qte,
    price_data: {
      currency: 'eur',
      unit_amount: enCentimesStripe(l.prixTTC),
      product_data: {
        name: l.titre,
        metadata: { ref: l.ref, ...(l.isbn ? { isbn: l.isbn } : {}) },
      },
    },
  }))

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      locale: 'fr',
      shipping_address_collection: { allowed_countries: ['FR', 'MC'] },
      phone_number_collection: { enabled: true },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: enCentimesStripe(port), currency: 'eur' },
            display_name: port === 0 ? 'Livraison offerte' : 'Livraison France',
          },
        },
      ],
      success_url: `${origin}/commande/merci?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/commande/annulee`,
    })

    return Response.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error', err)
    return Response.json({ error: 'Le paiement est momentanément indisponible.' }, { status: 502 })
  }
}
