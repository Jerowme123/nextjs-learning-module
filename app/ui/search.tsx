'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Query } from '@vercel/postgres';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';


export default function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams(); // Gets current query parameters
  const pathname = usePathname(); // Gets the current route path
  const { replace } = useRouter(); // Function to replace URL parameters
  
  const handleSearch = useDebouncedCallback((term)=>{
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    //'query' is like a variable that holds the search parameter of the URL.
    if (term) {
      params.set('query', term);//Set 'query' parameter with new term
    } else {
      params.delete('query');// Remove 'query' parameter from the URL, para hindi blanko or empty spaces yung query na makukuha nang useSearchParams.
    }
    replace(`${pathname}?${params.toString()}`); //This is responsible for changing or replacing the URL that makes the page.tsx to re-render.
    //The reason for using 'pathname' is to concatinate the current route path and the URL parameter (query).
    //dashboard/invoices?query=jerome
    //The words after the 'invoices' route segment are all the searc parameter of the URL.
    //Pero yung behavior nitong replace() is similar useState, na once na ma-execute hindi immediately nag-rereflect yung changes, after pa nang state update and re-render

    // console.log(searchParams.get('query'));
  }, 300)
  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only"> Search </label>
      <input className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500" placeholder={placeholder}
        onChange={(e)=>{ handleSearch(e.target.value); }}
        defaultValue={searchParams.get('query')?.toString()}
        />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
