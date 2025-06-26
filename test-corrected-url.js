async function testCorrectedDownloadURL() {
  const presentation_id = '0ef2e0f5-d61a-4687-a0ce-69b4c3fd9ec6';
  
  try {
    console.log('🧪 Testing corrected download URL...');
    
    // Simulate the backend export response
    const mockBackendResponse = {
      path: '/Users/tejuss/Desktop/deck-genie-v3/backend/data/0ef2e0f5-d61a-4687-a0ce-69b4c3fd9ec6/Exploring_the_Concept_of_Genius.pptx'
    };
    
    // Apply the same logic as the frontend
    const fileName = mockBackendResponse.path.split('/').pop();
    const downloadURL = `http://127.0.0.1:8000/static/${presentation_id}/${fileName}`;
    
    console.log('📁 Filename extracted:', fileName);
    console.log('🔗 Download URL:', downloadURL);
    
    // Test if the URL is accessible
    const testResponse = await fetch(downloadURL, { method: 'HEAD' });
    console.log('✅ URL test status:', testResponse.status);
    
    if (testResponse.ok) {
      console.log('🎉 Corrected URL is accessible!');
      console.log('📊 Content-Length:', testResponse.headers.get('content-length'), 'bytes');
    } else {
      console.log('❌ URL not accessible');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testCorrectedDownloadURL();
