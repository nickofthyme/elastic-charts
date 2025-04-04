/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { RefObject } from 'react';
import React from 'react';
import { connect } from 'react-redux';

import type { RgbaTuple } from '../../common/color_library_wrappers';
import { Colors } from '../../common/colors';
import { clearCanvas, withContext, withClip } from '../../renderers/canvas';
import { renderRect } from '../../renderers/canvas/primitives/rect';
import type { GlobalChartState } from '../../state/chart_state';
import { getInternalChartStateSelector } from '../../state/selectors/get_internal_chart_state';
import { getInternalIsInitializedSelector, InitStatus } from '../../state/selectors/get_internal_is_intialized';
import type { Dimensions } from '../../utils/dimensions';

interface StateProps {
  initialized: boolean;
  mainProjectionArea: Dimensions;
  projectionContainer: Dimensions;
  isBrushing: boolean | undefined;
  isBrushAvailable: boolean | undefined;
  brushEvent: Dimensions | null;
  zIndex: number;
}

// todo move this to theme
const DEFAULT_FILL_COLOR: RgbaTuple = [128, 128, 128, 0.6];

class BrushToolComponent extends React.Component<StateProps> {
  static displayName = 'BrushTool';

  private readonly devicePixelRatio: number;

  private ctx: CanvasRenderingContext2D | null;

  private canvasRef: RefObject<HTMLCanvasElement>;

  constructor(props: Readonly<StateProps>) {
    super(props);
    this.ctx = null;
    this.devicePixelRatio = window.devicePixelRatio;
    this.canvasRef = React.createRef();
  }

  componentDidMount() {
    /*
     * the DOM element has just been appended, and getContext('2d') is always non-null,
     * so we could use a couple of ! non-null assertions but no big plus
     */
    this.tryCanvasContext();
    this.drawCanvas();
  }

  componentDidUpdate() {
    if (!this.ctx) {
      this.tryCanvasContext();
    }
    if (this.props.initialized) {
      this.drawCanvas();
    }
  }

  render() {
    const { initialized, isBrushAvailable, isBrushing, projectionContainer, zIndex } = this.props;
    if (!initialized || !isBrushAvailable || !isBrushing) {
      this.ctx = null;
      return null;
    }
    const { width, height } = projectionContainer;
    return (
      <canvas
        ref={this.canvasRef}
        className="echBrushTool"
        width={width * this.devicePixelRatio}
        height={height * this.devicePixelRatio}
        style={{
          width,
          height,
          zIndex,
        }}
      />
    );
  }

  private drawCanvas = () => {
    const { brushEvent, mainProjectionArea } = this.props;

    const { ctx } = this;
    if (!ctx || !brushEvent) {
      return;
    }
    const { top, left, width, height } = brushEvent;
    withContext(ctx, () => {
      ctx.scale(this.devicePixelRatio, this.devicePixelRatio);
      withClip(
        ctx,
        {
          x: mainProjectionArea.left,
          y: mainProjectionArea.top,
          width: mainProjectionArea.width,
          height: mainProjectionArea.height,
        },
        () => {
          clearCanvas(ctx, Colors.Transparent.keyword);
          ctx.translate(mainProjectionArea.left, mainProjectionArea.top);
          renderRect(
            ctx,
            { x: left, y: top, width, height },
            { color: DEFAULT_FILL_COLOR },
            { width: 0, color: Colors.Transparent.rgba },
          );
        },
      );
    });
  };

  private tryCanvasContext() {
    const canvas = this.canvasRef.current;
    this.ctx = canvas && canvas.getContext('2d');
  }
}

const mapStateToProps = (state: GlobalChartState): StateProps => {
  const internalChartState = getInternalChartStateSelector(state);
  if (internalChartState === null || getInternalIsInitializedSelector(state) !== InitStatus.Initialized) {
    return {
      initialized: false,
      projectionContainer: {
        width: 0,
        height: 0,
        left: 0,
        top: 0,
      },
      mainProjectionArea: {
        top: 0,
        left: 0,
        width: 0,
        height: 0,
      },
      isBrushing: false,
      isBrushAvailable: false,
      brushEvent: null,
      zIndex: 0,
    };
  }
  return {
    initialized: state.specsInitialized,
    projectionContainer: internalChartState.getProjectionContainerArea(state),
    mainProjectionArea: internalChartState.getMainProjectionArea(state),
    isBrushAvailable: internalChartState.isBrushAvailable(state),
    isBrushing: internalChartState.isBrushing(state),
    brushEvent: internalChartState.getBrushArea(state),
    zIndex: state.zIndex,
  };
};

/** @internal */
export const BrushTool = connect(mapStateToProps)(BrushToolComponent);
