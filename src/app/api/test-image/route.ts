import { NextResponse } from 'next/server';

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0";

export async function GET() {
  try {
    if (!HUGGINGFACE_API_KEY) {
      return NextResponse.json(
        { error: 'Hugging Face API key is missing' },
        { status: 500 }
      );
    }

    // Test with a simple prompt
    const prompt = "A realistic photo of a box of donated food items, high quality, detailed";

    console.log('Testing image generation with prompt:', prompt);
    console.log('Using API key:', HUGGINGFACE_API_KEY.substring(0, 5) + '...');

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          width: 512,
          height: 512,
          num_inference_steps: 50,
          guidance_scale: 7.5,
        }
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Hugging Face API error:', error);
      return NextResponse.json(
        { error: 'Failed to generate image', details: error },
        { status: 500 }
      );
    }

    // Convert the response to base64
    const imageBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    const imageUrl = `data:image/png;base64,${base64Image}`;

    return NextResponse.json({ 
      success: true,
      imageUrl,
      apiKeyStatus: 'valid'
    });
  } catch (error: any) {
    console.error('Error in test endpoint:', error.message);
    return NextResponse.json(
      { 
        error: 'Failed to generate image',
        details: error.message,
        apiKeyStatus: 'error'
      },
      { status: 500 }
    );
  }
} 