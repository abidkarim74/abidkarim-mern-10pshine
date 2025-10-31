import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads', 'profiles');
    cb(null, uploadPath);
    },
    
  filename: (req, file, cb) => {
    const userId = (req as any).user?.id || 'unknown';
      
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    
    const fileExtension = path.extname(file.originalname);
    
    cb(null, `profile-${userId}-${uniqueSuffix}${fileExtension}`);
  }
});


const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);

  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed for profile pictures.'));
  }
};

export const profileUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, 
  }
}).single('profileImage'); 


export const deleteProfileImage = (filename: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const fs = require('fs');
    const filePath = path.join(__dirname, '..', 'uploads', 'profiles', filename);
    
    fs.unlink(filePath, (err: any) => {
      if (err) {
        console.error('Error deleting profile image:', err);
        resolve(false);
        
      } else {
        resolve(true);
      }
    });
  });
};