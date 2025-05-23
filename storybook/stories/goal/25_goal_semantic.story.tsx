/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import type { Color, BandFillColorAccessorInput } from '@elastic/charts';
import { Chart, Goal, Settings } from '@elastic/charts';
import { GoalSubtype } from '@elastic/charts/src/chart_types/goal_chart/specs/constants';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { getBandFillColorFn } from '../utils/utils';

const subtype = GoalSubtype.Goal;

export const Example: ChartsStory = (_, { title, description }) => {
  const bandLabels = ['freezing', 'chilly', 'brisk'];
  const bands = [200, 250, 300];

  const opacityMap: { [k: string]: number } = {
    '200': 0.2,
    '250': 0.12,
    '300': 0.05,
  };

  const colorMap: { [k: number]: Color } = bands.reduce<{ [k: number]: Color }>((acc, band) => {
    const defaultValue = opacityMap[band];
    acc[band] = `rgba(0, 0, 0, ${defaultValue.toFixed(2)})`;
    return acc;
  }, {});

  const getBandFillColor = getBandFillColorFn(colorMap);

  return (
    <Chart title={title} description={description} className="story-chart">
      <Settings baseTheme={useBaseTheme()} />
      <Goal
        id="spec_1"
        subtype={subtype}
        base={0}
        target={260}
        actual={170}
        domain={{ min: 0, max: 300 }}
        bands={bands}
        ticks={[0, 50, 100, 150, 200, 250, 300]}
        tickValueFormatter={({ value }: BandFillColorAccessorInput) => String(value)}
        bandFillColor={getBandFillColor}
        labelMajor="Revenue 2020 YTD  "
        labelMinor="(thousand USD)  "
        centralMajor="170"
        centralMinor=""
        angleStart={Math.PI}
        angleEnd={0}
        bandLabels={bandLabels}
      />
    </Chart>
  );
};
