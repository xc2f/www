import { request } from './request'

export const feedsAPI = {
  async getEmojis(): Promise<string[]> {
    const res = await request<string[]>('/api/feeds/for/logo-emojis?json')

    if (!res.ok) {
      throw new Error(res.error?.message || 'Failed to fetch emojis')
    }

    return res.data
  },
}
