/**
 * What each council's bush fire notice actually says about gutters.
 *
 * Every quote below was read from the council's own published notice in
 * November 2026 (the 2026/27 season). There is no statewide WA law that names
 * gutter cleaning. What exists is section 33 of the Bush Fires Act 1954 (WA),
 * which lets each local government issue a notice — and three of the Hills
 * councils have written gutters into theirs, which makes it enforceable there.
 * The City of Swan's notice does not mention gutters, so the site does not
 * claim it does.
 *
 * RE-CHECK EVERY SPRING: councils reissue these notices each year and the
 * dates and wording change. If a quote here stops matching the current notice,
 * fix it or remove it — do not leave a stale legal claim on a page.
 */

export interface Council {
  name: string;
  noticeName: string;
  noticeUrl: string;
  /** The notice's own words about gutters, or null if it has none. */
  gutterQuote: string | null;
  /** Which properties that clause applies to, in the notice's terms. */
  appliesTo: string;
  complyBy: string;
  maintainUntil: string;
  penalty: string;
}

export const councils: Record<string, Council> = {
  kalamunda: {
    name: 'City of Kalamunda',
    noticeName: 'Fire Hazard Reduction Notice 2026/2027',
    noticeUrl: 'https://www.kalamunda.wa.gov.au/fire-hazard-reduction-notice',
    gutterQuote: 'Gutters, roofs, and walls of all buildings to be free of flammable matter and maintained.',
    appliesTo: 'all properties, as part of the asset protection zone around buildings',
    complyBy: '1 November 2026',
    maintainUntil: '31 March 2027',
    penalty: 'up to $5,000',
  },
  mundaring: {
    name: 'Shire of Mundaring',
    noticeName: 'Firebreak and Fuel Load Notice',
    noticeUrl: 'https://mundaring.wa.gov.au/safety-rangers/bush-fires-and-fire-management/firebreaks-and-fuel-load-notice.aspx',
    gutterQuote: 'Gutters are free of fine fuels and other flammable/combustible materials.',
    appliesTo: 'land with a building on it, as part of the asset protection zone',
    complyBy: '1 November each year',
    maintainUntil: '31 March',
    penalty: 'a fine not exceeding $5,000',
  },
  armadale: {
    name: 'City of Armadale',
    noticeName: 'Firebreak and Hazard Reduction Notice 2026/2027',
    noticeUrl: 'https://my.armadale.wa.gov.au/service/bushfire-and-emergency/fire-break-and-hazard-reduction-notice',
    gutterQuote: 'Gutters, roofs and walls of all Habitable Buildings are to be maintained free of Inflammable Matter.',
    appliesTo: 'all land, whatever its size',
    complyBy: '30 November 2026',
    maintainUntil: '31 March 2027',
    penalty: 'up to $5,000',
  },
  swan: {
    name: 'City of Swan',
    noticeName: 'Fire Hazard Reduction Notice 2026/27',
    noticeUrl: 'https://www.swan.wa.gov.au/services-and-community/emergency-management/bushfire',
    gutterQuote: null,
    appliesTo: '',
    complyBy: '1 November 2026',
    maintainUntil: '30 April 2027',
    penalty: 'up to $5,000',
  },
  joondalup: {
    name: 'City of Joondalup',
    noticeName: 'Bushfire Management Notice',
    noticeUrl: 'https://www.joondalup.wa.gov.au/community-and-spaces/community-safety/firebreaks-and-hazard-reduction-burns/bushfire-management-notice-firebreak-requirements',
    // Covers grass height, firebreaks and overhanging vegetation only.
    gutterQuote: null,
    appliesTo: '',
    complyBy: '31 October each year',
    maintainUntil: '31 May',
    penalty: '',
  },
};
