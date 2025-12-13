import crypto from 'crypto';

const PAYU_KEY = 'bTpGZj';
const PAYU_SALT = 'CLZAqnk88f2mr4Penza7cVQB7S06BF7W';

export const generateHash = (data: any) => {
    const hashString = `${PAYU_KEY}|${data.txnid}|${data.amount}|${data.productinfo}|${data.firstname}|${data.email}|${data.udf1 || ''}|${data.udf2 || ''}|${data.udf3 || ''}|${data.udf4 || ''}|${data.udf5 || ''}||||||${PAYU_SALT}`;
    console.log('Generating Hash String:', hashString);
    return crypto.createHash('sha512').update(hashString).digest('hex');
};

export const verifyHash = (data: any) => {
    const hashString = `${PAYU_SALT}|${data.status}||||||${data.udf5 || ''}|${data.udf4 || ''}|${data.udf3 || ''}|${data.udf2 || ''}|${data.udf1 || ''}|${data.email}|${data.firstname}|${data.productinfo}|${data.amount}|${data.txnid}|${PAYU_KEY}`;
    const calculatedHash = crypto.createHash('sha512').update(hashString).digest('hex');
    return calculatedHash === data.hash;
};
