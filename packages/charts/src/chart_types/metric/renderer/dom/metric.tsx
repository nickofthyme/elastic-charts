/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import type { CSSProperties } from 'react';
import React, { useState } from 'react';

import { ProgressBar } from './progress';
import { SparkLine, getSparkLineColor } from './sparkline';
import { MetricText } from './text';
import type { MetricTextDimensions } from './text_measurements';
import type { ColorContrastOptions } from '../../../../common/color_calcs';
import { combineColors } from '../../../../common/color_calcs';
import { RGBATupleToString, changeColorLightness, colorToRgba } from '../../../../common/color_library_wrappers';
import type { Color } from '../../../../common/colors';
import { DEFAULT_CSS_CURSOR } from '../../../../common/constants';
import { fillTextColor } from '../../../../common/fill_text_color';
import type {
  BasicListener,
  ElementClickListener,
  ElementOverListener,
  MetricDatum,
  MetricElementEvent,
} from '../../../../specs';
import { LayoutDirection, isNil } from '../../../../utils/common';
import type { MetricStyle } from '../../../../utils/themes/theme';
import type { MetricWNumber } from '../../specs';
import { isMetricWProgress, isMetricWTrend } from '../../specs';

/** @internal */
export const Metric: React.FunctionComponent<{
  chartId: string;
  hasTitles: boolean;
  rowIndex: number;
  columnIndex: number;
  totalColumns: number;
  totalRows: number;
  datum: MetricDatum;
  style: MetricStyle;
  backgroundColor: Color;
  contrastOptions: ColorContrastOptions;
  textDimensions: MetricTextDimensions;
  onElementClick?: ElementClickListener;
  onElementOver?: ElementOverListener;
  onElementOut?: BasicListener;
}> = ({
  chartId,
  hasTitles,
  rowIndex,
  columnIndex,
  totalColumns,
  totalRows,
  datum,
  style,
  backgroundColor: chartBackgroundColor,
  contrastOptions,
  textDimensions,
  onElementClick,
  onElementOver,
  onElementOut,
}) => {
  const progressBarSize = 'small'; // currently we provide only the small progress bar;
  const [mouseState, setMouseState] = useState<'leave' | 'enter' | 'down'>('leave');
  const [lastMouseDownTimestamp, setLastMouseDownTimestamp] = useState<number>(0);
  const metricHTMLId = `echMetric-${chartId}-${rowIndex}-${columnIndex}`;
  const hasProgressBar = isMetricWProgress(datum);
  const progressBarDirection = hasProgressBar ? datum.progressBarDirection : undefined;

  const containerClassName = classNames('echMetric', {
    'echMetric--rightBorder': columnIndex < totalColumns - 1,
    'echMetric--bottomBorder': rowIndex < totalRows - 1,
    'echMetric--topBorder': hasTitles && rowIndex === 0,
    'echMetric--vertical': progressBarDirection === LayoutDirection.Vertical,
    'echMetric--horizontal': progressBarDirection === LayoutDirection.Horizontal,
    [`echMetric--withProgressBar--${progressBarSize}`]: hasProgressBar,
    [`echMetric--withTargetProgressBar--${progressBarSize}`]: !isNil((datum as MetricWNumber)?.target),
  });

  const lightnessAmount = mouseState === 'leave' ? 0 : mouseState === 'enter' ? 0.05 : 0.1;

  const backgroundColor = datum.background
    ? RGBATupleToString(combineColors(colorToRgba(datum.background), colorToRgba(chartBackgroundColor)))
    : chartBackgroundColor;
  const blendingBackgroundColor = !style.blendingBackground
    ? colorToRgba(backgroundColor)
    : combineColors(colorToRgba(style.blendingBackground), colorToRgba(backgroundColor));
  const interactionColor = changeColorLightness(hasProgressBar ? backgroundColor : datum.color, lightnessAmount, 0.8);
  const blendedColor = RGBATupleToString(combineColors(colorToRgba(datum.color), blendingBackgroundColor));
  const blendedInteractionColor = RGBATupleToString(
    combineColors(colorToRgba(interactionColor), blendingBackgroundColor),
  );

  const datumWithInteractionColor: MetricDatum = { ...datum, color: blendedInteractionColor };

  const event: MetricElementEvent = { type: 'metricElementEvent', rowIndex, columnIndex };

  const containerStyle: CSSProperties = {
    backgroundColor: isMetricWTrend(datumWithInteractionColor) ? backgroundColor : datumWithInteractionColor.color,
    cursor: onElementClick ? 'pointer' : DEFAULT_CSS_CURSOR,
    borderColor: style.border,
  };

  const highContrastTextColor = fillTextColor(
    backgroundColor,
    isMetricWProgress(datum) ? backgroundColor : blendedColor,
    undefined,
    contrastOptions,
  );
  let finalTextColor = highContrastTextColor.color;

  if (isMetricWTrend(datum)) {
    const { ratio, color, shade } = fillTextColor(
      backgroundColor,
      getSparkLineColor(blendedColor),
      undefined,
      contrastOptions,
    );

    // TODO verify this check is applied correctly
    if (shade !== highContrastTextColor.shade && ratio > highContrastTextColor.ratio) {
      finalTextColor = color;
    }
  }

  const onElementClickHandler = () => onElementClick && onElementClick([event]);
  const hasMouseEventsHandler = onElementOut || onElementOver || onElementClick;
  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions,jsx-a11y/click-events-have-key-events
    <div
      role="figure"
      aria-labelledby={datum.title && metricHTMLId}
      className={containerClassName}
      style={containerStyle}
      onMouseLeave={() => {
        if (hasMouseEventsHandler) setMouseState('leave');
        if (onElementOut) onElementOut();
      }}
      onMouseEnter={() => {
        if (hasMouseEventsHandler) setMouseState('enter');
        if (onElementOver) onElementOver([event]);
      }}
      onMouseDown={() => {
        if (hasMouseEventsHandler) setMouseState('down');
        setLastMouseDownTimestamp(Date.now());
      }}
      onMouseUp={() => {
        if (hasMouseEventsHandler) setMouseState('enter');
        if (Date.now() - lastMouseDownTimestamp < 200 && onElementClick) {
          onElementClickHandler();
        }
      }}
      onFocus={() => {
        if (hasMouseEventsHandler) setMouseState('enter');
      }}
      onBlur={() => {
        if (hasMouseEventsHandler) setMouseState('leave');
      }}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <MetricText
        id={metricHTMLId}
        datum={datumWithInteractionColor}
        style={style}
        onElementClick={onElementClick ? onElementClickHandler : undefined}
        progressBarSize={progressBarSize}
        highContrastTextColor={finalTextColor.keyword}
        textDimensions={textDimensions}
      />
      {isMetricWTrend(datumWithInteractionColor) && <SparkLine id={metricHTMLId} datum={datumWithInteractionColor} />}
      {isMetricWProgress(datumWithInteractionColor) && (
        <ProgressBar
          datum={datumWithInteractionColor}
          barBackground={style.barBackground}
          blendedBarColor={blendedColor}
          size={progressBarSize}
        />
      )}
      <div className="echMetric--outline" style={{ color: finalTextColor.keyword }}></div>
    </div>
  );
};
