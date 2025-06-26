async function debugMetadataAPI() {
  try {
    console.log('Debugging metadata API response...');
    
    const response = await fetch('http://localhost:3000/api/slide-metadata', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: `http://localhost:3000/pdf-maker?id=0ef2e0f5-d61a-4687-a0ce-69b4c3fd9ec6`,
        theme: 'light',
        customColors: {
          slideBg: '#ffffff',
          slideTitle: '#000000', 
          slideHeading: '#000000',
          slideDescription: '#000000',
          slideBox: '#f0f0f0'
        }
      })
    });

    console.log('Status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('Full response:', JSON.stringify(result, null, 2));
    } else {
      const errorText = await response.text();
      console.error('Error:', errorText);
    }

  } catch (error) {
    console.error('Test error:', error);
  }
}

debugMetadataAPI();
