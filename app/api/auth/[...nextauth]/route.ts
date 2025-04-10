import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectToDatabase from "@/lib/mongodb";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";
import User from "@/lib/models/User";

// Define custom types to extend the default next-auth types
declare module "next-auth" {
  interface User {
    id: string;
    name: string;
    email: string;
    role: string;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          // Connect to the database
          await connectToDatabase();

          // Find the user by email
          const user = await User.findOne({ email: credentials.email });

          // If user doesn't exist or password doesn't match
          if (!user || !(await user.comparePassword(credentials.password))) {
            throw new Error("Invalid email or password");
          }

          // Return user data (without password)
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name || '',
            role: user.role,
          };
        } catch (error) {
          // Log the error but don't expose details to client
          console.error("Authentication error:", error);
          throw new Error(error instanceof Error ? error.message : "Authentication failed");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session: updateSession }) {
      console.log('[NextAuth JWT Callback] Start');
      console.log('[NextAuth JWT Callback] Trigger:', trigger);
      console.log('[NextAuth JWT Callback] Input Token:', JSON.stringify(token, null, 2));
      console.log('[NextAuth JWT Callback] Input User:', JSON.stringify(user, null, 2));
      console.log('[NextAuth JWT Callback] Input Update Session:', JSON.stringify(updateSession, null, 2));

      // Add user ID and role to JWT token if available during sign in
      if (user) {
        console.log('[NextAuth JWT Callback] Adding user info to token:', user.id, user.role);
        token.id = user.id;
        token.role = user.role; // Ensure role is added here
      } else if (token.id && trigger !== 'update') {
        // Refresh user role from database if not an explicit update
        try {
          // Only fetch the latest user data if in production
          // This ensures any role changes in the database are reflected in the token
          // if (process.env.NODE_ENV === "production") {
          // For debugging, let's refresh even in dev
          console.log(`[NextAuth JWT Callback] Refreshing user data for token ID: ${token.id}`);
            await connectToDatabase();
            const latestUser = await User.findById(token.id);
            
            if (latestUser) {
              console.log('[NextAuth JWT Callback] Refreshed user data:', JSON.stringify(latestUser, null, 2));
              // Update the token with latest role
              token.role = latestUser.role;
            } else {
              console.warn(`[NextAuth JWT Callback] Could not find user with ID ${token.id} for refresh.`);
            }
          // }
        } catch (error) {
          // Just log the error, but continue with existing token data
          // This prevents authentication failures due to DB connectivity issues
          console.error("[NextAuth JWT Callback] Error refreshing user role:", error);
        }
      } else if (trigger === 'update' && updateSession?.role) {
        // Handle explicit session updates (e.g., role change)
        console.log('[NextAuth JWT Callback] Updating token role via trigger:', updateSession.role);
        token.role = updateSession.role;
      }
      
      console.log('[NextAuth JWT Callback] Output Token:', JSON.stringify(token, null, 2));
      return token;
    },
    async session({ session, token }): Promise<Session> {
      console.log('[NextAuth Session Callback] Start');
      console.log('[NextAuth Session Callback] Input Session:', JSON.stringify(session, null, 2));
      console.log('[NextAuth Session Callback] Input Token:', JSON.stringify(token, null, 2));

      // Make sure role is explicitly transferred from token to session
      if (token) {
        session.user = {
          ...session.user,
          id: token.id as string,
          role: token.role as string
        };
      }

      console.log('[NextAuth Session Callback] Constructed session.user:', JSON.stringify(session.user, null, 2));
      console.log('[NextAuth Session Callback] Final Output Session:', JSON.stringify(session, null, 2));
      
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development", // Only enable debug in development
  useSecureCookies: process.env.NODE_ENV === "production",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
export { authOptions }; 