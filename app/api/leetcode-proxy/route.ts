import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const offset = searchParams.get('offset') || '0'
    const limit = searchParams.get('limit') || '20'
    
    // Get authentication headers from the request
    const csrfToken = request.headers.get('x-csrf-token')
    const sessionCookie = request.headers.get('x-session-cookie')
    
    if (!csrfToken || !sessionCookie) {
      return NextResponse.json(
        { error: 'Missing authentication headers' },
        { status: 401 }
      )
    }
    
    // Build the LeetCode API URL
    const leetcodeUrl = `https://leetcode.com/api/submissions/?offset=${offset}&limit=${limit}`
    
    // Forward the request to LeetCode with proper headers
    const response = await fetch(leetcodeUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com/',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'X-CSRFToken': csrfToken,
        'Cookie': `csrftoken=${csrfToken}; ${sessionCookie}`
      }
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('LeetCode API error:', response.status, errorText)
      
      return NextResponse.json(
        { 
          error: `LeetCode API error: ${response.status} ${response.statusText}`,
          details: errorText
        },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    
    // Return the data with CORS headers
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, x-csrf-token, x-session-cookie',
      }
    })
    
  } catch (error) {
    console.error('Proxy error:', error)
    
    return NextResponse.json(
      { 
        error: 'Proxy server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-csrf-token, x-session-cookie',
    },
  })
} 