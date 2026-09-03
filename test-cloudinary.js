require('dotenv').config();
const { v2: cloudinary } = require('cloudinary');

console.log("URL chargée :", process.env.CLOUDINARY_URL ? "OK" : "MANQUANTE");

cloudinary.uploader.upload('https://res.cloudinary.com/demo/image/upload/sample.jpg', { folder: 'DevEvent' })
    .then(result => console.log('SUCCÈS:', result.secure_url))
    .catch(err => console.log('ERREUR:', JSON.stringify(err, null, 2)));

