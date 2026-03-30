function getServerConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase URL e service role key precisam estar definidas no servidor.");
  }

  return { supabaseUrl, serviceRoleKey };
}

export async function supabaseServerRequest(path: string, init: RequestInit = {}) {
  const { supabaseUrl, serviceRoleKey } = getServerConfig();
  const headers = new Headers(init.headers);
  headers.set("apikey", serviceRoleKey);
  headers.set("Authorization", `Bearer ${serviceRoleKey}`);

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...init,
    headers,
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Erro ao acessar o Supabase. Tente novamente em instantes.");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

