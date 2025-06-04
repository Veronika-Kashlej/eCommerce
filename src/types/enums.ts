export enum Country {
  EMPTY = '',
  BY = 'Belarus',
  UA = 'Ukraine',
  RU = 'Russia',
  US = 'United States',
}

export const CountryLabels = {
  [Country.BY]: 'Belarus',
  [Country.UA]: 'Ukraine',
  [Country.RU]: 'Russia',
  [Country.US]: 'United States',
} as const;
