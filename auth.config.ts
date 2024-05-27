import type { NextAuthConfig } from 'next-auth';
 
export const authConfig = {
  //By default, users will be navigated to the '/login' route for the signIn process.
  pages: { signIn: '/login'},
  callbacks: {
    //authorized() method is used to check if the users are authorized to access the different routes of the web app. But if they try to++
    //access a different route without signing they will be navigated to the signIn page.
    /*
      The authorized callback is used to verify if the request is authorized to access a page via Next.js Middleware. 
      It is called before a request is completed, and it receives an object with the auth and request properties. 
      The auth property contains the user's session, and the request property contains the incoming request.

      GEMINI: The authorized method is a callback function that gets triggered during Next.js middleware execution. 
      This means it's invoked before a request is completely processed by your application.
      https://gemini.google.com/app/747bff1700b1c6ca
      Keyword: 'In this code this is a customized configuration for nextauthjs'.
    */

    authorized({ auth, request: { nextUrl } })
    {
      console.log('Executing the "authorized" method from callbacks located in auth.config.ts');
      const isLoggedIn = !!auth?.user;
      // console.log(isLoggedIn);
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      if (isOnDashboard) 
      {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }
      else if (isLoggedIn)
      {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
