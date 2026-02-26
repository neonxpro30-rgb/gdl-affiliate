import { notFound } from "next/navigation";
import PaymentButtons from "./PaymentButtons";
import { db } from "@/lib/firebaseAdmin";

export default async function PaymentPage({ params }: { params: Promise<{ orderId: string }> }) {
    const { orderId } = await params;

    const orderDoc = await db.collection('orders').doc(orderId).get();

    if (!orderDoc.exists) return notFound();

    const order = { id: orderDoc.id, ...orderDoc.data() } as any;

    // Fetch Package
    const packageDoc = await db.collection('packages').doc(order.packageId).get();
    const pkg = packageDoc.exists ? packageDoc.data() : { name: 'Unknown Package' };

    // Fetch User
    const userDoc = await db.collection('users').doc(order.userId).get();
    const user = userDoc.exists ? userDoc.data() : { email: 'unknown' };

    if (order.status === 'SUCCESS') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-green-50">
                <div className="text-center p-8 bg-white rounded-xl shadow-lg">
                    <h1 className="text-3xl font-bold text-green-600 mb-4">Payment Successful!</h1>
                    <p className="mb-6">You have successfully purchased the {pkg?.name} package.</p>
                    <a href="/dashboard" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Go to Dashboard</a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg">
                <h1 className="text-2xl font-bold mb-6 text-center">Complete Your Purchase</h1>

                <div className="border-b pb-4 mb-4">
                    <p className="text-gray-600">Package:</p>
                    <p className="text-xl font-semibold">{pkg?.name}</p>
                </div>

                <div className="border-b pb-4 mb-6">
                    <p className="text-gray-600">Amount to Pay:</p>
                    <p className="text-3xl font-bold text-blue-600">₹{order.amount}</p>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg mb-6 text-sm text-yellow-800 border border-yellow-200">
                    <p><strong>Test Mode:</strong> Use the buttons below to simulate payment.</p>
                </div>

                <PaymentButtons
                    orderId={order.id}
                    amount={order.amount}
                    userEmail={user?.email}
                    userName={user?.name || 'User'}
                    productInfo={pkg?.name || 'Course Package'}
                />
            </div>
        </div>
    );
}
