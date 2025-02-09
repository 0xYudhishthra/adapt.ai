import { NextResponse } from "next/server";

const API_CONFIG = {
  url: "https://wizard-bff-rpc.alt.technology/v1/bff/aaa/app/logs/5de8b94d-4110-4465-9c00-c069c5bf00f7",
  token:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMTE5MTAxMjE2Mjk0NzM4MjI3MzQiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jS1l4ZXBaeHY2Zm5TVnZYT1ZVMV94eG5DdzAyQ0hrbVE0TWJ4YnJLajNzNDBpQWlPcWw9czk2LWMiLCJlbWFpbCI6Inl1ZGhpc2h0aHJhLm1AZ21haWwuY29tIiwibmFtZSI6Ill1ZGhpc2h0aHJhIFN1Z3VtYXJhbiIsIm9yZ19uYW1lIjoiTHVjYTMiLCJvcmdfaWQiOjMzMywicGVybWlzc2lvbnMiOlsid3JpdGU6b3JnX2RlcGxveW1lbnRzIiwid3JpdGU6b3JnX3N1YnNjcmlwdGlvbnMiLCJ3cml0ZTpvcmdfdXNlcnMiXSwiaWF0IjoxNzM5MDgzODI0LCJleHAiOjE3NDE2NzU4MjR9.vahaWfmhcGgLMeshNzsFQO5DX_-F9YJ7oAOefDEjzQM",
};

export async function GET() {
  try {
    const response = await fetch(API_CONFIG.url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${API_CONFIG.token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Authentication failed");
      }
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    if (!data || !Array.isArray(data.logs)) {
      throw new Error("Unexpected data format");
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch logs" },
      { status: 500 }
    );
  }
}
