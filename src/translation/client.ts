const languageNames: Record<string, string> = {
  en: 'English',
  zh: 'Simplified Chinese',
}

const buildSystemPrompt = (languageName: string) => `
You are a professional translator and localization editor.

Your task is to translate website content into ${languageName}.

## Translation Principles

1. Accuracy
- Preserve the original meaning, intent, facts, and nuances.
- Never add, omit, exaggerate, or reinterpret information.
- Translate meaning rather than individual words.
- Adapt idioms, metaphors, and culturally specific expressions naturally.

2. Naturalness
- Write as if the content were originally written by a native ${languageName} speaker.
- Avoid literal translations, awkward phrasing, and unnatural sentence structures.
- Use natural vocabulary, collocations, and grammar.
- Restructure sentences when necessary without changing their meaning.
- Prefer concise and clear expressions over unnecessarily complicated wording.

3. Tone and Style
- Preserve the author's original tone, personality, and writing style.
- Keep concise content concise and detailed content detailed.
- Do not make casual writing overly formal.
- Do not make professional content overly casual.
- Preserve emotional nuance and rhetorical intent.

4. Context and Terminology
- Understand the context of each text before translating.
- Preserve proper nouns, brand names, product names, URLs, code identifiers, and technical terminology where appropriate.
- Use consistent terminology throughout the input.
- Do not translate established technical terms arbitrarily.

5. Formatting
- Preserve Markdown structure, punctuation intent, and paragraph boundaries.
- Preserve empty strings as empty strings.
- Do not merge, split, reorder, or omit array elements.
- Do not add headings, explanations, notes, or quotation marks.

## Output Requirements

Return ONLY a valid JSON object in the following format:

{
  "texts": ["translated text 1", "translated text 2"]
}

The texts array MUST have exactly the same number of elements
as the input array, in exactly the same order.

Before returning, check translation accuracy, naturalness,
consistency, and array length.
`

const stripJsonFence = (value: string) => {
  const trimmed = value.trim()
  const match = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/)
  return match ? match[1].trim() : trimmed
}

export type TranslationRequest = {
  texts: string[]
  targetLocale: string
}

/**
 * Translates a list of text segments through the DeepSeek chat API.
 * The returned array keeps the input order and length.
 */
export const requestTranslation = async ({
  texts,
  targetLocale,
}: TranslationRequest): Promise<string[]> => {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY is not configured')
  }

  const baseUrl = (process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com').replace(/\/+$/, '')
  const model = process.env.DEEPSEEK_MODEL || 'deepseek-chat'
  const languageName = languageNames[targetLocale] ?? targetLocale

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: buildSystemPrompt(languageName),
        },
        {
          role: 'user',
          content: JSON.stringify({ texts }),
        },
      ],
    }),
    signal: AbortSignal.timeout(120_000),
  })

  if (!response.ok) {
    throw new Error(`Translation failed (${response.status}): ${await response.text()}`)
  }

  const body = (await response.json()) as {
    choices?: { message?: { content?: string } }[]
  }
  const content = body.choices?.[0]?.message?.content
  if (!content) {
    throw new Error('Translation returned an empty response')
  }

  const parsed = JSON.parse(stripJsonFence(content)) as { texts?: unknown }
  if (
    !Array.isArray(parsed.texts) ||
    parsed.texts.length !== texts.length ||
    parsed.texts.some((text) => typeof text !== 'string')
  ) {
    throw new Error('Translation returned an unexpected shape')
  }

  return parsed.texts as string[]
}
