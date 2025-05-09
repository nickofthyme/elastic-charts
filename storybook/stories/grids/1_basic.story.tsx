/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, color, number } from '@storybook/addon-knobs';
import React from 'react';

import type { GridLineStyle, PartialTheme } from '@elastic/charts';
import { Axis, BarSeries, Chart, LineSeries, Position, ScaleType, Settings } from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

function generateGridLineStyle(group: string, gridColor = 'purple'): GridLineStyle {
  const groupId = `${group} axis`;

  return {
    visible: true,
    stroke: color(`${groupId} grid line stroke color`, gridColor, groupId),
    strokeWidth: number(
      `${groupId} grid line stroke width`,
      1,
      {
        range: true,
        min: 0,
        max: 10,
        step: 1,
      },
      groupId,
    ),
    opacity: number(
      `${groupId} grid line stroke opacity`,
      1,
      {
        range: true,
        min: 0,
        max: 1,
        step: 0.01,
      },
      groupId,
    ),
    dash: [
      number(
        `${groupId} grid line dash length`,
        1,
        {
          range: true,
          min: 0,
          max: 10,
          step: 1,
        },
        groupId,
      ),
      number(
        `${groupId} grid line dash spacing`,
        1,
        {
          range: true,
          min: 0,
          max: 10,
          step: 1,
        },
        groupId,
      ),
    ],
  };
}

export const Example: ChartsStory = (_, { title, description }) => {
  const leftAxisGridLineStyle = generateGridLineStyle(Position.Left, 'lightblue');
  const rightAxisGridLineStyle = generateGridLineStyle(Position.Right, 'red');
  const topAxisGridLineStyle = generateGridLineStyle(Position.Top, 'teal');
  const bottomAxisGridLineStyle = generateGridLineStyle(Position.Bottom, 'blue');
  const toggleBottomAxisGridLineStyle = boolean('use axis gridLine vertically', false, 'bottom axis');
  const toggleHorizontalAxisGridLineStyle = boolean('use axis gridLine horizontally', false, 'left axis');
  const bottomAxisThemeGridLineStyle = generateGridLineStyle('Vertical Axis Theme', 'violet');
  const leftAxisThemeGridLineStyle = generateGridLineStyle('Horizontal Axis Theme', 'hotpink');
  const theme: PartialTheme = {
    axes: {
      gridLine: { vertical: leftAxisThemeGridLineStyle, horizontal: bottomAxisThemeGridLineStyle },
    },
  };
  const integersOnlyLeft = boolean('left axis show only integer values', false, 'left axis');
  const integersOnlyRight = boolean('right axis show only intger values', false, 'right axis');
  return (
    <Chart title={title} description={description}>
      <Settings debug={boolean('debug', false)} theme={theme} baseTheme={useBaseTheme()} />
      <Axis
        id="bottom"
        position={Position.Bottom}
        title="Bottom axis"
        showOverlappingTicks
        gridLine={{
          ...(toggleBottomAxisGridLineStyle && bottomAxisGridLineStyle),
          visible: boolean('show bottom axis grid lines', false, 'bottom axis'),
        }}
        maximumFractionDigits={boolean('bottom axis show only integer values', false, 'bottom axis') ? 0 : undefined}
      />
      <Axis
        id="left1"
        position={Position.Left}
        title="Left axis 1"
        tickFormat={integersOnlyLeft ? (d) => Number(d).toFixed(0) : (d) => Number(d).toFixed(2)}
        gridLine={{
          ...(toggleHorizontalAxisGridLineStyle && leftAxisGridLineStyle),
          visible: boolean('show left axis grid lines', false, 'left axis'),
        }}
        maximumFractionDigits={integersOnlyLeft ? 0 : undefined}
      />
      <Axis
        id="top"
        position={Position.Top}
        title="Top axis"
        showOverlappingTicks
        gridLine={{
          ...topAxisGridLineStyle,
          visible: boolean('show top axis grid lines', false, 'top axis'),
        }}
        maximumFractionDigits={boolean('top axis show only integer values', false, 'top axis') ? 0 : undefined}
      />
      <Axis
        id="right"
        title="Right axis"
        position={Position.Right}
        tickFormat={integersOnlyRight ? (d) => Number(d).toFixed(0) : (d) => Number(d).toFixed(2)}
        gridLine={{
          ...rightAxisGridLineStyle,
          visible: boolean('show right axis grid lines', false, 'right axis'),
        }}
        maximumFractionDigits={integersOnlyRight ? 0 : undefined}
      />
      <BarSeries
        id="bars"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={[
          { x: 0, y: 2 },
          { x: 1, y: 7 },
          { x: 2, y: 3 },
          { x: 3, y: 6 },
        ]}
      />
      <LineSeries
        id="lines"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        groupId="group2"
        xAccessor="x"
        yAccessors={['y']}
        stackAccessors={['x']}
        data={[
          { x: 0, y: 3 },
          { x: 1, y: 2 },
          { x: 2, y: 4 },
          { x: 3, y: 10 },
        ]}
      />
    </Chart>
  );
};
