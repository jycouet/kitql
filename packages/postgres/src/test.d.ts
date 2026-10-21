export type TestServer = {
	port: number
	/** Connection url of `db` (default: `postgres`) */
	url: (db?: string) => string
	/** Stops the server and deletes its data (idempotent) */
	stop: () => void
}

/**
 * A throwaway PostgreSQL server for tests: same binaries as `kitql-pg up`, its own temp data dir
 * and free port, no durability (`fsync = off`). Start it once per test run (a vitest
 * `globalSetup`), create a database per worker / file, `stop()` deletes everything.
 */
export function startTestServer(): Promise<TestServer>
