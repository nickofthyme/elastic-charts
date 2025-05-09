/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';
import type { Store } from 'redux';

import type { AnnotationLineProps } from './types';
import { MockAnnotationLineProps } from '../../../../mocks/annotations/annotations';
import { MockAnnotationSpec, MockGlobalSpec, MockSeriesSpec } from '../../../../mocks/specs';
import { MockStore } from '../../../../mocks/store';
import { ScaleType } from '../../../../scales/constants';
import type { GlobalChartState } from '../../../../state/chart_state';
import { Position } from '../../../../utils/common';
import { DEFAULT_ANNOTATION_LINE_STYLE } from '../../../../utils/themes/merge_utils';
import { computeAnnotationDimensionsSelector } from '../../state/selectors/compute_annotations';
import { AnnotationDomainType } from '../../utils/specs';

describe('annotation marker', () => {
  const id = 'foo-line';
  const spec = MockSeriesSpec.line({
    xScaleType: ScaleType.Linear,
    yScaleType: ScaleType.Linear,
    data: [
      { x: 0, y: 0 },
      { x: 10, y: 10 },
    ],
  });
  const lineYDomainAnnotation = MockAnnotationSpec.line({
    id,
    domainType: AnnotationDomainType.YDomain,
    dataValues: [{ dataValue: 2, details: 'foo' }],
    style: DEFAULT_ANNOTATION_LINE_STYLE,
    marker: <div />,
  });

  const lineXDomainAnnotation = MockAnnotationSpec.line({
    id,
    domainType: AnnotationDomainType.XDomain,
    dataValues: [{ dataValue: 2, details: 'foo' }],
    style: DEFAULT_ANNOTATION_LINE_STYLE,
    marker: <div />,
  });

  let store: Store<GlobalChartState>;
  beforeEach(() => {
    store = MockStore.default({ width: 100, height: 100, top: 0, left: 0 });
  });

  test('should compute line annotation dimensions with marker if defined (y domain)', () => {
    MockStore.addSpecs(
      [
        spec,
        MockGlobalSpec.settingsNoMargins(),
        MockGlobalSpec.yAxis({ position: Position.Left, hide: true }),
        lineYDomainAnnotation,
      ],
      store,
    );

    const dimensions = computeAnnotationDimensionsSelector(store.getState());

    const expectedDimensions: AnnotationLineProps[] = [
      MockAnnotationLineProps.default({
        linePathPoints: {
          x1: 0,
          y1: 80,
          x2: 100,
          y2: 80,
        },
        specId: 'foo-line',
        datum: { dataValue: 2, details: 'foo' },
        markers: [
          {
            icon: <div />,
            color: '#777',
            position: { left: -0, top: 80 },
            alignment: 'left',
          },
        ],
      }),
    ];
    expect(dimensions.get(id)).toEqual(expectedDimensions);
  });

  test('should compute line annotation dimensions with marker if defined (y domain: 180 deg rotation)', () => {
    MockStore.addSpecs(
      [
        spec,
        MockGlobalSpec.settingsNoMargins({ rotation: 180 }),
        MockGlobalSpec.yAxis({ position: Position.Left, hide: true }),
        lineYDomainAnnotation,
      ],
      store,
    );

    const dimensions = computeAnnotationDimensionsSelector(store.getState());

    // we should always consider that the line, contrary to the marker
    // is always rotated, if specified, at rendering time,
    // so this position at 80 pixel right now, is a 20 pixel from top
    // when rotated 180 degrees
    const expectedDimensions: AnnotationLineProps[] = [
      MockAnnotationLineProps.default({
        linePathPoints: {
          x1: 0,
          y1: 80,
          x2: 100,
          y2: 80,
        },
        specId: 'foo-line',
        datum: { dataValue: 2, details: 'foo' },
        markers: [
          {
            icon: <div />,
            color: '#777',
            position: { left: -0, top: 20 },
            alignment: 'left',
          },
        ],
      }),
    ];
    expect(dimensions.get(id)).toEqual(expectedDimensions);
  });

  test('should compute line annotation dimensions with marker if defined (x domain)', () => {
    MockStore.addSpecs(
      [spec, MockGlobalSpec.settingsNoMargins(), MockGlobalSpec.xAxis({ hide: true }), lineXDomainAnnotation],
      store,
    );

    const dimensions = computeAnnotationDimensionsSelector(store.getState());

    const expectedDimensions: AnnotationLineProps[] = [
      MockAnnotationLineProps.default({
        specId: 'foo-line',
        datum: { dataValue: 2, details: 'foo' },
        linePathPoints: {
          x1: 20,
          y1: 0,
          x2: 20,
          y2: 100,
        },
        markers: [
          {
            icon: <div />,
            color: '#777',
            position: { top: 100, left: 20 },
            alignment: 'bottom',
          },
        ],
      }),
    ];
    expect(dimensions.get(id)).toEqual(expectedDimensions);
  });
});
