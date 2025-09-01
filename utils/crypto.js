const crypto = require('crypto');

const ALG = 'aes-256-gcm';
const KEY = crypto.createHash('sha256').update(process.env.PASSWORD_ENCRYPTION_KEY || 'dev-password-key-change-me').digest();

function encrypt(plaintext) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALG, KEY, iv);
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
}

function decrypt(payload) {
  try {
    const raw = Buffer.from(payload, 'base64');
    const iv = raw.slice(0, 12);
    const tag = raw.slice(12, 28);
    const data = raw.slice(28);
    const decipher = crypto.createDecipheriv(ALG, KEY, iv);
    decipher.setAuthTag(tag);
    const dec = Buffer.concat([decipher.update(data), decipher.final()]);
    return dec.toString('utf8');
  } catch (e) {
    return '';
  }
}

module.exports = { encrypt, decrypt };
