import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { connectDB } from "@/app/lib/db";
import User from "@/app/models/User";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },

  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        await connectDB();

        const user = await User.findOne({ email: credentials.email });
        if (!user) throw new Error("Utilisateur introuvable");

        if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
          const minutes = Math.ceil((user.accountLockedUntil.getTime() - Date.now()) / 60000);
          throw new Error(`Compte verrouillé. Réessayez dans ${minutes} min.`);
        }

        const ok = await bcrypt.compare(credentials.password as string, user.password);
        if (!ok) {
          user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
          if (user.failedLoginAttempts >= 5) {
            user.accountLockedUntil = new Date(Date.now() + 15 * 60 * 1000);
          }
          await user.save();
          throw new Error("Mot de passe incorrect");
        }

        if (!user.emailVerified) {
          throw new Error("Email non vérifié. Consultez votre boîte mail.");
        }

        user.failedLoginAttempts = 0;
        user.accountLockedUntil = null;
        user.lastLoginAt = new Date();
        await user.save();

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          emailVerified: user.emailVerified,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.emailVerified = (user as any).emailVerified;
      }
      if (trigger === "update" && session?.name) {
        token.name = session.name;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = (token.id ?? token.sub) as string;
      (session.user as any).role = token.role;
      (session.user as any).emailVerified = token.emailVerified;
      return session;
    },
  },

  pages: {
    signIn: "/auth/login",
  },
});
