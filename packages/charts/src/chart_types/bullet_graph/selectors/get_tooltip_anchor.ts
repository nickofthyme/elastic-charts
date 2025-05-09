/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { AnchorPosition } from '../../../components/portal';
import { createCustomCachedSelector } from '../../../state/create_selector';
import { getActivePointerPosition } from '../../../state/selectors/get_active_pointer_position';

/** @internal */
export const getTooltipAnchor = createCustomCachedSelector(
  [getActivePointerPosition],
  (pointer): AnchorPosition | null => {
    return {
      x: pointer?.x ?? 0,
      y: pointer?.y ?? 0,
      width: 0,
      height: 0,
    };
  },
);
