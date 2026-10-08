import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { VALIDATION_PATH } from "@/lib/routes";

// 1. /validar-certificado?id=<uid> → redirect HTTP para /validar-certificado/<uid>.
// 2. Nas rotas /admin: renova a sessão do Supabase e faz um redirecionamento
//    otimista para o login. A autorização real é feita nas páginas/actions
//    (requireAdmin) e no banco (RLS).
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Código com "%" malformado faria o Next responder 500 ao decodificar o
  // parâmetro; trata como código inválido ("Certificado não validado").
  if (pathname.startsWith(`${VALIDATION_PATH}/`)) {
    try {
      decodeURIComponent(pathname);
      return NextResponse.next();
    } catch {
      const target = request.nextUrl.clone();
      target.pathname = `${VALIDATION_PATH}/codigo-invalido`;
      return NextResponse.redirect(target);
    }
  }

  if (pathname === VALIDATION_PATH) {
    const code = request.nextUrl.searchParams.get("id")?.trim();
    if (!code) return NextResponse.next();
    const target = request.nextUrl.clone();
    target.pathname = `${VALIDATION_PATH}/${encodeURIComponent(code)}`;
    target.search = "";
    return NextResponse.redirect(target);
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([key, value]) =>
            response.headers.set(key, value),
          );
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();
  const isLoginPage = request.nextUrl.pathname === "/admin/login";

  if (!data?.claims && !isLoginPage) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.search = "";
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/validar-certificado", "/validar-certificado/:path*"],
};
