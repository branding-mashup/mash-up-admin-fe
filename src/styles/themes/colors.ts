export const colors = {
  white: '#FFFFFF',
  gray5: '#F8F9FA',
  gray10: '#F1F3F5',
  gray20: '#E9ECEF',
  gray30: '#DEE2E6',
  gray40: '#CED4DA',
  gray50: '#ADB5BD',
  gray60: '#868E96',
  gray70: '#495057',
  gray80: '#343A40',
  gray90: '#212529',
  purple80: '#4127D1',
  purple70: '#6244FF',
  purple60: '#836BFF',
  purple40: '#C2B6FF',
  purple20: '#E8E4FF',
  purple10: '#F1EFFF',
  red70: '#FC4162',
} as const;

export type ColorTheme = typeof colors;
