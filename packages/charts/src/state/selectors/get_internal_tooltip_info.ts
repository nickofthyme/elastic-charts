/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getInternalChartStateSelector } from './get_internal_chart_state';
import type { TooltipInfo } from '../../components/tooltip/types';
import type { GlobalChartState } from '../chart_state';
import { createCustomCachedSelector } from '../create_selector';

/** @internal */
export const getInternalTooltipInfoSelector = createCustomCachedSelector(
  [(globalChartState: GlobalChartState) => globalChartState, getInternalChartStateSelector],
  (globalChartState, internalChartState): TooltipInfo | undefined => {
    if (internalChartState) {
      return internalChartState.getTooltipInfo(globalChartState);
    }
  },
);
