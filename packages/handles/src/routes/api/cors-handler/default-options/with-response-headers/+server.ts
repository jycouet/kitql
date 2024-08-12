import { json } from '@sveltejs/kit'

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: { 'X-Custom-Header': 'custom value', 'Access-Control-Max-Age': '42' },
  })
}

export async function GET() {
  return json({ message: 'Success message' }, { headers: { 'X-Custom-Header': 'custom value' } })
}
