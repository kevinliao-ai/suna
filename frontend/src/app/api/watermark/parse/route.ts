import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route: POST /api/watermark/parse
 * 
 * 解析 Sora 视频链接，获取无水印视频下载地址
 * 
 * Request Body:
 * {
 *   "videoUrl": "https://sora.com/share/xxx"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "links": {
 *       "mp4": "https://...",
 *       "thumbnail": "https://...",
 *       "post_id": "xxx"
 *     }
 *   }
 * }
 */

export async function POST(request: NextRequest) {
  try {
    // 1. 解析请求体
    const body = await request.json();
    const { videoUrl } = body;

    // 2. 验证输入
    if (!videoUrl || typeof videoUrl !== 'string') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid video URL',
          message: 'Please provide a valid video link'
        },
        { status: 400 }
      );
    }

    // 验证 URL 格式
    try {
      new URL(videoUrl);
    } catch {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid URL format',
          message: 'Link format is incorrect, please check and try again'
        },
        { status: 400 }
      );
    }

    // 3. 调用第三方 API
    const apiUrl = `https://api.dyysy.com/links/${encodeURIComponent(videoUrl)}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
      // 设置超时（30秒）
      signal: AbortSignal.timeout(30000),
    });

    // 4. 检查响应状态
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);

      if (response.status === 404) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Video not found',
            message: 'Unable to find this video, please check if the link is correct'
          },
          { status: 404 }
        );
      }

      if (response.status === 429) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Rate limit exceeded',
            message: 'Too many requests, please try again later'
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { 
          success: false, 
          error: 'API request failed',
          message: 'Parsing failed, please try again later'
        },
        { status: 500 }
      );
    }

    // 5. 解析响应数据
    const data = await response.json();

    // 验证返回数据结构
    if (!data || !data.links || !data.links.mp4) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid response data',
          message: 'Parsing result is abnormal, please try again or change the link'
        },
        { status: 500 }
      );
    }

    // 6. 返回成功响应
    return NextResponse.json({
      success: true,
      data: {
        links: {
          mp4: data.links.mp4,
          thumbnail: data.links.thumbnail || '',
          post_id: data.links.post_id || '',
        },
        metadata: {
          parsedAt: new Date().toISOString(),
        }
      }
    });

  } catch (error: any) {
    console.error('Watermark removal error:', error);

    // 超时错误
    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Request timeout',
          message: 'Request timed out, please check your network and try again'
        },
        { status: 504 }
      );
    }

    // 网络错误
    if (error.cause?.code === 'ENOTFOUND' || error.cause?.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Network error',
          message: 'Network connection failed, please check your network settings'
        },
        { status: 503 }
      );
    }

    // 其他错误
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: 'Service temporarily unavailable, please try again later'
      },
      { status: 500 }
    );
  }
}

// 支持 CORS（如果需要）
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
