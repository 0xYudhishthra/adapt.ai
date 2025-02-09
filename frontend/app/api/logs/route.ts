import { NextResponse } from "next/server";

const API_CONFIG = {
  url: "https://wizard-bff-rpc.alt.technology/v1/bff/aaa/app/logs/aae1f85d-b866-469e-94f4-24d5befe852a",
  token:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMTE5MTAxMjE2Mjk0NzM4MjI3MzQiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jS1l4ZXBaeHY2Zm5TVnZYT1ZVMV94eG5DdzAyQ0hrbVE0TWJ4YnJLajNzNDBpQWlPcWw9czk2LWMiLCJlbWFpbCI6Inl1ZGhpc2h0aHJhLm1AZ21haWwuY29tIiwibmFtZSI6Ill1ZGhpc2h0aHJhIFN1Z3VtYXJhbiIsIm9yZ19uYW1lIjoiTHVjYTMiLCJvcmdfaWQiOjMzMywicGVybWlzc2lvbnMiOlsid3JpdGU6b3JnX2RlcGxveW1lbnRzIiwid3JpdGU6b3JnX3N1YnNjcmlwdGlvbnMiLCJ3cml0ZTpvcmdfdXNlcnMiXSwiaWF0IjoxNzM5MTA5NjA0LCJleHAiOjE3NDE3MDE2MDR9.t0XrCBcj6UKj0SiHoxN0evJ9-4TGDmsTgiVgkkM7iCQ",
};

export async function GET() {
  try {
    const response = await fetch(API_CONFIG.url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${API_CONFIG.token}`,
        "Content-Type": "application/json",
        "Origin": "http://localhost:3000",
      },
    });

    if (!response.ok) {
      console.error('API Response Error:', {
        status: response.status,
        statusText: response.statusText,
      });
      
      // Try to get error details from response
      const errorText = await response.text();
      console.error('Error details:', errorText);

      return NextResponse.json(
        { error: `API request failed: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('API Response:', data);
    return NextResponse.json({ log: data.log || [] });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch log", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
