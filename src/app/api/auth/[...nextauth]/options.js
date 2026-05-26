import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions = {
  session: {
    strategy: "jwt",
  },

  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        await connectDB();

        const user = await User.findOne({ email: credentials.email });
        if (!user) throw new Error("Utilisateur introuvable");

        /* 🔒 Vérification compte verrouillé */
        if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
          const minutes = Math.ceil((user.accountLockedUntil - new Date()) / 60000);
          throw new Error(`Compte verrouillé. Réessayez dans ${minutes} min.`);
        }

        /* 🔑 Vérification mot de passe */
        const ok = await bcrypt.compare(credentials.password, user.password);
        if (!ok) {
          user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
          if (user.failedLoginAttempts >= 5) {
            user.accountLockedUntil = new Date(Date.now() + 15 * 60 * 1000);
          }
          await user.save();
          throw new Error("Mot de passe incorrect");
        }

        /* 📧 Vérification email */
        if (!user.emailVerified) {
          throw new Error("Email non vérifié. Consultez votre boîte mail.");
        }

        /* ✅ Connexion réussie */
        user.failedLoginAttempts = 0;
        user.accountLockedUntil = null;
        user.lastLoginAt = new Date();
        user.lastLoginIP = credentials.ip || "unknown";
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
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.emailVerified = user.emailVerified;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      session.user.emailVerified = token.emailVerified;
      return session;
    },
  },

  pages: {
    signIn: "/auth/login",
  },
};