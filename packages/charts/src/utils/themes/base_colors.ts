/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import chroma from 'chroma-js';

/**
 * Primitive colors from EUI theme Borealis https://github.com/elastic/eui/blob/f4892c31cdbf6112d23f11421a87ac14323de62a/packages/eui-theme-borealis/src/variables/colors/_primitive_colors.ts
 * @internal
 */
export const PRIMITIVE_COLORS = {
  white: '#FFFFFF',
  blueBlack: '#07101F',
  blue30: '#BFDBFF',
  blue60: '#61A2FF',
  blue90: '#0B64DD',
  blue100: '#1750BA',
  blue120: '#123778',
  blueGrey15: '#ECF1F9',
  blueGrey20: '#E3E8F2',
  blueGrey30: '#CAD3E2',
  blueGrey60: '#8E9FBC',
  blueGrey70: '#798EAF',
  blueGrey80: '#6A7FA0',
  blueGrey90: '#5A6D8C',
  blueGrey95: '#516381',
  blueGrey100: '#485975',
  blueGrey120: '#2B394F',
  blueGrey130: '#1D2A3E',
  blueGrey140: '#111C2C',
  blueGrey145: '#0B1628',
  primary100: '#1750BA',
  red50: '#FC9188',
  red70: '#EE4C48',
  red90: '#C61E25',
  yellow30: '#FCD883',
  pink60: '#EE72A6',
  pink90: '#BC1E70',
};

/**
 * Semantic colors from EUI theme Borealis https://github.com/elastic/eui/blob/f4892c31cdbf6112d23f11421a87ac14323de62a/packages/eui-theme-borealis/src/variables/colors/_semantic_colors.ts
 * @internal
 */
export const SEMANTIC_COLORS = {
  plainLight: PRIMITIVE_COLORS.white,
  plainDark: PRIMITIVE_COLORS.blueBlack,
  shade15: PRIMITIVE_COLORS.blueGrey15,
  shade20: PRIMITIVE_COLORS.blueGrey20,
  shade30: PRIMITIVE_COLORS.blueGrey30,
  shade60: PRIMITIVE_COLORS.blueGrey60,
  shade70: PRIMITIVE_COLORS.blueGrey70,
  shade80: PRIMITIVE_COLORS.blueGrey80,
  shade90: PRIMITIVE_COLORS.blueGrey90,
  shade95: PRIMITIVE_COLORS.blueGrey95,
  shade100: PRIMITIVE_COLORS.blueGrey100,
  shade120: PRIMITIVE_COLORS.blueGrey120,
  shade130: PRIMITIVE_COLORS.blueGrey130,
  shade140: PRIMITIVE_COLORS.blueGrey140,
  shade145: PRIMITIVE_COLORS.blueGrey145,
  primary30: PRIMITIVE_COLORS.blue30,
  primary60: PRIMITIVE_COLORS.blue60,
  primary90: PRIMITIVE_COLORS.blue90,
  primary100: PRIMITIVE_COLORS.blue100,
  primary120: PRIMITIVE_COLORS.blue120,
  accent60: PRIMITIVE_COLORS.pink60,
  accent90: PRIMITIVE_COLORS.pink90,
  danger50: PRIMITIVE_COLORS.red50,
  danger70: PRIMITIVE_COLORS.red70,
  danger90: PRIMITIVE_COLORS.red90,
  warning30: PRIMITIVE_COLORS.yellow30,
};

const primary100RGB = chroma(SEMANTIC_COLORS.primary100).rgb().join(', ');
const plainLightRGB = chroma(SEMANTIC_COLORS.plainLight).rgb().join(', ');
const shade145RGB = chroma(SEMANTIC_COLORS.shade145).rgb().join(', ');
const shade30RGB = chroma(SEMANTIC_COLORS.shade30).rgb().join(', ');
const shade60RGB = chroma(SEMANTIC_COLORS.shade60).rgb().join(', ');

/**
 * Semantic colors from EUI theme Borealis https://github.com/elastic/eui/blob/f4892c31cdbf6112d23f11421a87ac14323de62a/packages/eui-theme-borealis/src/variables/colors/_semantic_colors.ts
 *
 * @internal
 */
export const SEMANTIC_ALPHA_COLORS = {
  primary100Alpha4: `rgba(${primary100RGB}, 0.04)`,
  plainLightAlpha8: `rgba(${plainLightRGB}, 0.08)`,
  plainLightAlpha70: `rgba(${plainLightRGB}, 0.7)`,
  shade145Alpha70: `rgba(${shade145RGB}, 0.7)`,
  shade30RGBAlpha15: `rgba(${shade30RGB}, 0.15)`,
  shade30RGBAlpha35: `rgba(${shade30RGB}, 0.35)`,
  shade30RGBAlpha50: `rgba(${shade30RGB}, 0.5)`,
  shade60RGBAlpha15: `rgba(${shade60RGB}, 0.15)`,
  shade60RGBAlpha35: `rgba(${shade60RGB}, 0.35)`,
  shade60RGBAlpha50: `rgba(${shade60RGB}, 0.5)`,
};

/**
 * Colors from https://github.com/elastic/eui/blob/f4892c31cdbf6112d23f11421a87ac14323de62a/packages/eui-theme-borealis/src/variables/colors/_colors_dark.ts
 * @internal
 */
export const DARK_BORDER_COLORS = {
  borderBaseSubdued: SEMANTIC_COLORS.shade120,
  borderBasePlain: SEMANTIC_COLORS.shade100,
  borderBasePrimary: SEMANTIC_COLORS.primary120,
};

/**
 * Colors from https://github.com/elastic/eui/blob/f4892c31cdbf6112d23f11421a87ac14323de62a/packages/eui-theme-borealis/src/variables/colors/_colors_light.ts
 * @internal
 */
export const LIGHT_BORDER_COLORS = {
  borderBaseSubdued: SEMANTIC_COLORS.shade20,
  borderBasePlain: SEMANTIC_COLORS.shade30,
  borderBasePrimary: SEMANTIC_COLORS.primary30,
};

/**
 * Colors from https://github.com/elastic/eui/blob/f4892c31cdbf6112d23f11421a87ac14323de62a/packages/eui-theme-borealis/src/variables/colors/_colors_dark.ts
 * @internal
 */
export const DARK_TEXT_COLORS = {
  textParagraph: SEMANTIC_COLORS.shade30,
  textHeading: SEMANTIC_COLORS.shade20,
  textSubdued: SEMANTIC_COLORS.shade60,
  textDisabled: SEMANTIC_COLORS.shade80,
  textInverse: SEMANTIC_COLORS.plainDark,
};

/**
 * Colors from https://github.com/elastic/eui/blob/f4892c31cdbf6112d23f11421a87ac14323de62a/packages/eui-theme-borealis/src/variables/colors/_colors_light.ts
 * @internal
 */
export const LIGHT_TEXT_COLORS = {
  textParagraph: SEMANTIC_COLORS.shade130,
  textHeading: SEMANTIC_COLORS.shade140,
  textSubdued: SEMANTIC_COLORS.shade95,
  textDisabled: SEMANTIC_COLORS.shade70,
  textInverse: SEMANTIC_COLORS.plainLight,
};

/**
 * Colors from https://github.com/elastic/eui/blob/f4892c31cdbf6112d23f11421a87ac14323de62a/packages/eui-theme-borealis/src/variables/colors/_colors_dark.ts
 * @internal
 */
export const DARK_BACKGROUND_COLORS = {
  backgroundBasePlain: SEMANTIC_COLORS.shade145,
  backgroundBaseDisabled: SEMANTIC_COLORS.shade130,
  backgroundBaseInteractiveHover: SEMANTIC_ALPHA_COLORS.plainLightAlpha8,
  backgroundFilledPrimary: SEMANTIC_COLORS.primary60,
  backgroundFilledText: SEMANTIC_COLORS.shade90,
  backgroundFilledAccent: SEMANTIC_COLORS.accent60,
};

/**
 * Colors from https://github.com/elastic/eui/blob/f4892c31cdbf6112d23f11421a87ac14323de62a/packages/eui-theme-borealis/src/variables/colors/_colors_light.ts
 * @internal
 */
export const LIGHT_BACKGROUND_COLORS = {
  backgroundBasePlain: SEMANTIC_COLORS.plainLight,
  backgroundBaseDisabled: SEMANTIC_COLORS.shade15,
  backgroundBaseInteractiveHover: SEMANTIC_ALPHA_COLORS.primary100Alpha4,
  backgroundFilledPrimary: SEMANTIC_COLORS.primary90,
  backgroundFilledText: SEMANTIC_COLORS.shade60,
  backgroundFilledAccent: SEMANTIC_COLORS.accent90,
};

/**
 * Custom light colors specific for charts
 * @internal
 */
export const LIGHT_BACKGROUND_COLORS_CUSTOM = {
  backgroundBasePlainAlpha70: SEMANTIC_ALPHA_COLORS.plainLightAlpha70,
};

/**
 * Custom dark colors specific for charts
 * @internal
 */
export const DARK_BACKGROUND_COLORS_CUSTOM = {
  backgroundBasePlainAlpha70: SEMANTIC_ALPHA_COLORS.shade145Alpha70,
};

/**
 * Severity colors from EUI https://github.com/elastic/eui/blob/f4892c31cdbf6112d23f11421a87ac14323de62a/packages/eui-theme-borealis/src/variables/colors/_colors_vis.ts
 * @internal
 */
export const SEVERITY_COLORS = {
  euiColorSeverity5: SEMANTIC_COLORS.shade30,
  euiColorSeverity7: SEMANTIC_COLORS.warning30,
  euiColorSeverity10: SEMANTIC_COLORS.danger50,
  euiColorSeverity12: SEMANTIC_COLORS.danger70,
  euiColorSeverity14: SEMANTIC_COLORS.danger90,
};

/** @internal */
export const LIGHT_DIMMED_COLORS = {
  lineStroke: SEMANTIC_ALPHA_COLORS.shade30RGBAlpha35,
  linePointStroke: SEMANTIC_ALPHA_COLORS.shade30RGBAlpha15,
  linePointFill: SEMANTIC_ALPHA_COLORS.shade30RGBAlpha15,

  areaFill: SEMANTIC_ALPHA_COLORS.shade30RGBAlpha15,
  areaStroke: SEMANTIC_ALPHA_COLORS.shade30RGBAlpha50,
  areaPointStroke: SEMANTIC_ALPHA_COLORS.shade30RGBAlpha15,
  areaPointFill: SEMANTIC_ALPHA_COLORS.shade30RGBAlpha15,
};

/** @internal */
export const DARK_DIMMED_COLORS = {
  lineStroke: SEMANTIC_ALPHA_COLORS.shade60RGBAlpha35,
  linePointStroke: SEMANTIC_ALPHA_COLORS.shade60RGBAlpha15,
  linePointFill: SEMANTIC_ALPHA_COLORS.shade60RGBAlpha15,

  areaFill: SEMANTIC_ALPHA_COLORS.shade60RGBAlpha15,
  areaStroke: SEMANTIC_ALPHA_COLORS.shade60RGBAlpha35,
  areaPointStroke: SEMANTIC_ALPHA_COLORS.shade60RGBAlpha15,
  areaPointFill: SEMANTIC_ALPHA_COLORS.shade60RGBAlpha15,
};
