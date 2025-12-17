-- ============================================================
-- ENHANCED MORCHID CONVERSATIONS SCHEMA
-- Migration to improve conversation tracking and AI integration
-- ============================================================

-- Add new columns to morchid_conversations if they don't exist
DO $$ 
BEGIN
    -- Add session_id for grouping conversations
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'morchid_conversations' 
                   AND column_name = 'session_id') THEN
        ALTER TABLE morchid_conversations 
        ADD COLUMN session_id UUID;
    END IF;

    -- Add intent column for tracking query types
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'morchid_conversations' 
                   AND column_name = 'intent') THEN
        ALTER TABLE morchid_conversations 
        ADD COLUMN intent VARCHAR(50);
    END IF;

    -- Add llm_model column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'morchid_conversations' 
                   AND column_name = 'llm_model') THEN
        ALTER TABLE morchid_conversations 
        ADD COLUMN llm_model VARCHAR(100);
    END IF;

    -- Add opportunities_count column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'morchid_conversations' 
                   AND column_name = 'opportunities_count') THEN
        ALTER TABLE morchid_conversations 
        ADD COLUMN opportunities_count INTEGER DEFAULT 0;
    END IF;

    -- Add feedback columns for future improvements
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'morchid_conversations' 
                   AND column_name = 'user_rating') THEN
        ALTER TABLE morchid_conversations 
        ADD COLUMN user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'morchid_conversations' 
                   AND column_name = 'user_feedback') THEN
        ALTER TABLE morchid_conversations 
        ADD COLUMN user_feedback TEXT;
    END IF;
END $$;

-- Create index for session-based queries
CREATE INDEX IF NOT EXISTS idx_morchid_conversations_session_id 
ON morchid_conversations(session_id);

-- Create index for intent analysis
CREATE INDEX IF NOT EXISTS idx_morchid_conversations_intent 
ON morchid_conversations(intent);

-- Create composite index for user + date queries
CREATE INDEX IF NOT EXISTS idx_morchid_conversations_user_date 
ON morchid_conversations(user_id, created_at DESC);

-- ============================================================
-- CONVERSATION SESSIONS TABLE
-- For tracking conversation threads
-- ============================================================

CREATE TABLE IF NOT EXISTS morchid_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    summary TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    messages_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for sessions
CREATE INDEX IF NOT EXISTS idx_morchid_sessions_user_id 
ON morchid_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_morchid_sessions_last_activity 
ON morchid_sessions(last_activity_at DESC);

-- Enable RLS on sessions
ALTER TABLE morchid_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for sessions
DO $$ 
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view their own sessions" ON morchid_sessions;
    DROP POLICY IF EXISTS "Users can insert their own sessions" ON morchid_sessions;
    DROP POLICY IF EXISTS "Users can update their own sessions" ON morchid_sessions;
    DROP POLICY IF EXISTS "Users can delete their own sessions" ON morchid_sessions;
END $$;

CREATE POLICY "Users can view their own sessions" ON morchid_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions" ON morchid_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" ON morchid_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions" ON morchid_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- ANALYTICS VIEW
-- For tracking usage patterns
-- ============================================================

CREATE OR REPLACE VIEW morchid_analytics AS
SELECT 
    DATE(created_at) as conversation_date,
    intent,
    COUNT(*) as query_count,
    AVG(opportunities_count) as avg_opportunities_found,
    AVG(user_rating) as avg_rating,
    COUNT(DISTINCT user_id) as unique_users
FROM morchid_conversations
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at), intent
ORDER BY conversation_date DESC;

-- ============================================================
-- FUNCTION: Auto-generate session title
-- ============================================================

CREATE OR REPLACE FUNCTION generate_session_title(first_message TEXT)
RETURNS VARCHAR(255) AS $$
BEGIN
    IF LENGTH(first_message) <= 50 THEN
        RETURN first_message;
    ELSE
        RETURN SUBSTRING(first_message FROM 1 FOR 47) || '...';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TRIGGER: Update session activity
-- ============================================================

CREATE OR REPLACE FUNCTION update_session_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.session_id IS NOT NULL THEN
        UPDATE morchid_sessions 
        SET 
            last_activity_at = NOW(),
            messages_count = messages_count + 1
        WHERE id = NEW.session_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_update_session_activity') THEN
        CREATE TRIGGER trigger_update_session_activity
            AFTER INSERT ON morchid_conversations
            FOR EACH ROW
            EXECUTE FUNCTION update_session_activity();
    END IF;
END $$;

-- ============================================================
-- GRANT PERMISSIONS (if using anon/authenticated roles)
-- ============================================================

-- For public access patterns (adjust as needed)
GRANT SELECT, INSERT ON morchid_conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON morchid_sessions TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

COMMENT ON TABLE morchid_conversations IS 'Stores individual conversation messages with the Morchid AI assistant';
COMMENT ON TABLE morchid_sessions IS 'Tracks conversation sessions/threads for better context management';
COMMENT ON VIEW morchid_analytics IS 'Analytics view for understanding usage patterns over the last 30 days';

