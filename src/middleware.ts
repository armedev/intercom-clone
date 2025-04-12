/**
 * Pros: All the functionality works
 * cons: Its not reliable
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const TARGET_WEBSITE = "https://www.intercom.com";
const HTML_CONTENT_TYPES = ["text/html", "application/xhtml+xml"];

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  try {
    const target = new URL(pathname + search, TARGET_WEBSITE);
    const targetHostname = target.hostname;
    const headers = new Headers();

    req.headers.forEach((value, key) => {
      if (
        !["host", "connection", "content-length"].includes(key.toLowerCase())
      ) {
        headers.set(key, value);
      }
    });
    headers.set("host", targetHostname);

    const requestInit: RequestInit = {
      method: req.method,
      headers,
      redirect: "follow",
    };

    if (req.method !== "GET" && req.method !== "HEAD") {
      const reqClone = req.clone();
      requestInit.body = await reqClone.arrayBuffer();
    }

    const response = await fetch(target.toString(), requestInit);

    const responseHeaders = new Headers();

    response.headers.forEach((value, key) => {
      if (
        ![
          "content-encoding",
          "content-security-policy",
          "content-length",
          "connection",
        ].includes(key.toLowerCase())
      ) {
        responseHeaders.set(key, value);
      }
    });
    const contentType = response.headers.get("content-type") || "";

    if (HTML_CONTENT_TYPES.some((type) => contentType.includes(type))) {
      const originalText = await response.text();
      return new NextResponse(originalText, {
        status: response.status,
        headers: responseHeaders,
      });
    }

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new NextResponse(
      `<html><body><h1>Error Loading Content</h1><p>Something went wrong!!</p></body></html>`,
      {
        status: 500,
        headers: { "Content-Type": "text/html" },
      },
    );
  }
}

export const config = {
  matcher: ["/((?!robots.txt).*)"],
};
