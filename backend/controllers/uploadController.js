const sharp = require('sharp');
const path = require('path');
const fs = require('fs/promises');


exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Файл не загружен' });
        }

        const originalPath = req.file.path;
        const filename = req.file.filename;
        const filenameWithoutExt = path.parse(filename).name;

        const webpFilename = `${filenameWithoutExt}.webp`;
        const webpPath = path.join(req.file.destination, webpFilename);

        await sharp(originalPath)
            .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 80 })
            .toFile(webpPath);

         await fs.unlink(originalPath)


        const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
        const imageUrl = `${baseUrl}/uploads/${webpFilename}`;
        res.json({ url: imageUrl });
    } catch (error) {
        if (req.file && req.file.path) {
            await fs.unlink(req.file.path).catch(console.error);
        }
        res.status(500).json({ error: error.message });
    }
};