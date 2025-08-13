import NextAuth, { AuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"
import { Adapter } from "next-auth/adapters"

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Restrict to @hospital-os.com domain
      if (profile?.email?.endsWith("@hospital-os.com")) {
        return true
      }
      return false
    },
    async session({ session, user }) {
      if (session.user) {
        // Add user ID to session user object
        (session.user as any).id = user.id
      }
      return session
    },
  },
}

export default NextAuth(authOptions)