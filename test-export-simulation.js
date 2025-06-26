// This test simulates exactly what the frontend export button does
async function simulateExportButtonClick() {
  const presentation_id = '0ef2e0f5-d61a-4687-a0ce-69b4c3fd9ec6';
  const currentTheme = 'light';
  const currentColors = {
    slideBg: '#ffffff',
    slideTitle: '#000000', 
    slideHeading: '#000000',
    slideDescription: '#000000',
    slideBox: '#f0f0f0'
  };

  try {
    console.log('🚀 Simulating Export as PPTX button click...');
    console.log('📊 Starting advanced PPTX export with presenton integration');
    
    // Step 1: Extract slide metadata (exactly as frontend does)
    console.log('📡 Calling slide-metadata API...');
    const metadataResponse = await fetch('http://localhost:3000/api/slide-metadata', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: `http://localhost:3000/pdf-maker?id=${presentation_id}`,
        theme: currentTheme || 'light',
        customColors: currentColors
      })
    });

    if (!metadataResponse.ok) {
      throw new Error("Failed to extract slide metadata");
    }

    const { pptx_model } = await metadataResponse.json();
    console.log('✅ Successfully extracted slide metadata for PPTX generation');
    
    // Debug: Log the actual PPTX model structure
    console.log('🔍 PPTX Model Debug:');
    console.log('   Number of slides:', pptx_model.slides.length);
    console.log('   Background color:', pptx_model.background_color);
    console.log('   First slide shapes count:', pptx_model.slides[0]?.shapes?.length || 0);
    
    // Show first few shapes to see what type they are
    if (pptx_model.slides[0]?.shapes?.length > 0) {
      console.log('   First slide shapes preview:');
      pptx_model.slides[0].shapes.slice(0, 3).forEach((shape, i) => {
        const hasText = shape.paragraphs && shape.paragraphs.length > 0;
        const hasPicture = shape.picture !== undefined;
        const hasType = shape.type !== undefined;
        console.log(`     Shape ${i+1}: text=${hasText}, picture=${hasPicture}, type=${hasType}`);
      });
    }

    // Step 2: Send to backend (exactly as frontend does)
    console.log('📡 Sending PPTX model to backend...');
    const backendResponse = await fetch('http://127.0.0.1:8000/ppt/presentation/export_as_pptx', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        presentation_id: presentation_id,
        pptx_model: pptx_model
      })
    });

    if (backendResponse.ok) {
      const { path: pptxPath } = await backendResponse.json();
      console.log('✅ PPTX export completed successfully');
      console.log('📂 File path:', pptxPath);
      
      // Check file size
      const fileName = pptxPath.split('/').pop();
      console.log('📁 File name:', fileName);
      console.log('🔗 Download URL would be:', `http://127.0.0.1:8000/static/${fileName}`);
      
      // Quick analysis of the file
      setTimeout(() => {
        console.log('🔬 File should now exist at:', pptxPath);
        console.log('💡 To verify it contains text elements, run:');
        console.log(`   python analyze_pptx.py "${pptxPath}"`);
      }, 1000);
      
    } else {
      const errorText = await backendResponse.text();
      console.error('❌ Backend export failed:', errorText);
    }

  } catch (err) {
    console.error('❌ Export error:', err);
  }
}

// Also test what the old endpoint would have produced
async function testOldEndpointExists() {
  try {
    const response = await fetch('http://localhost:3000/api/export-as-pptx', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: 'http://localhost:3000/pdf-maker?id=test',
        title: 'test'
      })
    });
    console.log('⚠️  OLD ENDPOINT STILL EXISTS!', response.status);
  } catch (e) {
    console.log('✅ Old export endpoint deleted/not accessible');
  }
}

console.log('🧪 Running export simulation tests...');
testOldEndpointExists();
simulateExportButtonClick();
