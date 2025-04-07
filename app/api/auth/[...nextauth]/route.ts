import NextAuth from "next-auth";
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

const handler = NextAuth({
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

        // Connect to the database
        await connectToDatabase();

        // Find the user by email
        const user = await User.findOne({ email: credentials.email });

        // If user doesn't exist or password doesn't match
        if (!user || !(await user.comparePassword(credentials.password))) {
          throw new Error("Invalid email or password");
        }

        // Debug: log the user object from the database to see the role value
        console.log("User from DB during authorize:", {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        });

        // Return user data (without password)
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Add user role to JWT token if available
      if (user) {
        console.log("Setting JWT from user login:", { 
          id: user.id, 
          name: user.name,
          email: user.email,
          role: user.role 
        });
        
        token.id = user.id;
        token.role = user.role;
      } else {
        try {
          // Always fetch the latest user data from the database
          // This ensures any role changes in the database are reflected in the token
          await connectToDatabase();
          const latestUser = await User.findById(token.id);
          
          if (latestUser) {
            // Update the token with latest role
            console.log("Updating token with latest DB role:", {
              id: token.id,
              oldRole: token.role,
              newRole: latestUser.role
            });
            
            token.role = latestUser.role;
          } else {
            console.warn("User not found in DB during token refresh:", token.id);
          }
        } catch (error) {
          console.error("Error fetching user during token refresh:", error);
          // Continue with existing token data
        }
        
        // Debug: log the current token for troubleshooting
        console.log("Using token after potential update:", { 
          id: token.id, 
          email: token.email,
          role: token.role 
        });
      }
      return token;
    },
    async session({ session, token }) {
      // Add role to session
      if (session.user) {
        console.log("Setting session from token:", { 
          id: token.id, 
          role: token.role 
        });
        
        session.user.id = token.id;
        session.user.role = token.role;
      }
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
});

export { handler as GET, handler as POST }; 