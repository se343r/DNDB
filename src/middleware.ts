import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Middleware refresh Supabase session token trên mỗi request.
 * Bắt buộc phải có khi dùng @supabase/ssr — nếu không, access token
 * sẽ hết hạn (mặc định 1h) mà cookie không được làm mới, khiến user
 * bị "đăng xuất" giữa chừng dù vẫn đang dùng app.
 *
 * Đặt file này tại src/middleware.ts (ngoài thư mục app/).
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Gọi getUser() để trigger refresh token nếu cần
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    /*
     * Áp dụng cho mọi route TRỪ static assets và _next internals,
     * để middleware không làm chậm việc load ảnh/font/script.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
