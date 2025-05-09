/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { coerceYScaleTypes, groupSeriesByYGroup } from './y_domain';
import { ChartType } from '../..';
import { MockSeriesSpec, MockGlobalSpec } from '../../../mocks/specs';
import { MockStore } from '../../../mocks/store';
import { MockYDomain } from '../../../mocks/xy/domains';
import { ScaleType } from '../../../scales/constants';
import { SpecType } from '../../../specs/spec_type'; // kept as long-winded import on separate line otherwise import circularity emerges
import { BARCHART_1Y0G } from '../../../utils/data_samples/test_dataset';
import { Logger } from '../../../utils/logger';
import { computeSeriesDomainsSelector } from '../state/selectors/compute_series_domains';
import type { BasicSeriesSpec } from '../utils/specs';
import { SeriesType, DEFAULT_GLOBAL_ID, StackMode } from '../utils/specs';

jest.mock('../../../utils/logger', () => ({
  Logger: {
    warn: jest.fn(),
  },
}));

const DEMO_AREA_SPEC_1 = {
  id: 'a',
  groupId: 'a',
  yAccessors: ['y1'],
  stackAccessors: ['x'],
  splitSeriesAccessors: ['g'],
  yScaleType: ScaleType.Linear,
  data: [
    { x: 1, y1: 2, g: 'a' },
    { x: 2, y1: 2, g: 'a' },
    { x: 3, y1: 2, g: 'a' },
    { x: 4, y1: 5, g: 'a' },

    { x: 1, y1: 2, g: 'b' },
    { x: 4, y1: 7, g: 'b' },
  ],
};
const DEMO_AREA_SPEC_2 = {
  id: 'b',
  yAccessors: ['y1'],
  yScaleType: ScaleType.Log,
  data: [
    { x: 1, y1: 10 },
    { x: 2, y1: 10 },
    { x: 3, y1: 2 },
    { x: 4, y1: 5 },
  ],
};

describe('Y Domain', () => {
  test('Should merge Y domain for non zero baseline charts', () => {
    const store = MockStore.default();
    MockStore.addSpecs(
      [
        MockGlobalSpec.yAxis({
          id: 'y',
          domain: { fit: true },
        }),
        MockSeriesSpec.line({
          ...DEMO_AREA_SPEC_1,
          groupId: DEFAULT_GLOBAL_ID,
        }),
      ],
      store,
    );
    const { yDomains } = computeSeriesDomainsSelector(store.getState());

    expect(yDomains).toEqual([
      MockYDomain.fromScaleType(ScaleType.Linear, {
        groupId: DEFAULT_GLOBAL_ID,
        domain: [2, 12],
        isBandScale: false,
      }),
    ]);
  });
  test('Should merge Y domain for zero baseline charts', () => {
    const store = MockStore.default();
    MockStore.addSpecs(
      [
        MockGlobalSpec.yAxis({
          id: 'y',
          domain: { fit: true },
        }),
        MockSeriesSpec.area({
          ...DEMO_AREA_SPEC_1,
          groupId: DEFAULT_GLOBAL_ID,
        }),
      ],
      store,
    );
    const { yDomains } = computeSeriesDomainsSelector(store.getState());

    expect(yDomains).toEqual([
      MockYDomain.fromScaleType(ScaleType.Linear, {
        groupId: DEFAULT_GLOBAL_ID,
        domain: [0, 12],
        isBandScale: false,
      }),
    ]);
  });
  test('Should merge Y domain different group', () => {
    const store = MockStore.default();
    MockStore.addSpecs(
      [
        MockGlobalSpec.yAxis({
          id: 'y a',
          groupId: 'a',
          domain: { fit: true },
        }),
        MockGlobalSpec.yAxis({
          id: 'y b',
          groupId: 'b',
          domain: { fit: true },
        }),
        MockSeriesSpec.line(DEMO_AREA_SPEC_1),
        MockSeriesSpec.line({
          ...DEMO_AREA_SPEC_2,
          groupId: 'b',
        }),
      ],
      store,
    );
    const { yDomains } = computeSeriesDomainsSelector(store.getState());

    expect(yDomains).toEqual([
      MockYDomain.fromScaleType(ScaleType.Linear, {
        groupId: 'a',
        domain: [2, 12],
        isBandScale: false,
      }),
      MockYDomain.fromScaleType(ScaleType.Log, {
        groupId: 'b',
        domain: [2, 10],
        isBandScale: false,
      }),
    ]);
  });
  test('Should merge Y domain same group all stacked', () => {
    const store = MockStore.default();
    MockStore.addSpecs(
      [
        MockGlobalSpec.yAxis({
          id: 'y a',
          groupId: 'a',
          domain: { fit: true },
        }),
        MockSeriesSpec.area(DEMO_AREA_SPEC_1),
        MockSeriesSpec.area({
          ...DEMO_AREA_SPEC_2,
          groupId: 'a',
          stackAccessors: ['x'],
        }),
      ],
      store,
    );
    const { yDomains } = computeSeriesDomainsSelector(store.getState());

    expect(yDomains).toEqual([
      MockYDomain.fromScaleType(ScaleType.Linear, {
        groupId: 'a',
        domain: [0, 17],
        isBandScale: false,
      }),
    ]);
  });
  test('Should merge Y domain same group partially stacked', () => {
    const store = MockStore.default();
    MockStore.addSpecs(
      [
        MockGlobalSpec.yAxis({
          id: 'y a',
          groupId: 'a',
          domain: { fit: true },
        }),
        MockSeriesSpec.area(DEMO_AREA_SPEC_1),
        MockSeriesSpec.area({
          ...DEMO_AREA_SPEC_2,
          groupId: 'a',
        }),
      ],
      store,
    );
    const { yDomains } = computeSeriesDomainsSelector(store.getState());
    expect(yDomains).toEqual([
      MockYDomain.fromScaleType(ScaleType.Linear, {
        groupId: 'a',
        domain: [0, 12],
        isBandScale: false,
      }),
    ]);
  });

  test('Should split specs by groupId, two groups, non stacked', () => {
    const spec1: BasicSeriesSpec = {
      chartType: ChartType.XYAxis,
      specType: SpecType.Series,
      id: 'spec1',
      groupId: 'group1',
      seriesType: SeriesType.Line,
      yScaleType: ScaleType.Log,
      xScaleType: ScaleType.Linear,
      xAccessor: 'x',
      yAccessors: ['y'],
      data: BARCHART_1Y0G,
    };
    const spec2: BasicSeriesSpec = {
      chartType: ChartType.XYAxis,
      specType: SpecType.Series,
      id: 'spec2',
      groupId: 'group2',
      seriesType: SeriesType.Line,
      yScaleType: ScaleType.Log,
      xScaleType: ScaleType.Linear,
      xAccessor: 'x',
      yAccessors: ['y'],
      data: BARCHART_1Y0G,
    };
    const splitSpecs = groupSeriesByYGroup([spec1, spec2]);
    const groupKeys = [...splitSpecs.keys()];
    const groupValues = [...splitSpecs.values()];
    expect(groupKeys).toEqual(['group1', 'group2']);
    expect(groupValues.length).toBe(2);
    expect(groupValues[0]?.nonStacked).toEqual([spec1]);
    expect(groupValues[1]?.nonStacked).toEqual([spec2]);
    expect(groupValues[0]?.stacked).toEqual([]);
    expect(groupValues[1]?.stacked).toEqual([]);
  });
  test('Should split specs by groupId, two groups, stacked', () => {
    const spec1: BasicSeriesSpec = {
      chartType: ChartType.XYAxis,
      specType: SpecType.Series,
      id: 'spec1',
      groupId: 'group1',
      seriesType: SeriesType.Line,
      yScaleType: ScaleType.Log,
      xScaleType: ScaleType.Linear,
      xAccessor: 'x',
      yAccessors: ['y'],
      stackAccessors: ['x'],
      data: BARCHART_1Y0G,
    };
    const spec2: BasicSeriesSpec = {
      chartType: ChartType.XYAxis,
      specType: SpecType.Series,
      id: 'spec2',
      groupId: 'group2',
      seriesType: SeriesType.Line,
      yScaleType: ScaleType.Log,
      xScaleType: ScaleType.Linear,
      xAccessor: 'x',
      yAccessors: ['y'],
      stackAccessors: ['x'],
      data: BARCHART_1Y0G,
    };
    const splitSpecs = groupSeriesByYGroup([spec1, spec2]);
    const groupKeys = [...splitSpecs.keys()];
    const groupValues = [...splitSpecs.values()];
    expect(groupKeys).toEqual(['group1', 'group2']);
    expect(groupValues.length).toBe(2);
    expect(groupValues[0]?.stacked).toEqual([spec1]);
    expect(groupValues[1]?.stacked).toEqual([spec2]);
    expect(groupValues[0]?.nonStacked).toEqual([]);
    expect(groupValues[1]?.nonStacked).toEqual([]);
  });
  test('Should split specs by groupId, 1 group, stacked', () => {
    const spec1: BasicSeriesSpec = {
      chartType: ChartType.XYAxis,
      specType: SpecType.Series,
      id: 'spec1',
      groupId: 'group',
      seriesType: SeriesType.Line,
      yScaleType: ScaleType.Log,
      xScaleType: ScaleType.Linear,
      xAccessor: 'x',
      yAccessors: ['y'],
      stackAccessors: ['x'],
      data: BARCHART_1Y0G,
    };
    const spec2: BasicSeriesSpec = {
      chartType: ChartType.XYAxis,
      specType: SpecType.Series,
      id: 'spec2',
      groupId: 'group',
      seriesType: SeriesType.Line,
      yScaleType: ScaleType.Log,
      xScaleType: ScaleType.Linear,
      xAccessor: 'x',
      yAccessors: ['y'],
      stackAccessors: ['x'],
      data: BARCHART_1Y0G,
    };
    const splitSpecs = groupSeriesByYGroup([spec1, spec2]);
    const groupKeys = [...splitSpecs.keys()];
    const groupValues = [...splitSpecs.values()];
    expect(groupKeys).toEqual(['group']);
    expect(groupValues.length).toBe(1);
    expect(groupValues[0]?.stacked).toEqual([spec1, spec2]);
    expect(groupValues[0]?.nonStacked).toEqual([]);
  });
  test('Should 3 split specs by groupId, 2 group, semi/stacked', () => {
    const spec1: BasicSeriesSpec = {
      chartType: ChartType.XYAxis,
      specType: SpecType.Series,
      id: 'spec1',
      groupId: 'group1',
      seriesType: SeriesType.Line,
      yScaleType: ScaleType.Log,
      xScaleType: ScaleType.Linear,
      xAccessor: 'x',
      yAccessors: ['y'],
      stackAccessors: ['x'],
      data: BARCHART_1Y0G,
    };
    const spec2: BasicSeriesSpec = {
      chartType: ChartType.XYAxis,
      specType: SpecType.Series,
      id: 'spec2',
      groupId: 'group1',
      seriesType: SeriesType.Line,
      yScaleType: ScaleType.Log,
      xScaleType: ScaleType.Linear,
      xAccessor: 'x',
      yAccessors: ['y'],
      stackAccessors: ['x'],
      data: BARCHART_1Y0G,
    };
    const spec3: BasicSeriesSpec = {
      chartType: ChartType.XYAxis,
      specType: SpecType.Series,
      id: 'spec3',
      groupId: 'group2',
      seriesType: SeriesType.Line,
      yScaleType: ScaleType.Log,
      xScaleType: ScaleType.Linear,
      xAccessor: 'x',
      yAccessors: ['y'],
      stackAccessors: ['x'],
      data: BARCHART_1Y0G,
    };
    const splitSpecs = groupSeriesByYGroup([spec1, spec2, spec3]);
    const groupKeys = [...splitSpecs.keys()];
    const groupValues = [...splitSpecs.values()];
    expect(groupKeys).toEqual(['group1', 'group2']);
    expect(groupValues.length).toBe(2);
    expect(groupValues[0]?.stacked).toEqual([spec1, spec2]);
    expect(groupValues[0]?.nonStacked).toEqual([]);
    expect(groupValues[1]?.stacked).toEqual([spec3]);
    expect(groupValues[0]?.nonStacked).toEqual([]);
  });

  test('Should return a default Scale Linear for YScaleType when there are no specs', () => {
    expect(coerceYScaleTypes([]).type).toEqual(ScaleType.Linear);
  });

  test('Should merge Y domain accounting for custom domain limits: complete bounded domain', () => {
    const store = MockStore.default();
    MockStore.addSpecs(
      [
        MockGlobalSpec.yAxis({
          id: 'y a',
          groupId: 'a',
          domain: { min: 0, max: 20, fit: true },
        }),
        MockSeriesSpec.area(DEMO_AREA_SPEC_1),
      ],
      store,
    );
    const { yDomains } = computeSeriesDomainsSelector(store.getState());

    expect(yDomains).toEqual([
      MockYDomain.fromScaleType(ScaleType.Linear, {
        groupId: 'a',
        domain: [0, 20],
        isBandScale: false,
      }),
    ]);
  });
  test('Should merge Y domain accounting for custom domain limits: partial lower bounded domain', () => {
    const store = MockStore.default();
    MockStore.addSpecs(
      [
        MockGlobalSpec.yAxis({
          id: 'y a',
          groupId: 'a',
          domain: { min: 0, fit: true },
        }),
        MockSeriesSpec.area(DEMO_AREA_SPEC_1),
      ],
      store,
    );
    const { yDomains } = computeSeriesDomainsSelector(store.getState());

    expect(yDomains).toEqual([
      MockYDomain.fromScaleType(ScaleType.Linear, {
        groupId: 'a',
        domain: [0, 12],
        isBandScale: false,
      }),
    ]);
  });
  test('Should not merge Y domain with invalid custom domain limits: partial lower bounded domain', () => {
    const store = MockStore.default();
    MockStore.addSpecs(
      [
        MockGlobalSpec.yAxis({
          id: 'y a',
          groupId: 'a',
          domain: { min: 20, fit: true },
        }),
        MockSeriesSpec.area(DEMO_AREA_SPEC_1),
      ],
      store,
    );

    const { yDomains } = computeSeriesDomainsSelector(store.getState());
    expect(yDomains[0]?.domain).toEqual([20, 20]);

    const warnMessage = 'custom yDomain for a is invalid, custom min is greater than computed max.';
    expect(Logger.warn).toHaveBeenCalledWith(warnMessage);
  });
  test('Should merge Y domain accounting for custom domain limits: partial upper bounded domain', () => {
    const store = MockStore.default();
    MockStore.addSpecs(
      [
        MockGlobalSpec.yAxis({
          id: 'y a',
          groupId: 'a',
          domain: { max: 20, fit: true },
        }),
        MockSeriesSpec.line(DEMO_AREA_SPEC_1),
      ],
      store,
    );

    const { yDomains } = computeSeriesDomainsSelector(store.getState());
    expect(yDomains).toEqual([
      MockYDomain.fromScaleType(ScaleType.Linear, {
        groupId: 'a',
        domain: [2, 20],
        isBandScale: false,
      }),
    ]);
  });
  test('Should not merge Y domain with invalid custom domain limits: partial upper bounded domain', () => {
    const store = MockStore.default();
    MockStore.addSpecs(
      [
        MockGlobalSpec.yAxis({
          id: 'y a',
          groupId: 'a',
          domain: { max: -1, fit: true },
        }),
        MockSeriesSpec.area(DEMO_AREA_SPEC_1),
      ],
      store,
    );

    const { yDomains } = computeSeriesDomainsSelector(store.getState());
    expect(yDomains[0]?.domain).toEqual([-1, -1]);

    const warnMessage = 'custom yDomain for a is invalid, custom max is less than computed max.';
    expect(Logger.warn).toHaveBeenCalledWith(warnMessage);
  });
  test('Should merge Y domain with stacked as percentage', () => {
    const store = MockStore.default();
    MockStore.addSpecs(
      [
        MockSeriesSpec.area({
          ...DEMO_AREA_SPEC_1,
          stackMode: StackMode.Percentage,
        }),
        MockSeriesSpec.area({
          ...DEMO_AREA_SPEC_2,
          groupId: 'a',
        }),
      ],
      store,
    );

    const { yDomains } = computeSeriesDomainsSelector(store.getState());
    expect(yDomains).toEqual([
      MockYDomain.fromScaleType(ScaleType.Linear, {
        groupId: 'a',
        domain: [0, 1],
        isBandScale: false,
      }),
    ]);
  });
  test('Should merge Y domain with as percentage regadless of custom domains', () => {
    const store = MockStore.default();
    MockStore.addSpecs(
      [
        MockGlobalSpec.yAxis({
          id: 'y a',
          groupId: 'a',
          domain: { min: 2, max: 20, fit: true },
        }),
        MockSeriesSpec.area({
          ...DEMO_AREA_SPEC_1,
          stackMode: StackMode.Percentage,
        }),
      ],
      store,
    );
    const { yDomains } = computeSeriesDomainsSelector(store.getState());
    expect(yDomains).toEqual([
      MockYDomain.fromScaleType(ScaleType.Linear, {
        groupId: 'a',
        domain: [0, 1],
        isBandScale: false,
      }),
    ]);
  });
});
