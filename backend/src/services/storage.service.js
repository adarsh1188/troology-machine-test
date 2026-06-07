const fs = require('fs');
const path = require('path');
const env = require('../config/env');

let cloudinary = null;
if (env.storageDriver === 'cloudinary') {
  // eslint-disable-next-line global-require
  cloudinary = require('cloudinary').v2;
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
  });
}

/**
 * Normalise a Multer file into our attachment sub-document.
 * When the cloudinary driver is enabled, the file is uploaded and the
 * local temp copy removed; otherwise the local path is served statically.
 */
async function persistFile(file) {
  if (env.storageDriver === 'cloudinary' && cloudinary) {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'pms/attachments',
      resource_type: 'auto',
    });
    fs.promises.unlink(file.path).catch(() => {});
    return {
      filename: result.original_filename,
      originalName: file.originalname,
      url: result.secure_url,
      mimetype: file.mimetype,
      size: file.size,
      storage: 'cloudinary',
      publicId: result.public_id,
    };
  }

  // Local storage — expose via /uploads static route
  return {
    filename: file.filename,
    originalName: file.originalname,
    url: `/uploads/${file.filename}`,
    mimetype: file.mimetype,
    size: file.size,
    storage: 'local',
  };
}

async function persistFiles(files = []) {
  return Promise.all(files.map(persistFile));
}

async function removeFile(attachment) {
  try {
    if (attachment.storage === 'cloudinary' && cloudinary && attachment.publicId) {
      await cloudinary.uploader.destroy(attachment.publicId);
    } else if (attachment.storage === 'local') {
      const filePath = path.join(__dirname, '..', '..', 'uploads', attachment.filename);
      await fs.promises.unlink(filePath).catch(() => {});
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to remove attachment:', err.message);
  }
}

module.exports = { persistFile, persistFiles, removeFile };
