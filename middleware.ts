import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Allow only homepage and static files
  if (
    pathname !== "/" &&
    !pathname.startsWith("/_next") &&
    !pathname.includes(".")
  ) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api).*)"],
}
