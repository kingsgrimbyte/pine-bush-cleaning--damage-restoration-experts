import { NextRequest, NextResponse } from "next/server";
import contentData from "@/components/Content/ContactInfo.json";
import subdomainUrl from "@/components/Content/subDomainUrlContent.json";

export async function GET(req: NextRequest) {
  try {
    const baseUrl = contentData.baseUrl || "https://example.com/";
    const subDomains = subdomainUrl ? Object.keys(subdomainUrl) : [];

    // Extract the subdomain from the host
    const host = req.headers.get("host") || "";
    const subdomainMatch = host.split(".")[0];
    const isSubdomain = subDomains.includes(subdomainMatch);

    // Define main pages allowed for each subdomain
    const mainPages = [
      "/services",
      "/about",
      "/contact",
      "/locations",
      "/our-brands",
    ];

    // Generate allowed paths for subdomains and their main pages
    const subdomainAllowPaths = subDomains.flatMap((subdomain) => [
      `/${subdomain}`,
      ...mainPages.map((page) => `/${subdomain}${page}`),
    ]);

    // Default allowed and disallowed paths
    let allow = [
      "/",
      "/about",
      "/services",
      "/contact",
      "/locations",
      "/our-brands",
      "/_blogs",
      "/_next/image",
      ...subdomainAllowPaths,
    ];

    let disallow = [
      "/private/",
      "/api/",
      "/_next/",
      "/static/",
      "/*.json$",
      "/*.xml$",
      ...subDomains.map((subdomain) => `/${subdomain}/${subdomain}`),
    ];

    // If the request is for a subdomain, adjust the allow/disallow paths
    if (isSubdomain) {
      allow = ["/", ...mainPages];
      disallow = [
        "/private/",
        "/api/",
        "/_next/",
        "/static/",
        "/*.json$",
        "/*.xml$",
      ];
    }

    // Build the robots.txt content dynamically
    const robotsTxt = [
      `User-agent: *`,
      ...allow.map((path) => `Allow: ${path}`),
      ...disallow.map((path) => `Disallow: ${path}`),
      `Sitemap: ${baseUrl}sitemap.xml`,
      `Host: ${baseUrl}`,
    ].join("\n");

    return new NextResponse(robotsTxt, {
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    // Log the error and return a fallback robots.txt in case of failure
    console.error("Error generating robots.txt:", error);

    const fallback = `User-agent: *\nDisallow:`;
    return new NextResponse(fallback, {
      headers: { "Content-Type": "text/plain" },
      status: 200,
    });
  }
}
