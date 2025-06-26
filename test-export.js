// Test script to verify the presenton PPTX export integration
// This will test the slide-metadata extraction and backend export

async function testExport() {
  const testPresentationId = 'test-presentation-123';
  const testUrl = `http://localhost:3000/pdf-maker?id=${testPresentationId}`;
  
  console.log('🚀 Testing presenton PPTX export integration...\n');
  
  try {
    // Step 1: Test slide metadata extraction
    console.log('Step 1: Testing slide metadata extraction...');
    const metadataResponse = await fetch('http://localhost:3000/api/slide-metadata', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: testUrl,
        presentationId: testPresentationId
      })
    });
    
    if (!metadataResponse.ok) {
      console.error('❌ Slide metadata extraction failed:', await metadataResponse.text());
      return;
    }
    
    const { pptxModel } = await metadataResponse.json();
    console.log('✅ Slide metadata extracted successfully');
    console.log('📊 PPTX model structure:', {
      slides: pptxModel.slides?.length || 0,
      background: pptxModel.background_color,
      hasValidStructure: !!pptxModel.slides
    });
    
    // Step 2: Test backend PPTX generation
    console.log('\nStep 2: Testing backend PPTX generation...');
    const backendResponse = await fetch('http://localhost:8000/api/presentation/export_as_pptx', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        presentation_id: testPresentationId,
        pptx_model: pptxModel
      })
    });
    
    if (!backendResponse.ok) {
      console.error('❌ Backend PPTX generation failed:', await backendResponse.text());
      return;
    }
    
    const { path: pptxPath } = await backendResponse.json();
    console.log('✅ Backend PPTX generation successful');
    console.log('📁 Generated file path:', pptxPath);
    
    console.log('\n🎉 Integration test completed successfully!');
    console.log('🔧 The presenton PPTX export system is now fully integrated');
    
  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
    console.log('\n🔍 Common issues to check:');
    console.log('- Frontend server running on http://localhost:3000');
    console.log('- Backend server running on http://localhost:8000');
    console.log('- Test presentation exists with slides to export');
    console.log('- All data attributes are present on slide elements');
  }
}

// Run the test
testExport();
