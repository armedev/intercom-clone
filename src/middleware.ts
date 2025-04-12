/*
 * Assignment: https://devrev.notion.site/Web-Engineer-Hiring-Assignment-Website-Replication-Project-94c4031d076f44a59bccc780d78df967
 *
 * whoami?
 *
 * Hi, this is Abdul Hameed,
 *
 * what is this?
 *
 * I saw the task from the console of this page https://devrev.ai/airdrop
 * Even though the task is pretty straightforward, it is pretty easy for me, and given the lack of time I have I think I can impress you guys with my different approach
 * Working on frontend is a lot more than replicating designs, so here I am trying to impress you guys with middleware skills.
 * Things on frontend may look simple to end users, but stitching all the pieces together and making sure it doesn't break on someone's weird machine or browser takes an engineer, not a developer.
 * Although the task was meant to replicate the design of the intercom hompage, but to give you guys the idea how well I know my art I took this apprach to solve the problem, and yes it can also be done with a plain server.
 * The idea here is my nextjs server is acting as a proxy to the intercom server, it has benefits of a proxy server and cons of mantainance, the approach is pretty straightforward but it takes years of experience to get this idea.
 *
 *
 * If you guys like this idea but are unsure if I can really replicate the given assignment, just send me an email/message, will try my hard to squeeze the time and complete the assigned task.
 *
 * Backstory:
 *  I got to know about DevRev through my current organization where I integrated User Experior [plug SDK] to record sessions. I was surfing the site and liked how it was built—fast, usable, and good-looking.
 *  So I searched on Google to see what this company DevRev is, only to find out that the office is next to my current office. Then I went to Glassdoor to see the reviews and perks and liked what I was seeing.
 *  I again came back to the DevRev site and started investigating what framework it was using or if they had chosen to go with raw HTML, CSS, or even a simple framework like HTMX, just to find out NextJS being used as the framework.
 *  I continued my investigation and found a link to the assignment post, and here I am with a different approach to solve the assignment.
 *
 * So, enough about why I have done this, let's talk about who I am.
 *
 * I am a full-stack engineer.
 *
 * Again, whoami?
 *
 * I work as a frontend lead in my current organization, and I am a guy who knows his art.
 *
 * My editor: Nvim(neo-vim, vim)
 * My preferred OS: UNIX-based, Linux or macOS
 * Current favorite language: Golang, used to be Rust
 * Languages tried or known: JS/TS, Go, Rust, Zig, C++/C, Python
 * Frontend frameworks/libraries used: NextJS, SolidJS, React, Really like the idea of HTMX
 *
 * My portfolio: https://arme.dev [you can use this to verify my frontend skills if you're unsure; FYI this was last updated two years ago]
 * Email: arbazcr77@gmail.com [will love to hear back from you guys]
 * github: https://github.com/armedev
 * linkedin: https://www.linkedin.com/in/abdul-hameed-armedev
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
