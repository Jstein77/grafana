import { type DataFrame, type DataLinkPostProcessor, type TimeRange } from '@grafana/data';
import type { CorrelationData, CorrelationsService as CorrelationsServiceInterface } from '@grafana/runtime';
import { attachCorrelationsToDataFrames, getCorrelationsBySourceUIDs } from 'app/features/correlations/utils';

type ExploreDataLinkPostProcessorFactory = (
  splitOpenFn: undefined,
  timeRange: TimeRange
) => DataLinkPostProcessor;

let exploreLinksFactory: ExploreDataLinkPostProcessorFactory | undefined;
let exploreLinksLoad: Promise<void> | undefined;

function ensureExploreLinksLoaded() {
  if (!exploreLinksLoad) {
    exploreLinksLoad = import(
      /* webpackChunkName: "explore-links" */ 'app/features/explore/utils/links'
    ).then((m) => {
      exploreLinksFactory = m.exploreDataLinkPostProcessorFactory as ExploreDataLinkPostProcessorFactory;
    });
  }
  return exploreLinksLoad;
}

export class CorrelationsService implements CorrelationsServiceInterface {
  constructor() {
    // Prefetch during app boot so the factory is usually ready before first data-link use.
    void ensureExploreLinksLoaded();
  }

  attachCorrelationsToDataFrames(
    dataFrames: DataFrame[],
    correlations: CorrelationData[],
    dataFrameRefIdToDataSourceUid: Record<string, string>
  ) {
    return attachCorrelationsToDataFrames(dataFrames, correlations, dataFrameRefIdToDataSourceUid);
  }

  correlationsDataLinkPostProcessorFactory(timeRange: TimeRange): DataLinkPostProcessor {
    void ensureExploreLinksLoaded();
    return (options) => {
      if (!exploreLinksFactory) {
        return options.linkModel;
      }
      return exploreLinksFactory(undefined, timeRange)(options);
    };
  }

  getCorrelationsBySourceUIDs(sourceUIDs: string[]) {
    return getCorrelationsBySourceUIDs(sourceUIDs);
  }
}
