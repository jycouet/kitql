// Cannot do it in handleProxies.d.ts as it will be generated with more stuff
export type proxyDefinition = { from: string; to: string };
export type handleProxiesOptions = { proxies: proxyDefinition[] };
