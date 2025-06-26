async function testCurrentExportFlow() {
  try {
    console.log('Testing current frontend export flow...');
    
    // Step 1: Check if old export endpoint exists
    try {
      const oldExportResponse = await fetch('http://localhost:3000/api/export-as-pptx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'test', title: 'test' })
      });
      console.log('Old export endpoint status:', oldExportResponse.status);
    } catch (e) {
      console.log('Old export endpoint not accessible:', e.message);
    }
    
    // Step 2: Test the slide-metadata endpoint
    const metadataResponse = await fetch('http://localhost:3000/api/slide-metadata', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

    console.log('Slide metadata API status:', metadataResponse.status);
    
    if (metadataResponse.ok) {
      const { pptx_model } = await metadataResponse.json();
      console.log('Got pptx_model with slides count:', pptx_model.slides.length);
      
      // Step 3: Send to backend
      const backendResponse = await fetch('http://127.0.0.1:8000/ppt/presentation/export_as_pptx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          presentation_id: '0ef2e0f5-d61a-4687-a0ce-69b4c3fd9ec6',
          pptx_model: pptx_model
        })
      });

      console.log('Backend export status:', backendResponse.status);
      
      if (backendResponse.ok) {
        const result = await backendResponse.json();
        console.log('✅ New export flow works:', result.path);
        
        // Analyze the generated file
        console.log('Analyzing generated PPTX...');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait a moment
        
      } else {
        const errorText = await backendResponse.text();
        console.error('❌ Backend error:', errorText);
      }
    } else {
      const errorText = await metadataResponse.text();
      console.error('❌ Metadata error:', errorText);
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testCurrentExportFlow();
