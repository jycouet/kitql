export async function GET() {
  return new Response()
}

export function _someMethod() {
  // We should not see this method in the generated ROUTES.ts as it's prefixed with an underscore
}
