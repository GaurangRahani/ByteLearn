const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/temp') //Files temporarily stay here before Cloudinary
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } //100MB limit per file
});

module.exports = upload;
