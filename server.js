import app from './app.js';
import { syncDatabase, initModels } from './config/db.js';
import serverless from 'serverless-http';

const startServer = async () => {
  await initModels();
  await syncDatabase();
};

startServer();

export const handler = serverless(app);
