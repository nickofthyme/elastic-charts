/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { boolean } from '@storybook/addon-knobs';
import React from 'react';

import type { Datum, PrimitiveValue, PartialTheme } from '@elastic/charts';
import { Chart, Partition, PartitionLayout, Settings } from '@elastic/charts';
import data from '@elastic/charts/src/mocks/hierarchical/cpu_profile_tree_mock.json';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { discreteColor, viridis18 as palette } from '../utils/utils';

const color = palette.slice().reverse();

const getLayerSpec = (maxDepth: number = 30) =>
  [...new Array(maxDepth + 1)].map((_, depth) => ({
    groupByRollup: (d: Datum) => data.dictionary[d.layers[depth]],
    nodeLabel: (d: PrimitiveValue) => `${String(d)}/`,
    showAccessor: (d: PrimitiveValue) => d !== undefined,
    shape: {
      fillColor: () => discreteColor(color, 0.8)(depth),
    },
  }));

export const Example: ChartsStory = (_, { title, description }) => {
  const onElementListeners = {
    onElementClick: action('onElementClick'),
    onElementOver: action('onElementOver'),
    onElementOut: action('onElementOut'),
  };
  const clipText = boolean("Allow, and clip, texts that wouldn't otherwise fit", true);
  const theme: PartialTheme = {
    partition: {
      fillLabel: {
        clipText,
        padding: 0,
      },
      minFontSize: clipText ? 9 : 6,
      maxFontSize: clipText ? 9 : 20,
    },
  };
  return (
    <Chart title={title} description={description}>
      <Settings theme={theme} baseTheme={useBaseTheme()} {...onElementListeners} />
      <Partition
        id="spec_1"
        data={data.facts}
        layout={PartitionLayout.icicle}
        valueAccessor={(d: Datum) => d.value as number}
        valueFormatter={() => ''}
        layers={getLayerSpec()}
        drilldown
        maxRowCount={1}
        animation={{
          duration: 500,
        }}
      />
    </Chart>
  );
};
