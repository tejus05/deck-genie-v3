#!/usr/bin/env python3

import zipfile
import sys
from xml.etree import ElementTree as ET

def analyze_pptx(file_path):
    """Analyze a PPTX file to check if it contains real text or just images"""
    
    print(f"Analyzing PPTX file: {file_path}")
    
    try:
        with zipfile.ZipFile(file_path, 'r') as pptx_zip:
            # List all files in the PPTX
            file_list = pptx_zip.namelist()
            
            # Count media files (images)
            image_files = [f for f in file_list if f.startswith('ppt/media/')]
            print(f"Number of image files: {len(image_files)}")
            
            # Analyze slides for text content
            slide_files = [f for f in file_list if f.startswith('ppt/slides/slide') and f.endswith('.xml')]
            print(f"Number of slides: {len(slide_files)}")
            
            text_elements = 0
            picture_elements = 0
            
            for slide_file in slide_files:
                try:
                    slide_content = pptx_zip.read(slide_file)
                    root = ET.fromstring(slide_content)
                    
                    # Define namespace
                    namespaces = {
                        'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
                        'p': 'http://schemas.openxmlformats.org/presentationml/2006/main'
                    }
                    
                    # Count text elements
                    text_runs = root.findall('.//a:t', namespaces)
                    text_elements += len(text_runs)
                    
                    # Count picture elements
                    pics = root.findall('.//p:pic', namespaces)
                    picture_elements += len(pics)
                    
                    print(f"Slide {slide_file}: {len(text_runs)} text elements, {len(pics)} pictures")
                    
                    # Show some text content
                    for i, text_run in enumerate(text_runs[:3]):  # Show first 3 text elements
                        if text_run.text and text_run.text.strip():
                            print(f"  Text sample {i+1}: '{text_run.text[:50]}...'")
                    
                except Exception as e:
                    print(f"Error analyzing {slide_file}: {e}")
            
            print(f"\nSummary:")
            print(f"Total text elements: {text_elements}")
            print(f"Total picture elements: {picture_elements}")
            
            if text_elements > 0:
                print("✅ PPTX contains editable text elements")
            else:
                print("❌ PPTX appears to be screenshot-based (no text elements found)")
                
    except Exception as e:
        print(f"Error analyzing PPTX: {e}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python analyze_pptx.py <path_to_pptx_file>")
        sys.exit(1)
    
    analyze_pptx(sys.argv[1])
