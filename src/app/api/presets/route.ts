import { supabaseServerRequest } from "@/lib/supabase-server";

export const runtime = "edge";

const validKinds = new Set(["debrief", "brief"]);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const kind = typeof body.kind === "string" ? body.kind.trim() : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const channel = typeof body.channel === "string" ? body.channel.trim() : null;
    const objective = typeof body.objective === "string" ? body.objective.trim() : null;
    const payload = typeof body.payload === "object" && body.payload ? body.payload : null;

    if (!validKinds.has(kind) || !name || !payload) {
      return Response.json(
        {
          error: "Dados inválidos",
          message: "Não foi possível salvar o preset com os dados enviados."
        },
        { status: 400 }
      );
    }

    const data = await supabaseServerRequest("presets?select=id", {
      method: "POST",
      headers: {
        Prefer: "return=representation"
      },
      body: JSON.stringify({
        kind,
        name,
        description: description || null,
        channel,
        objective,
        payload,
        is_seeded: false
      })
    });

    return Response.json({
      id: data?.[0]?.id,
      message: "Preset salvo com sucesso."
    });
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return Response.json(
      {
        error: "Falha ao salvar preset",
        message: "Não conseguimos salvar esse preset agora. Tente novamente em instantes."
      },
      { status: 500 }
    );
  }
}
