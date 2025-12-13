import { NextResponse } from 'next/server';
import { generateHash } from '@/lib/payu';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { txnid, amount, productinfo, firstname, email, udf1, udf2, udf3, udf4, udf5 } = body;

        if (!txnid || !amount || !productinfo || !firstname || !email) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const hash = generateHash({
            txnid,
            amount,
            productinfo,
            firstname,
            email,
            udf1,
            udf2,
            udf3,
            udf4,
            udf5
        });

        return NextResponse.json({ hash });
    } catch (error) {
        console.error('Hash generation error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
