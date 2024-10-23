import NextAuth, { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { PrismaClient } from "@prisma/client";
import { db } from "@/db";

export const authOptions: NextAuthOptions = {
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID as string,
            clientSecret: process.env.GITHUB_SECRET as string,
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            try {

                if (profile?.email) {

                    const existingUser = await db.user.findUnique({
                        where: { email: profile.email },
                    });

                    if (!existingUser) {
                        await db.user.create({
                            data: {
                                email: profile.email,

                            },
                        });
                    }
                    return true;
                }
                return false;
            } catch (error) {
                console.error("SignIn Error: ", error);
                return false;
            }
        },
        async session({ session, user }) {
            if (user) {
                (session.user as any).id = (user as any).id;
            }
            return session;
        },
    },
};

export default NextAuth(authOptions);
