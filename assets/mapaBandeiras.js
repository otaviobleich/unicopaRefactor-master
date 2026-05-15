// RF-001 — Mapeamento das siglas para as imagens locais de bandeiras
// As imagens estão em assets/bandeiras/

const mapaBandeiras = {
  // Grupo A
  MEX: require('./bandeiras/mexico.png'),
  RSA: require('./bandeiras/south africa.png'),
  KOR: require('./bandeiras/south korea.png'),
  CZE: require('./bandeiras/czech republic.png'),

  // Grupo B
  CAN: require('./bandeiras/canada.png'),
  BIH: require('./bandeiras/bosnia and herzegovina.png'),
  QAT: require('./bandeiras/qatar.png'),
  SUI: require('./bandeiras/switzerland.png'),

  // Grupo C
  BRA: require('./bandeiras/BRA.png'),
  MAR: require('./bandeiras/morocco.png'),
  HAI: require('./bandeiras/haiti.png'),
  SCO: require('./bandeiras/scotland.png'),

  // Grupo D
  USA: require('./bandeiras/united states.png'),
  PAR: require('./bandeiras/paraguay.png'),
  AUS: require('./bandeiras/australia.png'),
  TUR: require('./bandeiras/turkey.png'),

  // Grupo E
  GER: require('./bandeiras/germany.png'),
  CIV: require('./bandeiras/ivory coast.png'),
  ECU: require('./bandeiras/ecuador.png'),
  CUW: require('./bandeiras/curacao.png'),

  // Grupo F
  NED: require('./bandeiras/netherlands.png'),
  JPN: require('./bandeiras/japan.png'),
  SWE: require('./bandeiras/sweden.png'),
  TUN: require('./bandeiras/tunisia.png'),

  // Grupo G
  BEL: require('./bandeiras/belgium.png'),
  EGY: require('./bandeiras/egypt.png'),
  IRN: require('./bandeiras/iran.png'),
  NZL: require('./bandeiras/new zealand.png'),

  // Grupo H
  ESP: require('./bandeiras/spain.png'),
  CPV: require('./bandeiras/cape verde.png'),
  KSA: require('./bandeiras/saudi arabia.png'),
  URU: require('./bandeiras/uruguay.png'),

  // Grupo I
  FRA: require('./bandeiras/FRA.png'),
  SEN: require('./bandeiras/senegal.png'),
  IRQ: require('./bandeiras/iraq.png'),
  NOR: require('./bandeiras/norway.png'),

  // Grupo J
  ARG: require('./bandeiras/argentina.png'),
  ALG: require('./bandeiras/Algeria.png'),
  AUT: require('./bandeiras/austria.png'),
  JOR: require('./bandeiras/jordan.png'),

  // Grupo K
  POR: require('./bandeiras/portugal.png'),
  COD: require('./bandeiras/democratic republic of congo.png'),
  UZB: require('./bandeiras/uzbekistan.png'),
  COL: require('./bandeiras/colombia.png'),

  // Grupo L
  ENG: require('./bandeiras/england.png'),
  CRO: require('./bandeiras/croatia.png'),
  GHA: require('./bandeiras/ghana.png'),
  PAN: require('./bandeiras/panama.png'),
};

/**
 * Retorna a imagem da bandeira de uma seleção pela sigla
 * Retorna null se a sigla não for encontrada
 */
export const getBandeira = (sigla) => {
  return mapaBandeiras[sigla] || null;
};

export default mapaBandeiras;