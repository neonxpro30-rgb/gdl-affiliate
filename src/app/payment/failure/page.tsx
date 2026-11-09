import Link from "next/link";

// Landing page for failed / rejected PayU callbacks. Before this page
// existed, /payment/failure fell through to /payment/[orderId] with
// orderId = "failure" and showed a 404.
const MESSAGES: Record<string, string> = {
    TransactionFailed: "The payment didn't go through. No money was taken — or if it was, it is automatically returned by your bank.",
    AmountMismatch: "The amount paid didn't match your order, so we couldn't confirm it. Please contact support with your payment details.",
    InvalidHash: "We couldn't verify this payment response. Please contact support if money was deducted.",
    OrderNotFound: "We couldn't find the order for this payment. Please contact support if money was deducted.",
    ServerError: "Something went wrong on our side while confirming your payment. Please contact support if money was deducted.",
};

export default async function PaymentFailurePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
    const { error } = await searchParams;
    const message = MESSAGES[error || ''] || MESSAGES.TransactionFailed;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Payment not completed</h1>
                <p className="mb-6 text-gray-600">{message}</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/dashboard/courses" className="bg-[#732C3F] text-white px-6 py-2 rounded-lg hover:bg-[#5a2231]">
                        Try again
                    </Link>
                    <Link href="/company/contact" className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50">
                        Contact support
                    </Link>
                </div>
            </div>
        </div>
    );
}
