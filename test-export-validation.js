const testModel = {
  pptx_model: {
    background_color: "ffffff", 
    slides: [
      {
        shapes: [
          {
            position: {
              left: 100,
              top: 50,
              width: 200,
              height: 100
            },
            paragraphs: [
              {
                alignment: 1,
                text: "Test text",
                font: {
                  name: "Inter",
                  size: 16,
                  bold: false,
                  weight: 400,
                  color: "000000"
                }
              }
            ]
          }
        ]
      }
    ]
  },
  presentation_id: "0ef2e0f5-d61a-4687-a0ce-69b4c3fd9ec6"
};

fetch('http://127.0.0.1:8000/ppt/presentation/export_as_pptx', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testModel)
})
.then(response => {
  console.log('Status:', response.status);
  return response.text();
})
.then(data => {
  console.log('Response:', data);
})
.catch(error => {
  console.error('Error:', error);
});
