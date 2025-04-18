/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ChartType } from '../../..';
import { SpecType } from '../../../../specs/spec_type'; // kept as long-winded import on separate line otherwise import circularity emerges
import { getSpecsByType } from '../../../../state/selectors/get_specs_by_type';
import type { MetricSpec } from '../../specs';

/** @internal */
export const getMetricSpecs = getSpecsByType<MetricSpec>(ChartType.Metric, SpecType.Series);
