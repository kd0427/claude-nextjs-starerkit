import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      /** 환경변수 기반 어드민 자격증명 검증 */
      authorize(credentials) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;

        if (
          email === process.env.ADMIN_EMAIL &&
          password === process.env.ADMIN_PASSWORD
        ) {
          return { id: "1", email, name: "Admin" };
        }
        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    /** JWT에 user id 추가 */
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    /** session에 user id 노출 */
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
