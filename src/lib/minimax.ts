const DEFAULT_MODEL = "MiniMax-M2.7";
const DEFAULT_BASE_URL = "https://api.minimax.io";
const SYSTEM_PROMPT =
  "Você é um estrategista de marketing sênior com 15 anos de experiência em agências. Escreva em português brasileiro. Seja direto, específico e evite genericidades.";

interface MiniMaxConfig {
  apiKey: string;
  model: string;
  baseUrl: string;
}

interface MiniMaxChoice {
  text: string;
}

interface MiniMaxUsage {
  total_tokens: number;
}

interface MiniMaxResponse {
  choices?: MiniMaxChoice[];
  base_resp?: { status_code: number; status_msg: string };
  usage?: MiniMaxUsage;
}

export class MiniMaxClient {
  private config: MiniMaxConfig;

  private constructor(config: MiniMaxConfig) {
    this.config = config;
  }

  static create(): MiniMaxClient | null {
    const apiKey = process.env.MINIMAX_API_KEY;
    if (!apiKey) {
      return null;
    }

    return new MiniMaxClient({
      apiKey,
      model: process.env.MINIMAX_MODEL ?? DEFAULT_MODEL,
      baseUrl: process.env.MINIMAX_BASE_URL ?? DEFAULT_BASE_URL
    });
  }

  isConfigured(): boolean {
    return Boolean(this.config.apiKey);
  }

  async generate(prompt: string, maxTokens = 1024): Promise<string> {
    const url = `${this.config.baseUrl}/v1/text/chatcompletion_pro`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model,
        max_tokens: maxTokens,
        temperature: 0.7,
        bot_setting: [
          {
            bot_name: "BriefLoop",
            content: SYSTEM_PROMPT
          }
        ],
        reply_constraints: {
          role: "assistant",
          sender_type: "BOT",
          sender_name: "BriefLoop"
        },
        messages: [
          { role: "user", sender_name: "User", sender_type: "USER", content: prompt }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`MiniMax API error: ${response.status}`);
    }

    const data = (await response.json()) as MiniMaxResponse;

    if (data.base_resp && data.base_resp.status_code !== 0) {
      throw new Error("MiniMax API error: serviço retornou erro interno.");
    }

    const text = data.choices?.[0]?.text?.trim();
    if (!text) {
      throw new Error("MiniMax returned empty response");
    }

    return text;
  }
}

// ─── OpenRouter Client ────────────────────────────────────────────────────────

const OR_DEFAULT_MODEL = "openrouter/auto";
const OR_BASE_URL = "https://openrouter.ai/api/v1";

export class OpenRouterClient {
  private config: { apiKey: string; model: string; baseUrl: string };

  private constructor(config: { apiKey: string; model: string; baseUrl: string }) {
    this.config = config;
  }

  static create(): OpenRouterClient | null {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return null;

    return new OpenRouterClient({
      apiKey,
      model: process.env.OPENROUTER_MODEL ?? OR_DEFAULT_MODEL,
      baseUrl: OR_BASE_URL
    });
  }

  async generate(prompt: string, maxTokens = 1024): Promise<string> {
    const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
        "X-Title": "BriefLoop"
      },
      body: JSON.stringify({
        model: this.config.model,
        max_tokens: maxTokens,
        temperature: 0.7,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter error: ${response.status}`);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      error?: { message?: string };
    };

    if (data.error) {
      throw new Error(`OpenRouter error: ${data.error.message ?? "unknown"}`);
    }

    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) {
      throw new Error("OpenRouter returned empty response");
    }

    return text;
  }
}
