// Mansdarbs VID assistant API — server-side only; never expose the API key to the browser.
const MODEL_DEFAULT = "gpt-6-luna";
const MAX_REQUEST_BYTES = 14000;
const OFFICIAL_DOMAINS = [
  "vid.gov.lv",
  "likumi.lv",
  "vsaa.gov.lv",
  "ur.gov.lv",
  "fm.gov.lv",
  "latvija.gov.lv"
];
const SYSTEM_INSTRUCTIONS = `
Tu esi Mansdarbs palīgs Latvijas iedzīvotājiem, kuri kārto saimniecisko darbību un VID EDS jautājumus.
Atbildi latviešu valodā, vienkārši, mierīgi un soli pa solim. Pielāgo skaidrojumu izvēlētajam lietotāja profilam un VID uzdevumam.
Nodokļu, juridiskos un termiņu jautājumos balsties uz aktuāliem oficiāliem avotiem. Izmanto tikai VID, likumi.lv, VSAA, Uzņēmumu reģistra, Finanšu ministrijas un Latvija.gov.lv informāciju. Norādi avota saites, ja tās ir pieejamas. Ja oficiāls avots nav atrodams vai noteikumi nav skaidri, pasaki to tieši un iesaki precizēt pie VID; neizdomā atbildi.
Nekad neizdomā EDS izvēļņu nosaukumus, pogas vai ekrānu secību. Ja lietotāja ekrāns atšķiras, pajautā, ko viņš redz, un sniedz drošu nākamo soli.
Nekad neprasi un nepieņem VID/EDS paroli, Smart-ID kodus, personas kodu, bankas piekļuves datus vai citus sensitīvus datus. Ja lietotājs tos ievieto, neapstrādā tos un palūdz izdzēst no ziņas.
Tu neesi VID un nedrīksti apgalvot, ka esi iesniedzis dokumentu, pieslēdzies EDS vai pārbaudījis lietotāja kontu. Tu nevari darboties EDS lietotāja vietā.
Nesniedz galīgu juridisku slēdzienu sarežģītos vai individuālos gadījumos. Atšķir vispārējo nodokļu režīmu, MUN un uzņēmuma pienākumus. Neizdari pieņēmumus, ja profils nav zināms.
Dod vienu konkrētu nākamo soli, nevis garu vispārīgu lekciju. Ja vajadzīgi vairāki soļi, numurē tos. Saglabā atbildi īsu un praktisku.
`.trim();

async function readLimitedRequestBody(request) {
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      totalBytes += value.byteLength;
      if (totalBytes > MAX_REQUEST_BYTES) {
        try { await reader.cancel(); } catch (_) {}
        return null;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

function json(data, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer"
    }
  });
}

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get("Origin");
  if (origin) {
    try {
      if (new URL(origin).origin !== new URL(request.url).origin) return json({ error: "Pieprasījums nav atļauts." }, 403);
    } catch (_) {
      return json({ error: "Nederīgs pieprasījums." }, 403);
    }
  }

  const length = Number(request.headers.get("Content-Length") || 0);
  if (length > 14000) return json({ error: "Ziņa ir pārāk gara. Saīsini to un mēģini vēlreiz." }, 413);

  let rawBody;
  try { rawBody = await readLimitedRequestBody(request); } catch (_) {
    return json({ error: "Neizdevās nolasīt ziņu." }, 400);
  }
  if (rawBody === null) {
    return json({ error: "Ziņa ir pārāk gara. Saīsini to un mēģini vēlreiz." }, 413);
  }

  let body;
  try { body = JSON.parse(rawBody); } catch (_) {
    return json({ error: "Neizdevās nolasīt ziņu." }, 400);
  }

  if (body?.consent !== true) {
    return json({ error: "Pirms jautājuma nosūtīšanas nepieciešams apstiprināt datu nosūtīšanu AI pakalpojumam." }, 403);
  }

  if (!env.OPENAI_API_KEY) {
    return json({ error: "AI savienojums vēl nav aktivizēts. Pagaidām izmanto soli pa solim ceļvedi." }, 503);
  }

  const allowedRoles = new Set(["user", "assistant"]);
  const messages = Array.isArray(body?.messages) ? body.messages.slice(-8).map(item => ({
    role: allowedRoles.has(item?.role) ? item.role : "user",
    content: typeof item?.content === "string" ? item.content.trim().slice(0, 1800) : ""
  })).filter(item => item.content) : [];

  if (!messages.length || !messages.some(item => item.role === "user")) {
    return json({ error: "Ieraksti jautājumu, lai varu palīdzēt." }, 400);
  }
  const totalLength = messages.reduce((sum, item) => sum + item.content.length, 0);
  if (totalLength > 9000) return json({ error: "Saruna ir pārāk gara. Sāc jaunu jautājumu." }, 413);

  const profile = ["general", "mun", "unknown"].includes(body?.profile) ? body.profile : "unknown";
  const task = ["register", "quarterly", "annual", "check"].includes(body?.task) ? body.task : "unknown";
  const context = "Lietotāja profils: " + profile + ". VID uzdevums: " + task + ". Šis ir konteksts, nevis pierādījums par lietotāja faktisko nodokļu statusu.";

  let upstream;
  try {
    upstream = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + env.OPENAI_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: env.OPENAI_MODEL || MODEL_DEFAULT,
        instructions: SYSTEM_INSTRUCTIONS + "\n\n" + context,
        input: messages,
        tools: [{
          type: "web_search",
          search_context_size: "low",
          filters: { allowed_domains: OFFICIAL_DOMAINS }
        }],
        max_output_tokens: 900,
        store: false
      })
    });
  } catch (_) {
    return json({ error: "AI palīgs pašlaik nav sasniedzams. Mēģini vēlreiz pēc brīža." }, 502);
  }

  if (!upstream.ok) {
    // Do not forward provider diagnostics or request details to the browser.
    return json({ error: "AI palīgs pašlaik nevar sagatavot atbildi. Mēģini vēlreiz vēlāk." }, 502);
  }

  let result;
  try { result = await upstream.json(); } catch (_) {
    return json({ error: "Saņēmu nesaprotamu atbildi. Mēģini vēlreiz." }, 502);
  }

  const answerParts = [];
  const sources = [];
  for (const item of result.output || []) {
    if (item.type !== "message" || !Array.isArray(item.content)) continue;
    for (const part of item.content) {
      if (part.type === "output_text" && typeof part.text === "string") answerParts.push(part.text);
      for (const annotation of part.annotations || []) {
        if (annotation.type === "url_citation" && typeof annotation.url === "string") {
          try {
            const url = new URL(annotation.url);
            if (url.protocol === "https:" && OFFICIAL_DOMAINS.some(domain => url.hostname === domain || url.hostname.endsWith("." + domain))) {
              sources.push({ title: String(annotation.title || url.hostname).slice(0, 120), url: url.href });
            }
          } catch (_) {}
        }
      }
    }
  }

  const answer = answerParts.join("\n").trim();
  if (!answer) return json({ error: "Neizdevās sagatavot atbildi. Pārformulē jautājumu." }, 502);
  const uniqueSources = [...new Map(sources.map(source => [source.url, source])).values()].slice(0, 5);
  return json({ answer, sources: uniqueSources });
}
