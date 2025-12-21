# 🤖 Morchid AI Integration with NLWeb

## Overview

Morchid is now an intelligent AI career assistant integrated with NLWeb (Natural Language Web) capabilities. It provides conversational AI-powered responses for job seekers, helping them navigate opportunities, analyze CVs, and get career guidance.

## ✨ Features

### 🎯 **Intelligent Career Assistance**
- **Job Search Guidance**: Help users find relevant opportunities
- **CV Review & Optimization**: Provide feedback on resumes and CVs
- **Career Advice**: Offer guidance on career development
- **Interview Preparation**: Share tips and strategies
- **Skills Development**: Recommend training and learning paths
- **Application Tracking**: Help manage job applications

### 🔧 **Technical Capabilities**
- **Natural Language Processing**: Understand user queries in plain English
- **Context-Aware Responses**: Remember conversation history
- **Database Integration**: Store conversations for authenticated users
- **Real-time Responses**: Fast, streaming chat interface
- **Multi-modal Support**: Text-based chat with rich formatting

## 🚀 Quick Start

### 1. **Database Setup**
Run the migration to create the conversations table:

```sql
-- Execute this in your Supabase SQL editor
-- File: database/migrations/create_morchid_conversations.sql
```

### 2. **Start the Morchid AI Service** (Optional)
For enhanced AI capabilities:

```bash
cd morchid-ai-service
chmod +x start.sh
./start.sh
```

### 3. **Access Morchid Chat**
1. Navigate to your Zaytoonz NGO application
2. Go to the Seeker section
3. Click on "Morchid AI" in the sidebar
4. Start chatting!

## 🎨 User Interface

### **Chat Features**
- **Modern Design**: Clean, responsive chat interface
- **Real-time Messaging**: Instant responses with typing indicators
- **Quick Actions**: Pre-filled message buttons for common queries
- **Conversation History**: Save and manage chat sessions
- **Mobile Responsive**: Works perfectly on all devices

### **Quick Action Buttons**
- **Remote Jobs**: Find remote software development jobs
- **CV Tips**: Get CV improvement advice
- **Skills Guide**: Learn about in-demand skills
- **Interview Prep**: Prepare for interviews
- **Training**: Find training opportunities
- **Track Apps**: Manage application tracking

## 🔌 API Integration

### **Endpoints**

#### **POST /api/morchid**
Process user messages and return AI responses.

**Request:**
```json
{
  "message": "Help me find remote jobs",
  "userId": "user-uuid",
  "conversationId": "conversation-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "response": "I can help you find job opportunities!...",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### **GET /api/morchid?userId={userId}**
Fetch user's conversation history.

**Response:**
```json
{
  "conversations": [
    {
      "id": "conv-uuid",
      "user_id": "user-uuid",
      "user_message": "Help me find jobs",
      "ai_response": "I can help you...",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

## 🧠 AI Capabilities

### **Current Features**
- **Keyword Analysis**: Understand user intent from message content
- **Contextual Responses**: Provide relevant, helpful information
- **Career-Focused**: Specialized in job search and career development
- **Multi-language Support**: Can handle various query formats

### **Future Enhancements** (with NLWeb)
- **Advanced NLP**: More sophisticated language understanding
- **Personalized Responses**: Tailored advice based on user profile
- **Multi-source Data**: Integrate with job boards and career resources
- **Predictive Analytics**: Suggest opportunities based on user behavior

## 📊 Database Schema

### **morchid_conversations Table**
```sql
CREATE TABLE morchid_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    conversation_context JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🔧 Configuration

### **Environment Variables**
```env
# Required for database integration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# Optional: Morchid AI Service
MORCHID_AI_SERVICE_URL=http://localhost:8001
```

### **NLWeb Integration** (Advanced)
To enable full NLWeb capabilities:

1. **Install NLWeb Dependencies**:
   ```bash
   cd NLWeb-main
   pip install -r code/python/requirements.txt
   ```

2. **Configure NLWeb**:
   - Set up vector database (Azure Search, Qdrant, etc.)
   - Configure LLM providers (OpenAI, Claude, etc.)
   - Set up embedding services

3. **Enable Advanced Features**:
   - Update `morchid-ai-service/app.py` to use NLWeb components
   - Configure data sources and retrieval systems

## 🎯 Use Cases

### **For Job Seekers**
1. **"I want to find remote software development jobs in Morocco"**
   - Get specific job search guidance
   - Learn about remote work opportunities
   - Understand local tech scene

2. **"How can I improve my CV for NGO positions?"**
   - Receive CV optimization tips
   - Get NGO-specific advice
   - Learn about required skills

3. **"What skills are in demand for NGO work?"**
   - Discover trending skills
   - Get skill development recommendations
   - Find relevant training programs

### **For Career Development**
1. **"How should I prepare for an NGO interview?"**
   - Get interview preparation tips
   - Learn about NGO interview questions
   - Understand NGO culture

2. **"What training opportunities are available?"**
   - Find relevant courses and certifications
   - Get personalized recommendations
   - Learn about skill development paths

## 🔒 Security & Privacy

### **Data Protection**
- **Row Level Security**: Users can only access their own conversations
- **Encrypted Storage**: All data stored securely in Supabase
- **No Data Sharing**: Conversations are private and not shared

### **Authentication**
- **User Authentication**: Integrated with existing auth system
- **Session Management**: Secure conversation tracking
- **Access Control**: Proper permissions and policies

## 🚀 Deployment

### **Local Development**
```bash
# Start Next.js app
npm run dev

# Start Morchid AI Service (optional)
cd morchid-ai-service
./start.sh
```

### **Production Deployment**
1. **Deploy Next.js App**: Deploy to Vercel, Netlify, or your preferred platform
2. **Deploy Morchid AI Service**: Deploy Python service to your cloud provider
3. **Configure Environment**: Set up production environment variables
4. **Database Setup**: Ensure Supabase is properly configured

## 🔍 Monitoring & Analytics

### **Conversation Analytics**
- Track user engagement
- Monitor popular queries
- Analyze response effectiveness
- Identify improvement opportunities

### **Performance Metrics**
- Response time monitoring
- Error rate tracking
- User satisfaction metrics
- System health monitoring

## 🤝 Contributing

### **Adding New Features**
1. **Extend Response Templates**: Add new career guidance categories
2. **Enhance AI Logic**: Improve message analysis and response generation
3. **Add New Quick Actions**: Create new pre-filled message buttons
4. **Integrate External APIs**: Connect with job boards or career services

### **Customization**
- **Branding**: Customize colors, logos, and styling
- **Responses**: Modify AI response templates
- **Features**: Add new capabilities and integrations
- **UI/UX**: Enhance the chat interface

## 📞 Support

For questions or issues:
- **Technical Issues**: Check the console logs and API responses
- **Feature Requests**: Submit through your project management system
- **Documentation**: Refer to this guide and inline code comments

---

**Morchid AI** - Your intelligent career companion powered by NLWeb! 🚀
