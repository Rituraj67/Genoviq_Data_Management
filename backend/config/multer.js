import multer from 'multer';

// Use memory storage to store files in memory (instead of the disk)
const storage = multer.memoryStorage();

// Create multer instance with the memory storage configuration
export const upload = multer({ storage: storage });
