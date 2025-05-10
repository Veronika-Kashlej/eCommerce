export enum Country {
  EMPTY = '',
  BY = 'Belarus',
  UK = 'Ukraine',
  RU = 'Russia',
  US = 'United States',
}

export const CountryLabels = {
  [Country.BY]: 'Belarus',
  [Country.UK]: 'Ukraine',
  [Country.RU]: 'Russia',
  [Country.US]: 'United States',
} as const;
