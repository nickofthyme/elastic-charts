/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { color } from '@storybook/addon-knobs';
import React from 'react';

import type { Datum, PartialTheme } from '@elastic/charts';
import { Chart, Partition, PartitionLayout, Settings, defaultPartitionValueFormatter } from '@elastic/charts';
import { mocks } from '@elastic/charts/src/mocks/hierarchical';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { indexInterpolatedFillColor, interpolatorCET2s, productLookup } from '../utils/utils';

export const Example: ChartsStory = (_, { title, description }) => {
  const theme: PartialTheme = {
    partition: {
      linkLabel: { maximumSection: Infinity, maxCount: 0 },
      sectorLineWidth: 10,
      sectorLineStroke: color('sectorLineStroke', 'lightgrey'),
      outerSizeRatio: 1,
    },
  };

  return (
    <Chart title={title} description={description}>
      <Settings theme={theme} baseTheme={useBaseTheme()} />
      <Partition
        id="spec_1"
        data={mocks.pie}
        layout={PartitionLayout.sunburst}
        valueAccessor={(d: Datum) => d.exportVal as number}
        valueFormatter={(d: number) => `$${defaultPartitionValueFormatter(Math.round(d / 1000000000))}\u00A0Bn`}
        layers={[
          {
            groupByRollup: (d: Datum) => d.sitc1,
            nodeLabel: (d: Datum) => productLookup[d].name,
            shape: {
              fillColor: (key, sortIndex, node, tree) =>
                indexInterpolatedFillColor(interpolatorCET2s(0.8))(null, sortIndex, tree),
            },
          },
        ]}
      />
    </Chart>
  );
};
