import ms from 'ms'

export const SITE_URL = 'https://distroinstall.com'
export const GITHUB_URL = 'https://github.com/distroinstall'

export const timeAgo = (timestamp: Date, timeOnly?: boolean): string => {
  if (!timestamp) return 'never'
  return `${ms(Date.now() - new Date(timestamp).getTime())}${
    timeOnly ? '' : ' ago'
  }`
}
