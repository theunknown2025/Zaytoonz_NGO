-- Create morchid_conversations table
CREATE TABLE IF NOT EXISTS morchid_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    conversation_context JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_morchid_conversations_user_id ON morchid_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_morchid_conversations_created_at ON morchid_conversations(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE morchid_conversations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their own conversations
CREATE POLICY "Users can view their own conversations" ON morchid_conversations
    FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own conversations
CREATE POLICY "Users can insert their own conversations" ON morchid_conversations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own conversations
CREATE POLICY "Users can update their own conversations" ON morchid_conversations
    FOR UPDATE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_morchid_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_morchid_conversations_updated_at
    BEFORE UPDATE ON morchid_conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_morchid_conversations_updated_at();
