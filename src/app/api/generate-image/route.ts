import { NextResponse } from 'next/server';

const EDEN_AI_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMDI2MDA2NmQtMmQzMS00ZWRhLWIwY2UtNmFiYmEyODgyZmFkIiwidHlwZSI6ImFwaV90b2tlbiJ9.SaNmv50QY3MN2mh9LHiPBmM3bf_KSDMPoI_ShWbDRpI";
const API_URL = "https://api.edenai.run/v2/image/generation";

export async function POST(request: Request) {
  try {
    const { title, category } = await request.json();

    if (!title || !category) {
      return NextResponse.json(
        { error: 'Title and category are required' },
        { status: 400 }
      );
    }

    const prompt = `A realistic, clear, donation-related photo of ${title}, under the category of ${category.toLowerCase()}, high quality, detailed`;

    console.log('Generating image with prompt:', prompt);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${EDEN_AI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        providers: "replicate",
        text: prompt,
        resolution: "512x512",
        num_images: 1,
        model: "classic"
      }),
    });

    console.log('Eden AI API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Eden AI API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to generate image', details: errorText },
        { status: 500 }
      );
    }

    const data = await response.json();
    
    // Check if the response contains the expected data structure
    if (!data.replicate || !data.replicate.items || !data.replicate.items[0] || !data.replicate.items[0].image) {
      console.error('Invalid response format:', data);
      return NextResponse.json(
        { error: 'Invalid response format from Eden AI' },
        { status: 500 }
      );
    }

    // Get the base64 image data from the response
    const base64Image = data.replicate.items[0].image;
    
    // Return the base64 data directly
    return NextResponse.json({ imageData: base64Image });
  } catch (error: any) {
    console.error('Error generating image:', error.message);
    return NextResponse.json(
      { error: 'Failed to generate image', details: error.message },
      { status: 500 }
    );
  }
} 