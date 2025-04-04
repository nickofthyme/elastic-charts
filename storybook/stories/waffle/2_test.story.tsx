/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean } from '@storybook/addon-knobs';
import React from 'react';

import type { Datum } from '@elastic/charts';
import { Chart, LegendValue, Partition, PartitionLayout, Settings } from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { colorBrewerCategoricalStark9, discreteColor, productPriceLookup } from '../utils/utils';

export const Example: ChartsStory = (_, { title, description }) => {
  const useOpaqueColor = boolean('use alpha', false);
  return (
    <Chart title={title} description={description} className="story-chart">
      <Settings
        theme={{
          chartPaddings: { left: 170, right: 170, top: 70, bottom: 70 },
        }}
        baseTheme={useBaseTheme()}
        showLegend
        flatLegend
        legendValues={[LegendValue.CurrentAndLastValue]}
      />
      <Partition
        id="spec_1"
        data={[
          { products_price: 0.0, median_day_of_week_i: 13 },
          { products_price: 50.0, median_day_of_week_i: 3 },
          { products_price: 100.0, median_day_of_week_i: 4 },
          { products_price: 150.0, median_day_of_week_i: 3 },
          { products_price: 200.0, median_day_of_week_i: 4 },
          { products_price: 350.0, median_day_of_week_i: 0 },
          { products_price: 400.0, median_day_of_week_i: 0 },
          { products_price: 1050.0, median_day_of_week_i: 0 },
        ]}
        layout={PartitionLayout.waffle}
        valueAccessor={(d: Datum) => d.median_day_of_week_i as number}
        layers={[
          {
            groupByRollup: (d: Datum) => d.products_price,
            nodeLabel: (d: Datum) => productPriceLookup[d].name,
            shape: {
              fillColor: (nodeKey, sortIndex) =>
                discreteColor(colorBrewerCategoricalStark9.slice(1), useOpaqueColor ? 0.5 : 1)(sortIndex),
            },
          },
        ]}
      />
    </Chart>
  );
};
