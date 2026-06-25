import { Document, Page, StyleSheet, Text, View, renderToBuffer } from '@react-pdf/renderer'
import React from 'react'

import { formatPrix } from '@/utilities/koren'

// Récapitulatif PDF d'une commande client (joint à l'e-mail de confirmation + stocké
// sur la fiche commande). Même charte que le bon de commande libraire.
// NB : ce n'est pas une facture légale (pas de SIRET / TVA intracom) — à compléter
// avec les infos société le jour voulu.

export type RecapClientData = {
  reference: string
  client: { nom?: string | null; email?: string | null; telephone?: string | null }
  adresse: {
    ligne1?: string | null
    ligne2?: string | null
    codePostal?: string | null
    ville?: string | null
    pays?: string | null
  }
  lignes: { titre: string; isbn: string; prixTTC: number; qte: number; totalLigne: number }[]
  sousTotalTTC: number
  port: number
  totalTTC: number
  tvaIncluse: number
}

const C = {
  bordeaux: '#93142e',
  encre: '#2a231c',
  douce: '#6e6153',
  ligne: '#d9cdb5',
}

const s = StyleSheet.create({
  page: { paddingTop: 34, paddingBottom: 46, paddingHorizontal: 30, fontSize: 8.5, color: C.encre },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 4 },
  brand: { fontSize: 19, fontFamily: 'Times-Bold', color: C.bordeaux, letterSpacing: 1 },
  brandSub: { fontSize: 7, color: C.douce, marginTop: 2, letterSpacing: 1 },
  docTitle: { fontSize: 12, fontFamily: 'Times-Bold', textAlign: 'right' },
  docMeta: { fontSize: 7.5, color: C.douce, textAlign: 'right', marginTop: 2 },
  rule: { borderBottomWidth: 1.4, borderBottomColor: C.bordeaux, marginTop: 6, marginBottom: 8 },
  footer: { marginTop: 6, flexDirection: 'row', gap: 14 },
  box: { flex: 1, borderWidth: 0.8, borderColor: C.ligne, borderRadius: 3, padding: 8 },
  boxTitle: { fontFamily: 'Times-Bold', fontSize: 8, color: C.bordeaux, marginBottom: 5 },
  line: { marginBottom: 3 },
  th: {
    flexDirection: 'row',
    borderBottomWidth: 0.8,
    borderBottomColor: C.encre,
    paddingVertical: 3,
    fontFamily: 'Times-Bold',
    fontSize: 7.5,
    marginTop: 16,
  },
  tr: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: C.ligne,
    paddingVertical: 2.6,
    minHeight: 15,
    alignItems: 'center',
  },
  cTitre: { flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0, paddingRight: 6 },
  cISBN: { width: 90 },
  cPrix: { width: 55, textAlign: 'right' },
  cQte: { width: 40, textAlign: 'right' },
  cTotal: { width: 65, textAlign: 'right' },
  totals: { marginTop: 12, marginLeft: 'auto', width: 220 },
  totRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  totNet: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 0.8,
    borderTopColor: C.encre,
    fontFamily: 'Times-Bold',
    fontSize: 11,
    color: C.bordeaux,
  },
  legal: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    fontSize: 6.5,
    color: C.douce,
    textAlign: 'center',
  },
})

const RecapDocument: React.FC<{ data: RecapClientData; dateStr: string }> = ({ data, dateStr }) => {
  const { client, adresse: a, lignes } = data
  const adresseLignes = [
    a.ligne1,
    a.ligne2,
    [a.codePostal, a.ville].filter(Boolean).join(' '),
    a.pays,
  ].filter(Boolean) as string[]

  return (
    <Document title={`Commande ${data.reference}`} author="Koren France">
      <Page size="A4" style={s.page}>
        <View style={s.head} fixed>
          <View>
            <Text style={s.brand}>KOREN</Text>
            <Text style={s.brandSub}>KOREN · MAGGID · THE TOBY PRESS</Text>
          </View>
          <View>
            <Text style={s.docTitle}>Récapitulatif de commande</Text>
            <Text style={s.docMeta}>
              {data.reference} · {dateStr}
            </Text>
          </View>
        </View>
        <View style={s.rule} fixed />

        <View style={s.footer} wrap={false}>
          <View style={s.box}>
            <Text style={s.boxTitle}>Client</Text>
            {client.nom ? <Text style={s.line}>{client.nom}</Text> : null}
            {client.email ? <Text style={s.line}>{client.email}</Text> : null}
            {client.telephone ? <Text style={s.line}>{client.telephone}</Text> : null}
          </View>
          <View style={s.box}>
            <Text style={s.boxTitle}>Livraison</Text>
            {adresseLignes.length > 0 ? (
              adresseLignes.map((l, i) => (
                <Text key={i} style={s.line}>
                  {l}
                </Text>
              ))
            ) : (
              <Text style={s.line}>—</Text>
            )}
          </View>
        </View>

        <View style={s.th}>
          <Text style={s.cTitre}>Titre</Text>
          <Text style={s.cISBN}>ISBN</Text>
          <Text style={s.cPrix}>Prix TTC</Text>
          <Text style={s.cQte}>Qté</Text>
          <Text style={s.cTotal}>Total</Text>
        </View>
        {lignes.map((ln, i) => (
          <View key={i} style={s.tr} wrap={false}>
            <Text style={s.cTitre}>{ln.titre}</Text>
            <Text style={s.cISBN}>{ln.isbn || '—'}</Text>
            <Text style={s.cPrix}>{formatPrix(ln.prixTTC)}</Text>
            <Text style={s.cQte}>{ln.qte}</Text>
            <Text style={s.cTotal}>{formatPrix(ln.totalLigne)}</Text>
          </View>
        ))}

        <View style={s.totals} wrap={false}>
          <View style={s.totRow}>
            <Text>Sous-total</Text>
            <Text>{formatPrix(data.sousTotalTTC)}</Text>
          </View>
          <View style={s.totRow}>
            <Text>Frais de port</Text>
            <Text>{data.port === 0 ? 'Offert' : formatPrix(data.port)}</Text>
          </View>
          <View style={s.totNet}>
            <Text>Total payé</Text>
            <Text>{formatPrix(data.totalTTC)}</Text>
          </View>
          <View style={[s.totRow, { marginTop: 4 }]}>
            <Text style={{ color: C.douce, fontSize: 7.5 }}>dont TVA 5,5 %</Text>
            <Text style={{ color: C.douce, fontSize: 7.5 }}>{formatPrix(data.tvaIncluse)}</Text>
          </View>
        </View>

        <Text style={s.legal} fixed>
          Koren France · Prix publics TTC, TVA 5,5 % incluse · Merci de votre commande.
        </Text>
      </Page>
    </Document>
  )
}

export function renderRecapCommandePdf(data: RecapClientData, dateStr: string): Promise<Buffer> {
  return renderToBuffer(<RecapDocument data={data} dateStr={dateStr} />)
}
