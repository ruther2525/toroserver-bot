import NextAuth from "next-auth/next";
import { authHandler } from "./authOptions";


const handler = NextAuth(authHandler);

export { handler as GET, handler as POST}