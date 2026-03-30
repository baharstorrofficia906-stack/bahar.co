import app from "./app";
import { logger } from "./lib/logger";
import { seedFromGitHubIfEmpty } from "./lib/seedFromGitHub";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// Seed database from GitHub backup if this is a fresh deployment
seedFromGitHubIfEmpty().catch((err) => {
  logger.warn({ err }, "[seed] GitHub seed failed — continuing without seed data");
});

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
