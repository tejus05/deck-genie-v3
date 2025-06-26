async function testFullExportFlow() {
  try {
    console.log('Testing frontend export flow...');
    
    // Step 1: Call slide-metadata API like the frontend does
    const metadataResponse = await fetch('http://localhost:3000/api/slide-metadata', {
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

    console.log('Metadata API status:', metadataResponse.status);
    
    if (!metadataResponse.ok) {
      const errorText = await metadataResponse.text();
      console.error('Metadata API error:', errorText);
      return;
    }

    const { pptx_model } = await metadataResponse.json();
    console.log('PPTX model structure keys:', Object.keys(pptx_model));

    // Step 2: Send the PPTX model to backend export endpoint
    const backendResponse = await fetch('http://127.0.0.1:8000/ppt/presentation/export_as_pptx', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        presentation_id: '0ef2e0f5-d61a-4687-a0ce-69b4c3fd9ec6',
        pptx_model: pptx_model
      })
    });

    console.log('Backend export status:', backendResponse.status);
    
    if (backendResponse.ok) {
      const result = await backendResponse.json();
      console.log('Export successful:', result);
    } else {
      const errorText = await backendResponse.text();
      console.error('Backend export error:', errorText);
    }

  } catch (error) {
    console.error('Test error:', error);
  }
}

testFullExportFlow();
