import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

// Promisify the scrypt function
const scryptAsync = promisify(scrypt);

// Helper function to compare passwords
async function comparePasswords(candidatePassword: string, storedPassword: string): Promise<boolean> {
  try {
    // Split the stored password into salt and hash
    const [salt, storedHash] = storedPassword.split(':');
    
    // Hash the candidate password with the same salt
    const derivedKey = await scryptAsync(candidatePassword, salt, 64) as Buffer;
    
    // Compare the hashed candidate password with the stored hash
    const storedHashBuffer = Buffer.from(storedHash, 'hex');
    
    // Use timingSafeEqual to prevent timing attacks
    return timingSafeEqual(derivedKey, storedHashBuffer);
  } catch (error) {
    return false;
  }
}

// Simple in-memory user store (replace with your preferred database solution)
const users = [
  {
    id: "1",
    email: "komo1iddin.pro@gmail.com",
    // This should be a hash in the format "salt:hash" - this is just an example
    password: "salt:hash", // Update this with a properly hashed password
    name: "Admin User",
    role: "admin"
  },
];

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Sign in",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "example@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = users.find((user) => user.email === credentials.email);
        
        if (!user) {
          return null;
        }

        const isPasswordValid = await comparePasswords(credentials.password, user.password);
        
        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        };
      },
    }),
  ],
  callbacks: {
    session: ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          role: token.role // Include role in the session
        },
      };
    },
    jwt: ({ token, user }) => {
      if (user) {
        return {
          ...token,
          id: user.id,
          role: user.role // Include role in the JWT token
        };
      }
      return token;
    },
  },
}; 