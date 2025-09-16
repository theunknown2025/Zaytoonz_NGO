// Test script for Morchid AI integration
const testMorchidAPI = async () => {
  console.log('🧪 Testing Morchid AI Integration...\n');

  try {
    // Test 1: Basic API call
    console.log('📡 Testing API endpoint...');
    const response = await fetch('http://localhost:3000/api/morchid', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Help me find job opportunities',
        userId: 'test-user-123',
        conversationId: 'test-conversation-456'
      }),
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ API Response Success!');
      console.log('📝 Response:', data.response.substring(0, 100) + '...');
      console.log('⏰ Timestamp:', data.timestamp);
    } else {
      console.log('❌ API Response Failed:', data.error);
    }

  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }

  console.log('\n🎯 Testing different message types...');

  const testMessages = [
    'I want to find remote software development jobs in Morocco',
    'How can I improve my CV for NGO positions?',
    'What skills are in demand for NGO work?',
    'How should I prepare for an NGO interview?',
    'What training opportunities are available?',
    'How can I track my job applications effectively?'
  ];

  for (const message of testMessages) {
    try {
      const response = await fetch('http://localhost:3000/api/morchid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          userId: 'test-user-123',
          conversationId: 'test-conversation-456'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ "${message.substring(0, 30)}..." - Success`);
      } else {
        console.log(`❌ "${message.substring(0, 30)}..." - Failed: ${data.error}`);
      }
    } catch (error) {
      console.log(`❌ "${message.substring(0, 30)}..." - Error: ${error.message}`);
    }
  }

  console.log('\n🎉 Morchid AI Integration Test Complete!');
};

// Run the test
testMorchidAPI();
