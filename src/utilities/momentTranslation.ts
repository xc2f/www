type RichTextNode = {
  children?: RichTextNode[]
  text?: string
  [key: string]: unknown
}

export type MomentTranslation = {
  texts: string[]
  title: string
}

const isTranslatableText = (node: RichTextNode) =>
  typeof node.text === 'string' && node.text.trim().length > 0

const visitTextNodes = (content: unknown, visit: (node: RichTextNode) => void) => {
  const root = (content as { root?: RichTextNode } | null | undefined)?.root
  if (!root) return

  const walk = (node: RichTextNode) => {
    if (isTranslatableText(node)) {
      visit(node)
    }
    node.children?.forEach((child) => walk(child))
  }

  walk(root)
}

export const collectMomentTexts = (content: unknown): string[] => {
  const texts: string[] = []
  visitTextNodes(content, (node) => texts.push(node.text as string))
  return texts
}

export const applyMomentTexts = <TContent>(content: TContent, translations: string[]): TContent => {
  let index = 0
  visitTextNodes(content, (node) => {
    node.text = translations[index++] ?? node.text
  })
  return content
}

const stripJsonFence = (value: string) => {
  const trimmed = value.trim()
  const match = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/)
  return match ? match[1].trim() : trimmed
}

export const requestMomentTranslation = async ({
  texts,
  title,
}: MomentTranslation): Promise<MomentTranslation> => {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY is not configured')
  }

  const baseUrl = (process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com').replace(/\/+$/, '')
  const model = process.env.DEEPSEEK_MODEL || 'deepseek-chat'

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
          content:
            'You translate Chinese website content into natural, concise English. Return only a JSON object shaped like {"title": string, "texts": string[]}. Keep the texts array order and length identical to the input, keep empty strings empty, and do not add explanations.',
        },
        {
          role: 'user',
          content: JSON.stringify({ texts, title }),
        },
      ],
    }),
    signal: AbortSignal.timeout(120_000),
  })

  if (!response.ok) {
    throw new Error(`DeepSeek translation failed (${response.status}): ${await response.text()}`)
  }

  const body = (await response.json()) as {
    choices?: { message?: { content?: string } }[]
  }
  const content = body.choices?.[0]?.message?.content
  if (!content) {
    throw new Error('DeepSeek returned an empty translation')
  }

  const parsed = JSON.parse(stripJsonFence(content)) as { texts?: unknown; title?: unknown }
  if (
    typeof parsed.title !== 'string' ||
    !Array.isArray(parsed.texts) ||
    parsed.texts.length !== texts.length ||
    parsed.texts.some((text) => typeof text !== 'string')
  ) {
    throw new Error('DeepSeek returned a translation with an unexpected shape')
  }

  return { texts: parsed.texts as string[], title: parsed.title }
}
