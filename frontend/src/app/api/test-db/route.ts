import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const { data, error } = await supabase
      .from('unverified_users')
      .select('*')
      .limit(1);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to database' },
      { status: 500 }
    );
  }
} 