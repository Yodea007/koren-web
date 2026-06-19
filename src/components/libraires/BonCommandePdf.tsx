import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from '@react-pdf/renderer'
import React from 'react'

import type { RayonArticles } from '@/utilities/tarif'
import { formatPrix } from '@/utilities/koren'

export type LibraireInfo = {
  magasin?: string
  nom?: string
  email?: string
  telephone?: string
  adresse?: string
}

export type LigneCommande = {
  titre: string
  isbn: string
  prixTTC: number
  qte: number
  totalLigne: number
}

export type CommandeData = {
  reference: string
  libraire: LibraireInfo
  remisePourcent: number
  lignes: LigneCommande[]
  totaux: { nbArticles: number; montantBrut: number; montantNet: number }
}

const C = {
  bordeaux: '#93142e',
  encre: '#2a231c',
  douce: '#6e6153',
  ligne: '#d9cdb5',
  papier: '#f4ecdb',
}

const s = StyleSheet.create({
  page: { paddingTop: 34, paddingBottom: 46, paddingHorizontal: 30, fontSize: 8.5, color: C.encre },
  // En-tête
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 4 },
  brand: { fontSize: 19, fontFamily: 'Times-Bold', color: C.bordeaux, letterSpacing: 1 },
  brandSub: { fontSize: 7, color: C.douce, marginTop: 2, letterSpacing: 1 },
  docTitle: { fontSize: 12, fontFamily: 'Times-Bold', textAlign: 'right' },
  docMeta: { fontSize: 7.5, color: C.douce, textAlign: 'right', marginTop: 2 },
  rule: { borderBottomWidth: 1.4, borderBottomColor: C.bordeaux, marginTop: 6, marginBottom: 8 },
  // Tableau
  rayon: {
    backgroundColor: C.bordeaux,
    color: '#f7efe0',
    fontFamily: 'Times-Bold',
    fontSize: 8.5,
    paddingVertical: 3,
    paddingHorizontal: 5,
    marginTop: 8,
    letterSpacing: 0.5,
  },
  th: {
    flexDirection: 'row',
    borderBottomWidth: 0.8,
    borderBottomColor: C.encre,
    paddingVertical: 3,
    fontFamily: 'Times-Bold',
    fontSize: 7.5,
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
  cISBN: { width: 78 },
  cPrix: { width: 50, textAlign: 'right' },
  cPoids: { width: 42, textAlign: 'right' },
  cDim: { width: 66 },
  cCarton: { width: 40, textAlign: 'right' },
  cQte: { width: 40, textAlign: 'right' },
  cQteBox: { width: 40 },
  qteBox: {
    borderWidth: 0.8,
    borderColor: C.douce,
    height: 11,
    marginLeft: 'auto',
    width: 30,
    borderRadius: 1,
  },
  cTotal: { width: 60, textAlign: 'right' },
  indispo: { color: '#b9302f', fontSize: 6.5 },
  // Encart bas
  footer: { marginTop: 14, flexDirection: 'row', gap: 14 },
  box: { flex: 1, borderWidth: 0.8, borderColor: C.ligne, borderRadius: 3, padding: 8 },
  boxTitle: { fontFamily: 'Times-Bold', fontSize: 8, color: C.bordeaux, marginBottom: 5 },
  field: { borderBottomWidth: 0.6, borderBottomColor: C.ligne, paddingBottom: 7, marginBottom: 6, fontSize: 8 },
  totRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  totNet: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 0.8,
    borderTopColor: C.encre,
    fontFamily: 'Times-Bold',
    fontSize: 10,
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
  pageNo: { position: 'absolute', bottom: 20, right: 30, fontSize: 6.5, color: C.douce },
})

const fmtPoids = (g?: number | null) => (g ? `${g} g` : '—')
const fmtNum = (n?: number | null) => (n ? String(n) : '—')

const Header: React.FC<{ titre: string; meta: string }> = ({ titre, meta }) => (
  <>
    <View style={s.head} fixed>
      <View>
        <Text style={s.brand}>KOREN</Text>
        <Text style={s.brandSub}>KOREN · MAGGID · THE TOBY PRESS</Text>
      </View>
      <View>
        <Text style={s.docTitle}>{titre}</Text>
        <Text style={s.docMeta}>{meta}</Text>
      </View>
    </View>
    <View style={s.rule} fixed />
  </>
)

// ---------- Tarif vierge ----------
const TarifDocument: React.FC<{ rayons: RayonArticles[]; dateStr: string }> = ({ rayons, dateStr }) => (
  <Document title="Tarif libraires — Koren France" author="Koren France">
    <Page size="A4" style={s.page}>
      <Header titre="Tarif libraires / Bon de commande" meta={`Tarif au ${dateStr} · Prix TTC`} />

      {rayons.map((r) => (
        <View key={r.slug} wrap={false}>
          <Text style={s.rayon}>{r.label}</Text>
          <View style={s.th}>
            <Text style={s.cTitre}>Titre</Text>
            <Text style={s.cISBN}>ISBN</Text>
            <Text style={s.cPrix}>Prix TTC</Text>
            <Text style={s.cPoids}>Poids</Text>
            <Text style={s.cDim}>Dimensions</Text>
            <Text style={s.cCarton}>/ carton</Text>
            <Text style={s.cQte}>Qté</Text>
          </View>
          {r.articles.map((a) => (
            <View key={a.ref} style={s.tr} wrap={false}>
              <Text style={s.cTitre}>
                {a.titre}
                {!a.disponible ? <Text style={s.indispo}>  (indisponible)</Text> : null}
              </Text>
              <Text style={s.cISBN}>{a.isbn || '—'}</Text>
              <Text style={s.cPrix}>{formatPrix(a.prixTTC)}</Text>
              <Text style={s.cPoids}>{fmtPoids(a.poids)}</Text>
              <Text style={s.cDim}>{a.dimensions || '—'}</Text>
              <Text style={s.cCarton}>{fmtNum(a.parCarton)}</Text>
              <View style={s.cQteBox}>
                <View style={s.qteBox} />
              </View>
            </View>
          ))}
        </View>
      ))}

      <View style={s.footer} wrap={false}>
        <View style={s.box}>
          <Text style={s.boxTitle}>Libraire</Text>
          <Text style={s.field}>Magasin :</Text>
          <Text style={s.field}>Contact :</Text>
          <Text style={s.field}>E-mail :</Text>
          <Text style={s.field}>Téléphone :</Text>
          <Text style={s.field}>Adresse :</Text>
        </View>
        <View style={s.box}>
          <Text style={s.boxTitle}>Commande</Text>
          <Text style={s.field}>Taux de remise (%) :</Text>
          <Text style={s.field}>Total commande :</Text>
          <Text style={s.field}>Date :</Text>
          <Text style={[s.field, { marginTop: 10 }]}>Signature / cachet :</Text>
        </View>
      </View>

      <Text style={s.legal} fixed>
        Koren France · Prix publics TTC, TVA 5,5 % incluse · Tarif susceptible de modification.
      </Text>
      <Text style={s.pageNo} fixed render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </Page>
  </Document>
)

// ---------- Commande remplie ----------
const CommandeDocument: React.FC<{ data: CommandeData; dateStr: string }> = ({ data, dateStr }) => {
  const { libraire: l, remisePourcent, lignes, totaux } = data
  return (
    <Document title={`Bon de commande ${data.reference}`} author="Koren France">
      <Page size="A4" style={s.page}>
        <Header titre="Bon de commande" meta={`${data.reference} · ${dateStr}`} />

        <View style={s.footer} wrap={false}>
          <View style={s.box}>
            <Text style={s.boxTitle}>Libraire</Text>
            <Text style={{ marginBottom: 3 }}>Magasin : {l.magasin || '—'}</Text>
            {l.nom ? <Text style={{ marginBottom: 3 }}>Contact : {l.nom}</Text> : null}
            <Text style={{ marginBottom: 3 }}>E-mail : {l.email || '—'}</Text>
            {l.telephone ? <Text style={{ marginBottom: 3 }}>Téléphone : {l.telephone}</Text> : null}
            {l.adresse ? <Text>Adresse : {l.adresse}</Text> : null}
          </View>
          <View style={s.box}>
            <Text style={s.boxTitle}>Récapitulatif</Text>
            <View style={s.totRow}>
              <Text>Articles</Text>
              <Text>{totaux.nbArticles}</Text>
            </View>
            <View style={s.totRow}>
              <Text>Montant brut</Text>
              <Text>{formatPrix(totaux.montantBrut)}</Text>
            </View>
            <View style={s.totRow}>
              <Text>Remise libraire</Text>
              <Text>− {remisePourcent} %</Text>
            </View>
            <View style={s.totNet}>
              <Text>Net à payer</Text>
              <Text>{formatPrix(totaux.montantNet)}</Text>
            </View>
          </View>
        </View>

        <View style={[s.th, { marginTop: 16 }]}>
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

        <Text style={s.legal} fixed>
          Koren France · Prix publics TTC, TVA 5,5 % incluse · Remise de {remisePourcent} % appliquée au net.
        </Text>
        <Text style={s.pageNo} fixed render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
      </Page>
    </Document>
  )
}

export function renderTarifPdf(rayons: RayonArticles[], dateStr: string): Promise<Buffer> {
  return renderToBuffer(<TarifDocument rayons={rayons} dateStr={dateStr} />)
}

export function renderCommandePdf(data: CommandeData, dateStr: string): Promise<Buffer> {
  return renderToBuffer(<CommandeDocument data={data} dateStr={dateStr} />)
}
