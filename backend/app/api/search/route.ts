import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, maxResults, includeDomains, excludeDomains } = body;

    // Forward request to Python AI service
    const response = await axios.post(`${AI_SERVICE_URL}/search`, {
      query,
      maxResults,
      includeDomains,
      excludeDomains
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Failed to search web' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}