import { PresetKind, PresetRecord } from "@/lib/briefloop";
import { supabaseServerRequest } from "@/lib/supabase-server";

export async function getPresets(kind: PresetKind) {
  try {
    const query =
      "presets?select=id,created_at,kind,name,description,channel,objective,payload,is_seeded" +
      `&kind=eq.${kind}&order=is_seeded.desc,name.asc`;
    const data = await supabaseServerRequest(query);
    return (data ?? []) as PresetRecord[];
  } catch {
    return [];
  }
}
