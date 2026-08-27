/**
 * @public
 * Browser location used by Grafana navigation APIs.
 * This is the public contract; do not depend on `history` package types.
 */
export interface GrafanaLocation<S = unknown> {
  pathname: string;
  search: string;
  hash: string;
  state: S;
  key?: string;
}

/**
 * @public
 * Path string or partial location accepted by push/replace.
 */
export type GrafanaLocationDescriptor<S = unknown> =
  | string
  | {
      pathname?: string;
      search?: string;
      hash?: string;
      state?: S;
      key?: string;
    };

/**
 * @public
 * Navigation action reported to location listeners.
 */
export type GrafanaNavigationAction = 'PUSH' | 'POP' | 'REPLACE';
