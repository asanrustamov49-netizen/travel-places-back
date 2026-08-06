import multer, { diskStorage } from "multer";
import path from "path";

const storage = diskStorage({
  destination: (_, __, cb) => {
    cb(null, "src/uploads");
  },
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});
