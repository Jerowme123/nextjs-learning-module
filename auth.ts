import Credentials from 'next-auth/providers/credentials'; //for custom login
import type { User } from '@/app/lib/definitions';
import { authConfig } from './auth.config';
import { sql } from '@vercel/postgres';
import NextAuth from 'next-auth';
import bcrypt from 'bcrypt';
import { z } from 'zod';
 
async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await sql<User>`SELECT * FROM users WHERE email=${email}`;
    return user.rows[0];//Since it returns an array of object, the return statement should be an accessing-array.
  } 
  catch (error)
  {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}
 
export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      //This authorize() method will be responsible for handling the authentication logic. Meaning that if the user enters the correct credentials the it will return
        //the retrieved user object from the database or it will return null. If the authentication is successful then the callback function from the customized authentication++
        //located from the auth.config.ts will be called and redirect the user to the dashboard page of the web application.
      async authorize(credentials) 
      {
        //validating the credentials using the safeParse function from Zod library before processing the authentication.
        const parsedCredentials = z.object({ email: z.string().email(), password: z.string().min(6) }).safeParse(credentials);
        console.log('executing "authorize()" method from auth.ts to validate and authenticate the entered credentials. ');
        if (parsedCredentials.success)
        {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);

          if (!user) return null; //If the user is not existing

          const passwordsMatch = await bcrypt.compare(password, user.password);
          //Required to since ginamit lang naman yung 'email' sa pag retrieve nang user doon sa database.
          
          if (passwordsMatch) return user;
          //Then mako-call yung 'authorize' na callback function sa ...authConfig
        }
        console.log('Invalid credentials');
        return null;
      },
    }),
  ],
});