import { NextRequest, NextResponse } from "next/server";
import contentData from "@/components/Content/ContactInfo.json";
import subdomainUrl from "@/components/Content/subDomainUrlContent.json";

export async function GET(req: NextRequest) {
  const BaseUrl = contentData.baseUrl;
  const subDomains = Object.keys(subdomainUrl);

  // Extract subdomain from the host
  const host = req.headers.get("host") || "";
  const subdomainMatch = host.split(".")[0];
  const isSubdomain = subDomains.includes(subdomainMatch);

  // Define main pages that should be allowed under each subdomain
  const mainPages = [
    "/services",
    "/about",
    "/contact",
    "/locations",
    "/our-brands",
  ];

  // Generate allow paths for subdomains and their main pages
  const subdomainAllowPaths = subDomains.flatMap((subdomain) => [
    `/${subdomain}`,
    ...mainPages.map((page) => `/${subdomain}${page}`),
  ]);

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

  // If on a subdomain, adjust allow/disallow for that subdomain
  if (isSubdomain) {
    allow = [
      "/",
      ...mainPages,
    ];
    disallow = [
      "/private/",
      "/api/",
      "/_next/",
      "/static/",
      "/*.json$",
      "/*.xml$",
    ];
  }

  // Build robots.txt content
  let robotsTxt = `User-agent: *\n`;
  allow.forEach((path) => {
    robotsTxt += `Allow: ${path}\n`;
  });
  disallow.forEach((path) => {
    robotsTxt += `Disallow: ${path}\n`;
  });
  robotsTxt += `Sitemap: ${BaseUrl}sitemap.xml\n`;
  robotsTxt += `Host: ${BaseUrl}\n`;

  return new NextResponse(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
