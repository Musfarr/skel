const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /xlsx|xls/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                  file.mimetype === 'application/vnd.ms-excel';
    if (extname && mimetype) return cb(null, true);
    cb('Error: Excel files only!');
  },
  limits: { fileSize: 150 * 1024 * 1024 } // 150MB
});

module.exports = upload;