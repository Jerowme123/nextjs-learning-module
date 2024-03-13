import Pagination from '@/app/ui/invoices/pagination';
import Search from '@/app/ui/search';
import Table from '@/app/ui/invoices/table';
import { CreateInvoice } from '@/app/ui/invoices/buttons';
import { lusitana } from '@/app/ui/fonts';
import { InvoicesTableSkeleton } from '@/app/ui/skeletons';
import { Suspense } from 'react';
import { fetchInvoicesPages } from '@/app/lib/data';

//page.tsx has automatic access to the params and searchParams as its optiona props.
//Meaning that whenever the value of 'params' and 'searchParams' changes, then the that component (who uses the params or searchParams)
//Will will re-rendered and update its UI components base on the new value of its props.
export default async function Page({ searchParams}: { searchParams?: { query?: string; page?: string;};})
{
  //'searchParams' as props are used in a server component, meaning that logic of 'useSearchParams' to change the search paramter of the URL will be done++
  // inside the cleint component, and the server component will just only use it using 'searchParams' as props. 
  const query = searchParams?.query || ''; //Jerome
  const currentPage = Number(searchParams?.page) || 1; 
  const totalPages = await fetchInvoicesPages(query);

  // console.log('CURRENT PAGE: ', currentPage);
  // console.log('TOTAL PAGE: ', totalPages);

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Invoices</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search invoices..." />
        <CreateInvoice />
      </div>
       <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
        <Table query={query} currentPage={currentPage} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
