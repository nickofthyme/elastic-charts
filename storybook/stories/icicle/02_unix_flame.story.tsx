/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import type { Datum } from '@elastic/charts';
import { Chart, LegendStrategy, Partition, PartitionLayout, Settings } from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { getFlatData, getLayerSpec, maxDepth } from '../utils/hierarchical_input_utils';
import { plasma18 as palette } from '../utils/utils';

const color = [...palette].reverse();

export const Example: ChartsStory = (_, { title, description }) => {
  return (
    <Chart title={title} description={description}>
      <Settings
        showLegend
        flatLegend
        legendPosition="right"
        legendStrategy={LegendStrategy.PathWithDescendants}
        legendMaxDepth={maxDepth}
        baseTheme={useBaseTheme()}
        theme={{
          partition: {
            minFontSize: 6,
            maxFontSize: 10,
          },
        }}
      />
      <Partition
        id="spec_1"
        data={getFlatData()}
        layout={PartitionLayout.flame}
        valueAccessor={(d: Datum) => d.value}
        valueFormatter={() => ''}
        layers={getLayerSpec(color)}
      />
    </Chart>
  );
};
