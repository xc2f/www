import { getServerSideURL } from '@/utilities/getURL'

const profile = 'https://www.rfc-editor.org/info/rfc9727'
const services = [
  { path: '/api/posts', title: 'XC2F content REST API' },
  { path: '/api/graphql', title: 'XC2F content GraphQL API' },
  { path: '/en/moments/feed', title: 'XC2F Moments feed API' },
]

export function GET() {
  const url = (path: string) => new URL(path, getServerSideURL()).href

  return Response.json(
    {
      linkset: services.map(({ path, title }) => ({
        anchor: url(path),
        'service-desc': [{ href: url('/api-openapi.json'), type: 'application/json', title }],
        'service-doc': [{ href: url('/api-reference.txt'), type: 'text/plain', title }],
        status: [{ href: url('/api/health'), type: 'application/json' }],
      })),
    },
    { headers: { 'Content-Type': `application/linkset+json; profile="${profile}"` } },
  )
}
