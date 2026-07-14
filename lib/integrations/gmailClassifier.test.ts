import { describe, expect, it } from 'vitest'

import { classifyGmailDeal } from './gmailClassifier'

describe('classifyGmailDeal', () => {
  it('detects sponsorship-related emails', () => {
    const result = classifyGmailDeal('Brand partnership inquiry', 'We would love to collaborate on a paid sponsorship campaign.')

    expect(result).toBe(true)
  })

  it('ignores unrelated email content', () => {
    const result = classifyGmailDeal('Weekly newsletter', 'Here is your monthly update and product tips.')

    expect(result).toBe(false)
  })
})
