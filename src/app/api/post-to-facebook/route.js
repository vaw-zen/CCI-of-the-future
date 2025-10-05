import { NextResponse } from "next/server";

const FB_API_VERSION = process.env.FB_API_VERSION || 'v17.0';
const FB_PAGE_ID = process.env.FB_PAGE_ID;
const FB_PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;

export async function POST(req) {
  try {
    // Check if required environment variables are present
    if (!FB_PAGE_ID || !FB_PAGE_ACCESS_TOKEN) {
      console.error("Missing required environment variables: FB_PAGE_ID or FB_PAGE_ACCESS_TOKEN");
      return NextResponse.json(
        { error: "Missing Facebook configuration. Please check environment variables." },
        { status: 500 }
      );
    }

    // Parse the request body
    let requestBody = {};
    try {
      requestBody = await req.json();
    } catch (parseError) {
      // If no body is provided or invalid JSON, use empty object
      console.log("No valid JSON body provided, using defaults");
    }

    const { caption, imageUrl } = requestBody;

    // Default caption if none provided
    const finalCaption = caption || "✨ Daily tip: Regular sofa cleaning keeps your home fresh and allergy-free!";
    
    // Determine API endpoint and payload based on whether we have an image
    let facebookApiUrl;
    let postData;

    if (imageUrl) {
      // Post with image - use photos endpoint
      facebookApiUrl = `https://graph.facebook.com/${FB_API_VERSION}/${FB_PAGE_ID}/photos`;
      postData = {
        caption: finalCaption,
        url: imageUrl,
        access_token: FB_PAGE_ACCESS_TOKEN,
      };
    } else {
      // Text-only post - use feed endpoint
      facebookApiUrl = `https://graph.facebook.com/${FB_API_VERSION}/${FB_PAGE_ID}/feed`;
      postData = {
        message: finalCaption,
        access_token: FB_PAGE_ACCESS_TOKEN,
      };
    }

    console.log("Posting to Facebook:", { 
      url: facebookApiUrl, 
      caption: finalCaption,
      hasImage: !!imageUrl,
      endpoint: imageUrl ? 'photos' : 'feed'
    });

    // Send POST request to Facebook Graph API
    const response = await fetch(facebookApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      console.error("Facebook API error:", {
        status: response.status,
        statusText: response.statusText,
        response: responseText
      });
      
      let errorMessage = `Facebook API error: ${response.status} ${response.statusText}`;
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        }
      } catch (e) {
        // Keep the default error message
      }
      
      return NextResponse.json(
        { error: errorMessage, details: responseText },
        { status: response.status }
      );
    }

    // Parse successful response
    const data = JSON.parse(responseText);
    
    console.log("Successfully posted to Facebook:", data);

    return NextResponse.json({
      success: true,
      facebook_response: data,
      posted_caption: finalCaption,
      posted_image: imageUrl || null,
    });

  } catch (error) {
    console.error("Post to Facebook error:", error);
    
    return NextResponse.json(
      { 
        error: error.message || "An unexpected error occurred",
        success: false 
      },
      { status: 500 }
    );
  }
}

// Optional: Add GET method for testing/health check
export async function GET() {
  return NextResponse.json({
    message: "Facebook posting API is ready",
    required_env_vars: ["FB_PAGE_ID", "FB_PAGE_ACCESS_TOKEN"],
    env_vars_present: {
      FB_PAGE_ID: !!FB_PAGE_ID,
      FB_PAGE_ACCESS_TOKEN: !!FB_PAGE_ACCESS_TOKEN,
    },
    api_version: FB_API_VERSION
  });
}