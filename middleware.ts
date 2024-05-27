import { authConfig } from './auth.config';
import NextAuth from 'next-auth';
 

/*
Here you're initializing NextAuth.js with the authConfig object and exporting the auth property. 
You're also using the matcher option from Middleware to specify that it should run on specific paths.
*/
export default NextAuth(authConfig).auth;
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};


/*
NextAuth.JS Summary:
 1. auth.config.ts file is used to create a customized authentication or configuration options using the NextAuthJS.
    - And it uses the signIn built-in method to manage the signup authentication.
 2. middleware.ts file is not initialize the NextAuthJS using the customized authentication to use the 'auth' property.
    - This is responsible for protecting the page or route of your web application for unauthorized user, unless they signin to be authorized.
 3. auth.ts file is used to handle the authentication logic of your web application.
 ADDITIONAL(S):
 - Callbacks such as 'Authorized' method are always called to determine whether the current user is authorized to access the 
    requested route (page) within your Next.js application. Callbacks are also being called whenever their is a request made by the user
    such as reloading the page, navigating or visiting to another route/page of the web application, clicking a button, searching anything on the page.
*/