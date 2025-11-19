import { loginAdmin } from "@/app/api/admin/login";
import { AuthOptions, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      type: string;
      name: string;
    } & DefaultSession["user"];
  }
  interface User {
    id: string;
    email: string;
    type: string;
    name: string;
  }
  interface JWT {
    id: string;
    email: string;
    type: string;
    name: string;
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "" },
        type: { label: "Role", type: "text", placeholder: "" },
        token: { label: "JWT", type: "text", placeholder: "" },
      },
      async authorize(credentials) {

        let user;
        if(!credentials) return null;

        if(credentials.type=="ADMIN"){
            user = await loginAdmin(credentials.token);
        }else if(credentials.type=="MEMBER"){
            user = await loginAdmin(credentials.token);
        }else{
            return null;
        }

        if(!user) return null;
        return {
          id: user.id,
          email: user.email,
          type: user.type,
          name: user.name || ""
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 10 * 24 * 60 * 60, // 10 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.type = user.type;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.type = token.type as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
};