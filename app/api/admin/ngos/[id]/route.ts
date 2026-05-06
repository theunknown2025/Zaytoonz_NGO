import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DELETABLE_USER_TYPES = new Set(['NGO', 'admin_ngo', 'assistant_ngo']);

function getAdminSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    throw new Error('Supabase credentials are not configured');
  }

  return createClient(supabaseUrl, serviceKey || anonKey);
}

/**
 * Permanently remove an NGO organization: deletes the underlying `users` row.
 * `ngo_profile` and related rows cascade per database FKs.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ error: 'NGO ID is required' }, { status: 400 });
    }

    const supabase = getAdminSupabase();

    const { data: profile, error: profileError } = await supabase
      .from('ngo_profile')
      .select('id, user_id')
      .eq('id', id)
      .maybeSingle();

    if (profileError) {
      console.error('Delete NGO — profile lookup:', profileError);
      return NextResponse.json({ error: 'Failed to look up NGO' }, { status: 500 });
    }

    if (!profile?.user_id) {
      return NextResponse.json({ error: 'NGO not found' }, { status: 404 });
    }

    const { data: userRow, error: userFetchError } = await supabase
      .from('users')
      .select('id, user_type')
      .eq('id', profile.user_id)
      .maybeSingle();

    if (userFetchError) {
      console.error('Delete NGO — user lookup:', userFetchError);
      return NextResponse.json({ error: 'Failed to verify account' }, { status: 500 });
    }

    if (!userRow) {
      return NextResponse.json(
        { error: 'Linked user account not found; profile may be orphaned. Remove the profile manually in the database if needed.' },
        { status: 409 }
      );
    }

    if (!DELETABLE_USER_TYPES.has(userRow.user_type)) {
      return NextResponse.json(
        { error: 'Only NGO-type accounts (NGO, admin_ngo, assistant_ngo) can be deleted from this screen.' },
        { status: 403 }
      );
    }

    const { error: deleteError } = await supabase.from('users').delete().eq('id', profile.user_id);

    if (deleteError) {
      console.error('Delete NGO — user delete:', deleteError);
      return NextResponse.json(
        {
          error:
            deleteError.message ||
            'Could not delete account. Another table may still reference this user (check Supabase logs / FKs).',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'NGO account deleted' });
  } catch (e) {
    console.error('DELETE /api/admin/ngos/[id]:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
