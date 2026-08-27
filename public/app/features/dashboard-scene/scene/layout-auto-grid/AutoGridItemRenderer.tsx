import { css, cx } from '@emotion/css';
import { memo, useMemo } from 'react';

import { type GrafanaTheme2 } from '@grafana/data';
import { LazyLoader, sceneGraph, type SceneComponentProps, type VizPanel } from '@grafana/scenes';
import { useElementSelection, useStyles2 } from '@grafana/ui';

import { type ConditionalRenderingGroup } from '../../conditional-rendering/group/ConditionalRenderingGroup';
import { useIsConditionallyHidden } from '../../conditional-rendering/hooks/useIsConditionallyHidden';
import { useSoloPanelContext } from '../../solo/SoloPanelContext';
import { ViewPanelWrapper } from '../../solo/ViewPanelWrapper';
import { useDashboardState } from '../../utils/utils';
import { SoloPanelContextValueWithSearchStringFilter } from '../PanelSearchLayout';
import { getIsLazy } from '../layouts-shared/utils';
import { AUTO_GRID_ITEM_DROP_TARGET_ATTR } from '../types/DashboardDropTarget';

import { type AutoGridItem } from './AutoGridItem';
import { AutoGridLayoutManager } from './AutoGridLayoutManager';
import { DRAGGED_ITEM_HEIGHT, DRAGGED_ITEM_LEFT, DRAGGED_ITEM_TOP, DRAGGED_ITEM_WIDTH } from './const';

export function AutoGridItemRenderer({ model }: SceneComponentProps<AutoGridItem>) {
  const { body, repeatedPanels = [], key } = model.useState();
  const { draggingKey } = model.getParentGrid().useState();
  const { isEditing, preload } = useDashboardState(model);
  const styles = useStyles2(getStyles);
  const soloPanelContext = useSoloPanelContext();
  const isLazy = useMemo(() => getIsLazy(preload), [preload]);

  // Check if this grid is a drop target for external drags
  const layoutManager = sceneGraph.getAncestor(model, AutoGridLayoutManager);
  const { isDropTarget } = layoutManager.useState();

  const Wrapper = useMemo(
    () =>
      // eslint-disable-next-line react/display-name
      memo(
        ({
          item,
          conditionalRendering,
          addDndContainer,
          isDragged,
          showDropTarget,
          isRepeat = false,
          isSelected = false,
        }: {
          item: VizPanel;
          conditionalRendering?: ConditionalRenderingGroup;
          addDndContainer: boolean;
          isDragged: boolean;
          showDropTarget: boolean;
          isRepeat?: boolean;
          isSelected?: boolean;
        }) => {
          const [isConditionallyHidden, conditionalRenderingClass, conditionalRenderingOverlay, renderHidden] =
            useIsConditionallyHidden(conditionalRendering);

          return isConditionallyHidden && !isEditing && !renderHidden ? null : (
            <div
              {...(addDndContainer
                ? { ref: model.containerRef, [AUTO_GRID_ITEM_DROP_TARGET_ATTR]: showDropTarget ? key : undefined }
                : {})}
              className={cx(isConditionallyHidden && !isEditing && styles.hidden)}
            >
              {isDragged && <div className={styles.draggedPlaceholder} />}
              {
                // The lazy loader causes issues when used with conditional rendering
                isLazy && (!isConditionallyHidden || !renderHidden) ? (
                  <LazyLoader
                    key={item.state.key!}
                    mode="query"
                    className={cx(
                      conditionalRenderingClass,
                      styles.wrapper,
                      isDragged && !isRepeat && styles.draggedWrapper,
                      isDragged && isRepeat && styles.draggedRepeatWrapper,
                      isSelected && 'dashboard-selected-element'
                    )}
                  >
                    <item.Component model={item} />
                    {conditionalRenderingOverlay}
                  </LazyLoader>
                ) : (
                  <div
                    className={cx(
                      conditionalRenderingClass,
                      styles.wrapper,
                      isDragged && !isRepeat && styles.draggedWrapper,
                      isDragged && isRepeat && styles.draggedRepeatWrapper,
                      isSelected && 'dashboard-selected-element'
                    )}
                  >
                    <item.Component model={item} />
                    {conditionalRenderingOverlay}
                  </div>
                )
              }
            </div>
          );
        }
      ),
    [model, isLazy, key, styles, isEditing]
  );

  const { isSelected: isSourceSelected } = useElementSelection(body.state.key);

  if (soloPanelContext) {
    // Use lazy loading only for panel search layout (SoloPanelContextValueWithSearchStringFilter)
    // as it renders multiple panels in a grid. Skip lazy loading for viewPanel URL param
    // (SoloPanelContextWithPathIdFilter) since single panels should render immediately.
    const useLazyForSoloPanel = isLazy && soloPanelContext instanceof SoloPanelContextValueWithSearchStringFilter;
    return (
      <>
        <SoloPanelWithConditionalRendering
          panel={body}
          conditionalRendering={model.state.conditionalRendering}
          isLazy={useLazyForSoloPanel}
        />
        {repeatedPanels.map((item, idx) => (
          <SoloPanelWithConditionalRendering
            key={item.state.key!}
            panel={item}
            conditionalRendering={model.state.repeatedConditionalRendering?.[idx]}
            isLazy={useLazyForSoloPanel}
          />
        ))}
      </>
    );
  }

  const isDragging = !!draggingKey;
  const isDragged = draggingKey === key;
  // Show drop target attribute for both internal drags and external drags (when this grid is a drop target)
  const showDropTarget = isDragging || !!isDropTarget;

  return (
    <>
      <Wrapper
        item={body}
        conditionalRendering={model.state.conditionalRendering}
        addDndContainer={true}
        key={body.state.key!}
        isDragged={isDragged}
        showDropTarget={showDropTarget}
      />
      {repeatedPanels.map((item, idx) => (
        <Wrapper
          item={item}
          conditionalRendering={model.state.repeatedConditionalRendering?.[idx]}
          addDndContainer={false}
          key={item.state.key!}
          isDragged={isDragged}
          showDropTarget={showDropTarget}
          isRepeat={true}
          isSelected={isSourceSelected}
        />
      ))}
    </>
  );
}

function SoloPanelWithConditionalRendering({
  panel,
  conditionalRendering,
  isLazy,
}: {
  panel: VizPanel;
  conditionalRendering?: ConditionalRenderingGroup;
  isLazy?: boolean;
}) {
  const soloPanelContext = useSoloPanelContext()!;
  const { isEditing } = useDashboardState(panel);
  const [isConditionallyHidden, , , renderHidden] = useIsConditionallyHidden(conditionalRendering);

  if (!soloPanelContext.matches(panel)) {
    return null;
  }

  // Same omit rule as the Auto Grid layout path. d-solo / PDF-simple / viewPanel
  // used to skip show/hide rules, so hidden panels still appeared in PDF exports.
  if (isConditionallyHidden && !isEditing && !renderHidden) {
    return null;
  }

  if (isLazy) {
    return (
      <LazyLoader key={panel.state.key!}>
        <panel.Component model={panel} />
      </LazyLoader>
    );
  }

  return <ViewPanelWrapper panel={panel} showControlsPane={soloPanelContext.showControlsPane} />;
}

const getStyles = (theme: GrafanaTheme2) => ({
  wrapper: css({ width: '100%', height: '100%', position: 'relative' }),
  draggedWrapper: css({
    position: 'absolute',
    zIndex: 1000,
    top: `var(${DRAGGED_ITEM_TOP})`,
    left: `var(${DRAGGED_ITEM_LEFT})`,
    width: `var(${DRAGGED_ITEM_WIDTH})`,
    height: `var(${DRAGGED_ITEM_HEIGHT})`,
    opacity: 0.8,

    // Unfortunately, we need to re-enforce the absolute position here. Otherwise, the position will be overwritten with
    //  a relative position by .dashboard-visible-hidden-element
    '&.dashboard-visible-hidden-element': {
      position: 'absolute',
    },
  }),
  draggedRepeatWrapper: css({
    visibility: 'hidden',
  }),
  draggedPlaceholder: css({
    width: '100%',
    height: '100%',
    boxShadow: `0 0 ${theme.spacing(0.5)} ${theme.colors.primary.border}`,
    background: `${theme.colors.primary.transparent}`,
    zIndex: -1,
  }),
  hidden: css({
    display: 'none',
  }),
});
