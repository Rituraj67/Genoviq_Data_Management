
import app from './app.js';
import { syncDatabase, initModels } from './config/db.js';

const PORT = process.env.PORT || 3000;


const startServer = async () => {
  await initModels();
  await syncDatabase();

  app.listen(3000, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();