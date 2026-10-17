// Faith Tribe Visual Identity - 12 Tribes Definition
// Colors and biblical emblem sources

export interface TribeDefinition {
  id: string;
  name: string;
  container: string;
  ink: string;
  emblemKey: string;
  source: string;
}

export const TRIBES: TribeDefinition[] = [
  {
    id: 'reuben',
    name: 'Reuben',
    container: '#CFE6F3',
    ink: '#0F4A66',
    emblemKey: 'water',
    source: 'Gen 49:4'
  },
  {
    id: 'simeon',
    name: 'Simeon',
    container: '#EBCFCB',
    ink: '#6B2420',
    emblemKey: 'sword',
    source: 'Gen 49:5'
  },
  {
    id: 'levi',
    name: 'Levi',
    container: '#E0D9F0',
    ink: '#3E2C6E',
    emblemKey: 'urim-thummim',
    source: 'Deut 33:8'
  },
  {
    id: 'judah',
    name: 'Judah',
    container: '#F5E1A0',
    ink: '#6A4700',
    emblemKey: 'lion',
    source: 'Gen 49:9'
  },
  {
    id: 'zebulun',
    name: 'Zebulun',
    container: '#D3DAF2',
    ink: '#1F2F7A',
    emblemKey: 'ship',
    source: 'Gen 49:13'
  },
  {
    id: 'issachar',
    name: 'Issachar',
    container: '#E6DAC3',
    ink: '#5A4219',
    emblemKey: 'donkey',
    source: 'Gen 49:14'
  },
  {
    id: 'dan',
    name: 'Dan',
    container: '#DCE5C2',
    ink: '#3C4F12',
    emblemKey: 'serpent',
    source: 'Gen 49:17'
  },
  {
    id: 'gad',
    name: 'Gad',
    container: '#F0CFBD',
    ink: '#7A2F10',
    emblemKey: 'raiding-troop',
    source: 'Gen 49:19'
  },
  {
    id: 'asher',
    name: 'Asher',
    container: '#F8D9B8',
    ink: '#7C3A00',
    emblemKey: 'bread',
    source: 'Gen 49:20'
  },
  {
    id: 'naphtali',
    name: 'Naphtali',
    container: '#C6E9E4',
    ink: '#0F5A52',
    emblemKey: 'deer',
    source: 'Gen 49:21'
  },
  {
    id: 'joseph',
    name: 'Joseph',
    container: '#CDEBC8',
    ink: '#1B5A25',
    emblemKey: 'fruitful-bough',
    source: 'Gen 49:22'
  },
  {
    id: 'benjamin',
    name: 'Benjamin',
    container: '#F3CEDA',
    ink: '#7A2342',
    emblemKey: 'wolf',
    source: 'Gen 49:27'
  }
];

export const TRIBES_BY_ID = Object.fromEntries(TRIBES.map((t) => [t.id, t])) as Record<string, TribeDefinition>;
