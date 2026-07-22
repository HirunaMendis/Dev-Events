import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize(credentials) {
        const validUsername = process.env.ADMIN_USERNAME ?? "admin";
        const validPassword = process.env.ADMIN_PASSWORD ?? "admin123";

        if (
          credentials.username === validUsername &&
          credentials.password === validPassword
        ) {
          return {
            id: "admin-1",
            name: "Admin",
            email: "hirunamendis@gmail.com",
          };
        }
        // Return null = wrong credentials
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session }) {
      return session;
    },
  },
});
