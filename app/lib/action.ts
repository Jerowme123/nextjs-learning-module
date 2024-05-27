'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { sql } from '@vercel/postgres';
import { AuthError } from 'next-auth';
import { signIn } from '@/auth';
import { z } from 'zod';

//This action.ts consists of actions that are not related to data fetching in database. But it is somehow related to database by++
//updating the details of an existing account, deteting an account, and adding an account to the database.

//This code is used as a guide for entered data into the form. Meaning that the retrieved formData must have the following data.
//It and the 'invalid_type_error' and 'message' serves as validation for the using the safeParse() method.
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({ invalid_type_error: 'Please select a customer.'}),
  amount: z.coerce.number().gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {invalid_type_error: 'Please select an invoice status.'}),
  date: z.string(),
});
 
//This omit({id,data}) means that the expected new added invoice will have 3 properties above excluding the id and date.
//It is because the data from the forms will only have customerId, amount, and status. While the id and date are both auto generated.
const CreateInvoice = FormSchema.omit({ id: true, date: true });

//This line of code is customized data type. Meaning that the variable that will use this will have an object value with this strcuture
//and with their corresponding data type.
//customized data type. 
export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};
//In this function it has a 'prevState' and 'formData' as props, it is becuase this function is being used as a dispatcher function for
//
export async function createInvoice(prevState: State, formData: FormData) {
  //cusomterId, amount and status from the formData props are being fed to the CreateInvoice to validate them and assign ot its corresponding variables.
  //The customerId, amount, and status are the value of the name property of the input elements in the form. EXAMPLE: <input name="amount"> and <input type="radio" name="status">
  const validatedFields = CreateInvoice.safeParse({
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
  });
  //The validatedFields variable will have the values depending if it is success or not.
  //if it is success then it will have the value of {success: false, error:{}} the error key contains the error messages based on the schema
  //else then it will have the value of {success: true, data:{}} and the data key will just have the FormData or the details entered by the user.
  if (!validatedFields.success) {
    //If the 'success' property of variable 'validateFields' is false, the state variable where the 'createInvoice' function is called++
    //Will have an array of errors base such as customerID, amount, and status with their corresponding error message to display.
    //And a generalize message error
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  try{
    await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})`;
  }
  catch(e)
  {
    return{message: "Database Error: Failed to Create Invoice!"};
  }
    
  //The purpose of 'revalidatePath' is the update the cached route segment, meaning that the previous route segment that++
  //Show 15 names in a table will be revalidated to a route segment that will now have 16 names. So that whenever the page reloads
  //or the user visited that route segment again, the web application will just preloads the newly cached route segment.
  revalidatePath('/dashboard/invoices');

  //This is just the concept of navigating or rediwrecting the user to the specified path after some processs
  redirect('/dashboard/invoices');
}

// Use Zod to update the expected types
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
 
  const amountInCents = amount * 100;
 
  try{
    //Updating that specific invoices using the 'UPDATE' command and WHERE clause using the unique ID.
    await sql` UPDATE invoices SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status} WHERE id = ${id}`;
  }
  catch(e)
  {
    return{
      message: 'Database Error: Failed to Update Invoice!'
    }
  }
 
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}
export async function deleteInvoice(id: string) {
  // throw new Error('Failed to Delete Invoice');
  try
  {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
  }
  catch(e)
  {
    return{
      message: 'Database Error: Failed to Delete Invoice!'
    };
  }
}

export async function authenticate( prevState: string | undefined, formData: FormData)
{
  try
  {
    console.log('LOGIN FORM')
    await signIn('credentials', formData);
    //Sending the email and password to the signIn function of NextAuthJS to authenticate the credentials
    // redirect('/dashboard');
  
  }
  catch (error) 
  {
    if (error instanceof AuthError) 
    {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}