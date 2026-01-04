import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force runtime execution - don't execute during build
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Lazy initialization of Supabase client to avoid build-time execution
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials are not configured');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

// GET handler - Fetch specific conversation
export async function GET(request: NextRequest) {
  try {
    // Initialize Supabase client at runtime, not build time
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!conversationId || !userId) {
      return NextResponse.json({ 
        error: 'Missing conversation ID or user ID' 
      }, { status: 400 });
    }

    // Fetch conversation messages
    // First try exact match on conversation_id
    let { data: messages, error } = await supabase
      .from('morchid_conversations')
      .select('*')
      .eq('user_id', userId)
      .eq('id', conversationId);

    // If no exact match, try to find messages from the same session/day
    if (!messages || messages.length === 0) {
      // Get the original conversation
      const { data: original } = await supabase
        .from('morchid_conversations')
        .select('created_at')
        .eq('id', conversationId)
        .single();

      if (original) {
        // Get all messages from the same day
        const startOfDay = new Date(original.created_at);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(original.created_at);
        endOfDay.setHours(23, 59, 59, 999);

        const result = await supabase
          .from('morchid_conversations')
          .select('*')
          .eq('user_id', userId)
          .gte('created_at', startOfDay.toISOString())
          .lte('created_at', endOfDay.toISOString())
          .order('created_at', { ascending: true });

        messages = result.data;
        error = result.error;
      }
    }

    if (error) {
      console.error('Error fetching conversation:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch conversation' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      messages: messages || [],
      conversationId 
    });

  } catch (error) {
    console.error('Error in conversation route:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// DELETE handler - Delete conversation
export async function DELETE(request: NextRequest) {
  try {
    // Initialize Supabase client at runtime, not build time
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!conversationId || !userId) {
      return NextResponse.json({ 
        error: 'Missing conversation ID or user ID' 
      }, { status: 400 });
    }

    const { error } = await supabase
      .from('morchid_conversations')
      .delete()
      .eq('id', conversationId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting conversation:', error);
      return NextResponse.json({ 
        error: 'Failed to delete conversation' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Conversation deleted successfully' 
    });

  } catch (error) {
    console.error('Error in delete conversation:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

