import crypto from 'crypto';

// PayU credentials come from env (PAYU_KEY / PAYU_SALT, also accepting the
// PAYU_MERCHANT_* names). The literals below are a LEGACY FALLBACK only —
// the salt was exposed in this public repo's history (audit 2026-11-07,
// critical #2), so it MUST be rotated in the PayU dashboard and the new
// values set in Vercel env; the fallback gets deleted right after rotation.
const PAYU_KEY = process.env.PAYU_KEY || process.env.PAYU_MERCHANT_KEY || 'bTpGZj';
const PAYU_SALT = process.env.PAYU_SALT || process.env.PAYU_MERCHANT_SALT || 'CLZAqnk88f2mr4Penza7cVQB7S06BF7W';

// The merchant key is public (it is posted to PayU from the browser);
// the page must use the SAME key the hash was made with, so it comes
// from here instead of being hard-coded in the client.
export const PAYU_PUBLIC_KEY = PAYU_KEY;

export const generateHash = (data: any) => {
    const hashString = `${PAYU_KEY}|${data.txnid}|${data.amount}|${data.productinfo}|${data.firstname}|${data.email}|${data.udf1 || ''}|${data.udf2 || ''}|${data.udf3 || ''}|${data.udf4 || ''}|${data.udf5 || ''}||||||${PAYU_SALT}`;
    // NEVER log the hash string — it contains the salt (audit #2/#31)
    return crypto.createHash('sha512').update(hashString).digest('hex');
};

export const verifyHash = (data: any) => {
    const hashString = `${PAYU_SALT}|${data.status}||||||${data.udf5 || ''}|${data.udf4 || ''}|${data.udf3 || ''}|${data.udf2 || ''}|${data.udf1 || ''}|${data.email}|${data.firstname}|${data.productinfo}|${data.amount}|${data.txnid}|${PAYU_KEY}`;
    const calculatedHash = crypto.createHash('sha512').update(hashString).digest('hex');
    const received = String(data.hash || '').toLowerCase();
    // Constant-time comparison of the two hex digests.
    return received.length === calculatedHash.length &&
        crypto.timingSafeEqual(Buffer.from(calculatedHash), Buffer.from(received));
};
