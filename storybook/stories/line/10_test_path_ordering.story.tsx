/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean } from '@storybook/addon-knobs';
import { shuffle } from 'lodash';
import React from 'react';

import { Axis, LineSeries, Chart, Position, ScaleType, Settings, Direction } from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

/**
 * Data to defined consistent order of series when using shuffle
 */
const data1 = [
  // DestAirportID: Descending	Carrier: Descending	Max AvgTicketPrice	Average AvgTicketPrice	Test
  { x: 'XIY', g: 'JetBeats', y1: 1195.87316894531, y2: 735.960746071555, z: 735.960746071555 },
  { x: 'XIY', g: 'Kibana Airlines', y1: 1079.14624023438, y2: 742.831329345703, z: 742.831329345703 },
  { x: 'XIY', g: 'ES-Air', y1: 929.561462402344, y2: 765.738806152344, z: 765.738806152344 },
  { x: 'XIY', g: 'Logstash Airways', y1: 836.307922363281, y2: 487.398278808594, z: 487.398278808594 },
];

const data2 = [
  { x: 'XHBU', g: 'JetBeats', y1: 1193.38342285156, y2: 702.543407440186, z: 702.543407440186 },
  { x: 'XHBU', g: 'Kibana Airlines', y1: 1159.03503417969, y2: 606.558886210124, z: 606.558886210124 },
  { x: 'XHBU', g: 'ES-Air', y1: 996.849731445313, y2: 752.394683837891, z: 752.394683837891 },
  { x: 'XHBU', g: 'Logstash Airways', y1: 909.167602539063, y2: 564.171913146973, z: 564.171913146973 },
  { x: 'NGO', g: 'ES-Air', y1: 1189.08776855469, y2: 1189.08776855469, z: 1189.08776855469 },
  { x: 'SCL', g: 'Logstash Airways', y1: 1176.63818359375, y2: 1031.0576171875, z: 1031.0576171875 },
  { x: 'VE05', g: 'Kibana Airlines', y1: 1189.53845214844, y2: 563.195382859972, z: 563.195382859972 },
  { x: 'VE05', g: 'Logstash Airways', y1: 998.839538574219, y2: 467.636221313477, z: 467.636221313477 },
  { x: 'VE05', g: 'JetBeats', y1: 900.798461914063, y2: 569.146169026693, z: 569.146169026693 },
  { x: 'VE05', g: 'ES-Air', y1: 820.462463378906, y2: 541.392608642578, z: 541.392608642578 },
];

export const Example: ChartsStory = (_, { title, description }) => {
  const orderOrdinalBinsBy = boolean('enable orderOrdinalBinsBy', true);

  return (
    <Chart title={title} description={description}>
      <Settings
        baseTheme={useBaseTheme()}
        orderOrdinalBinsBy={
          orderOrdinalBinsBy
            ? {
                direction: Direction.Descending,
              }
            : undefined
        }
      />
      <Axis id="bottom" position={Position.Bottom} showOverlappingTicks />
      <Axis id="left2" position={Position.Left} tickFormat={(d: any) => `$${Number(d).toFixed(2)}`} />

      <LineSeries
        id="bars1"
        fit="linear"
        xScaleType={ScaleType.Ordinal}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y1', 'y2']}
        splitSeriesAccessors={['g']}
        stackAccessors={boolean('Stacked', true) ? ['g'] : undefined}
        data={[...data1, ...(orderOrdinalBinsBy ? shuffle(data2) : data2)]}
      />
    </Chart>
  );
};
