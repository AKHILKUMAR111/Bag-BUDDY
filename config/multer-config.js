const multer = require('multer');   


const storage = multer.memoryStorage();  //storing image in memory
const upload = multer({ storage: storage });

module.exports = upload;