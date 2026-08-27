import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    // ==========================================
    // EMAIL + PASSWORD LOGIN
    // ==========================================
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: {
          label: "Email",
          type: "text",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        const email = credentials.email.toLowerCase().trim();

        const user = await prisma.user.findUnique({
          where: {
            email,
          },
        });

        if (!user) {
          throw new Error("Invalid credentials");
        }

        // Google-created accounts don't have a password
        if (!user.password) {
          throw new Error("Please sign in using Google");
        }

        const passwordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!passwordValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          mobile: user.mobile,
        };
      },
    }),

    // ==========================================
    // GOOGLE LOGIN
    // ==========================================
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],

  // ==========================================
  // SESSION
  // ==========================================
  session: {
    strategy: "jwt",
  },

  // ==========================================
  // LOGIN PAGE
  // ==========================================
  pages: {
    signIn: "/login",
  },

  // ==========================================
  // CALLBACKS
  // ==========================================
  callbacks: {
    // ------------------------------------------
    // GOOGLE SIGN-IN
    // ------------------------------------------
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) {
          return false;
        }

        const email = user.email.toLowerCase().trim();

        let dbUser = await prisma.user.findUnique({
          where: {
            email,
          },
        });

        // Create account if it doesn't exist
        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: {
              name: user.name || "Google User",
              email,
              password: "",
              role: "USER",
            },
          });
        }

        // Store database user information
        user.id = dbUser.id;
        user.role = dbUser.role;
        user.mobile = dbUser.mobile;
      }

      return true;
    },

    // ------------------------------------------
    // JWT
    // ------------------------------------------
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      // If token doesn't contain user information,
      // retrieve it from database
      if (token.email && (!token.id || !token.role)) {
        const email = token.email.toLowerCase().trim();

        const dbUser = await prisma.user.findUnique({
          where: {
            email,
          },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
        }
      }

      return token;
    },

    // ------------------------------------------
    // SESSION
    // ------------------------------------------
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }

      return session;
    },
  },

  // ==========================================
  // SECRET
  // ==========================================
  secret: process.env.NEXTAUTH_SECRET,
};