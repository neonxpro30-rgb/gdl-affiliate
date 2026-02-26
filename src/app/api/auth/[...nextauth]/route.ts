import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/firebaseAdmin";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid credentials");
                }

                const usersRef = db.collection('users');
                const snapshot = await usersRef.where('email', '==', credentials.email).limit(1).get();

                if (snapshot.empty) {
                    throw new Error("User not found");
                }

                const userDoc = snapshot.docs[0];
                const user = userDoc.data();
                user.id = userDoc.id; // Add ID to user object

                const isValid = await bcrypt.compare(credentials.password, user.password);

                if (!isValid) {
                    throw new Error("Invalid password");
                }

                // Check if user is active (paid)
                // For legacy users without isActive field, we default to true (or you can choose false to force update)
                // But since we want to block unpaid, and unpaid likely won't have it set to true yet...
                // Actually, let's enforce it. If it's missing, it's treated as false unless it's an old admin/user which we should migrate.
                // For now, let's assume if it's undefined, it's allowed (legacy support) OR strictly block.
                // Given the user request "jabtak payment na ho tabtak uski id data base me save bhi na ho" (which we interpreted as not active),
                // we should strictly check for true.
                // However, to avoid locking out existing valid users who don't have the flag, we might need a migration.
                // But for the specific "unpaid id" issue, those are new users.
                // Let's check: if user.isActive === false, deny.
                if (user.isActive === false) {
                    throw new Error("Account not active. Please complete payment.");
                }

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    referralCode: user.referralCode,
                    photoURL: user.photoURL,
                };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.referralCode = user.referralCode;
                token.photoURL = user.photoURL;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.referralCode = token.referralCode as string;
                session.user.photoURL = token.photoURL as string;
                session.user.image = token.photoURL as string; // Map to standard image property
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
