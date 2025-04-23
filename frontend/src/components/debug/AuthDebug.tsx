'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export const AuthDebug: React.FC = () => {
  const [debug, setDebug] = useState<any>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      setDebug({
        session: session ? {
          userId: session.user.id,
          email: session.user.email,
        } : null,
        error
      });
    };
    checkSession();
  }, []);

  return (
    <div className="p-4 bg-gray-100 rounded-md text-sm">
      <h3 className="font-medium mb-2">Auth Debug:</h3>
      <pre className="whitespace-pre-wrap">
        {JSON.stringify(debug, null, 2)}
      </pre>
    </div>
  );
}; 