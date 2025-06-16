import React from 'react';

interface Props {
  message: string;
}

export const ErrorState: React.FC<Props> = ({ message }) => (
  <div className="w-full flex flex-col items-center justify-center gap-4 py-12">
    <span className="text-rose-600 text-lg font-semibold">⚠️ Data Error</span>
    <pre className="bg-rose-50 text-rose-700 px-4 py-2 rounded-md text-sm">{message}</pre>
    <span className="text-sm text-gray-500">Check Supabase logs & RLS policies.</span>
  </div>
);

export default ErrorState;