const DEAL_KEYWORDS = ['brand deal', 'sponsorship', 'paid partnership', 'partnership', 'campaign', 'sponsor', 'endorsement', 'collab']

export function classifyGmailDeal(subject: string, body: string): boolean {
  const haystack = `${subject} ${body}`.toLowerCase()

  return DEAL_KEYWORDS.some((keyword) => haystack.includes(keyword))
}
