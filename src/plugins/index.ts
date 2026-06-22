import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { importExportPlugin } from '@payloadcms/plugin-import-export'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { searchPlugin } from '@payloadcms/plugin-search'
import { Plugin } from 'payload'
import { revalidateRedirects } from '@/hooks/revalidateRedirects'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { searchFields } from '@/search/fieldOverrides'
import { beforeSyncWithSearch } from '@/search/beforeSync'

import { Page, Post } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'

const generateTitle: GenerateTitle<Post | Page> = ({ doc }) => {
  // Les livres ont `titre`, les pages/posts ont `title`.
  const t = (doc as { title?: string; titre?: string })?.title ?? (doc as { titre?: string })?.titre
  return t ? `${t} · Koren France` : 'Koren France'
}

const generateURL: GenerateURL<Post | Page> = ({ doc, collectionSlug }) => {
  const url = getServerSideURL()
  if (!doc?.slug) return url
  // Les fiches livres vivent sous /livres/<slug>.
  if (collectionSlug === 'livres' || 'titre' in (doc as object)) return `${url}/livres/${doc.slug}`
  return `${url}/${doc.slug}`
}

export const plugins: Plugin[] = [
  redirectsPlugin({
    collections: ['pages', 'posts'],
    overrides: {
      // @ts-expect-error - This is a valid override, mapped fields don't resolve to the same type
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'from') {
            return {
              ...field,
              admin: {
                description: 'You will need to rebuild the website when changing this field.',
              },
            }
          }
          return field
        })
      },
      hooks: {
        afterChange: [revalidateRedirects],
      },
    },
  }),
  nestedDocsPlugin({
    collections: ['categories'],
    generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
  }),
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    formOverrides: {
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }
          return field
        })
      },
    },
  }),
  searchPlugin({
    collections: ['posts'],
    beforeSync: beforeSyncWithSearch,
    searchOverrides: {
      fields: ({ defaultFields }) => {
        return [...defaultFields, ...searchFields]
      },
    },
  }),
  // Stockage des médias sur Vercel Blob — activé uniquement si le token est présent
  // (donc en prod Vercel). En local sans token, Payload garde le disque (editeur-livres/media).
  vercelBlobStorage({
    enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    collections: { media: true },
    token: process.env.BLOB_READ_WRITE_TOKEN,
  }),
  // Import / export CSV depuis l'admin (gestion du catalogue par des non-programmeurs).
  // Mode synchrone (disableJobsQueue) : pas besoin de worker/cron, le catalogue est petit.
  importExportPlugin({
    collections: [
      {
        slug: 'livres',
        export: { format: 'csv', disableJobsQueue: true },
        import: { disableJobsQueue: true },
      },
      {
        slug: 'auteurs',
        export: { format: 'csv', disableJobsQueue: true },
        import: { disableJobsQueue: true },
      },
      {
        slug: 'categories',
        export: { format: 'csv', disableJobsQueue: true },
        import: { disableJobsQueue: true },
      },
      {
        slug: 'lots',
        export: { format: 'csv', disableJobsQueue: true },
        import: { disableJobsQueue: true },
      },
    ],
  }),
]
