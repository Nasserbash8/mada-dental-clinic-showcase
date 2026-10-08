/**
 * Database connection helper - redacted in this public sample.
 *
 * The real implementation opens (and caches) one connection per server
 * instance using a connection string that comes from the environment.
 * Nothing about the database is published in this repository.
 */
async function dbConnect(): Promise<void> {
  // connection logic omitted
}

export default dbConnect;
