import { type Scope, type ScopeDashboardBinding, type ScopeNode } from '@grafana/data';
import { config } from '@grafana/runtime';
import { scopeAPIv0alpha1 } from 'app/api/clients/scope/v0alpha1';
import { getMessageFromError } from 'app/core/utils/errors';
import { dispatch } from 'app/store/store';

import { type ScopeNavigation } from './dashboards/types';
import { logError, logWarning } from './logging';

export class ScopesApiClient {
  private logFetchError(message: string, error: unknown, context: Record<string, unknown> = {}) {
    const errorMessage = getMessageFromError(error);
    logError(new Error(message), { ...context, errorMessage });
  }
  /**
   * Checks if the data is a Kubernetes Status error response.
   * @param data The data to check
   * @returns true if the data is a Status error, false otherwise
   */
  private isStatusError(data: unknown): data is { kind: 'Status'; status: 'Failure'; message?: string; code?: number } {
    return (
      data !== null &&
      typeof data === 'object' &&
      'kind' in data &&
      data.kind === 'Status' &&
      'status' in data &&
      data.status === 'Failure'
    );
  }

  /**
   * Extracts and validates data from an RTK Query result, checking for error responses.
   * @param result The RTK Query result
   * @param context Context for error logging (e.g., resource name)
   * @returns The data if valid, undefined if it's an error response
   */
  private extractDataOrHandleError<T>(result: { data?: T; error?: unknown }, context: string): T | undefined {
    if ('data' in result && result.data) {
      // Check if the data is actually an error response (Kubernetes Status object)
      if (this.isStatusError(result.data)) {
        this.logFetchError('Failed to fetch resource', result.data, { context });
        return undefined;
      }
      return result.data;
    }

    if ('error' in result) {
      this.logFetchError('Failed to fetch resource', result.error, { context });
    }

    return undefined;
  }
  async fetchScope(name: string): Promise<Scope | undefined> {
    const subscription = dispatch(scopeAPIv0alpha1.endpoints.getScope.initiate({ name }, { subscribe: false }));
    try {
      const result = await subscription;
      return this.extractDataOrHandleError(result, `scope: ${name}`);
    } catch (err) {
      this.logFetchError('Failed to fetch scope', err, { scopeName: name });
      return undefined;
    } finally {
      // Unsubscribe for extra safety, even though with subscribe: false and awaiting,
      // the request completes before return, so this is mostly a no-op
      subscription.unsubscribe();
    }
  }

  async fetchMultipleScopes(scopesIds: string[]): Promise<Scope[]> {
    if (scopesIds.length === 0) {
      return [];
    }

    try {
      const scopes = await Promise.all(scopesIds.map((id) => this.fetchScope(id)));
      const successfulScopes = scopes.filter((scope) => scope !== undefined);

      if (successfulScopes.length < scopesIds.length) {
        const failedCount = scopesIds.length - successfulScopes.length;
        logWarning('Failed to fetch some scopes', {
          failedCount,
          requestedCount: scopesIds.length,
          scopeIds: scopesIds.join(', '),
        });
      }

      return successfulScopes;
    } catch (err) {
      this.logFetchError('Failed to fetch multiple scopes', err, { scopeIds: scopesIds.join(', ') });
      return [];
    }
  }

  async fetchMultipleScopeNodes(names: string[]): Promise<ScopeNode[]> {
    if (!config.featureToggles.useMultipleScopeNodesEndpoint || names.length === 0) {
      return Promise.resolve([]);
    }

    const subscription = dispatch(
      scopeAPIv0alpha1.endpoints.getFindScopeNodeChildrenResults.initiate({ names }, { subscribe: false })
    );
    try {
      const result = await subscription;

      if ('data' in result && result.data) {
        // The generated API returns items compatible with @grafana/data ScopeNode
        return result.data.items ?? [];
      }

      if ('error' in result) {
        this.logFetchError('Failed to fetch multiple scope nodes', result.error, { names: names.join(', ') });
      }

      return [];
    } catch (err) {
      this.logFetchError('Failed to fetch multiple scope nodes', err, { names: names.join(', ') });
      return [];
    } finally {
      // Unsubscribe for extra safety, even though with subscribe: false and awaiting,
      // the request completes before return, so this is mostly a no-op
      subscription.unsubscribe();
    }
  }

  /**
   * Fetches a map of nodes based on the specified options.
   *
   * @param {Object} options An object to configure the node fetch operation.
   * @param {string|undefined} options.parent The parent node identifier to fetch children for, or undefined if no parent scope is required.
   * @param {string|undefined} options.query A query string to filter the nodes, or undefined for no filtering.
   * @param {number|undefined} options.limit The maximum number of nodes to fetch, defaults to 1000 if undefined. Must be between 1 and 10000.
   * @return {Promise<ScopeNode[]>} A promise that resolves to a map of fetched nodes. Returns an empty object if an error occurs.
   */
  async fetchNodes(options: { parent?: string; query?: string; limit?: number }): Promise<ScopeNode[]> {
    const limit = options.limit ?? 1000;

    if (!(0 < limit && limit <= 10000)) {
      throw new Error('Limit must be between 1 and 10000');
    }

    const subscription = dispatch(
      scopeAPIv0alpha1.endpoints.getFindScopeNodeChildrenResults.initiate(
        {
          parent: options.parent,
          query: options.query,
          limit,
        },
        { subscribe: false, forceRefetch: true } // Force refetch for search. Revisit this when necessary
      )
    );
    try {
      const result = await subscription;

      if ('data' in result && result.data) {
        // The generated API returns items compatible with @grafana/data ScopeNode
        return result.data.items ?? [];
      }

      if ('error' in result) {
        const contextParts: string[] = [];
        if (options.parent) {
          contextParts.push('parent="' + options.parent + '"');
        }
        if (options.query) {
          contextParts.push('query="' + options.query + '"');
        }
        contextParts.push('limit=' + limit);
        this.logFetchError('Failed to fetch scope nodes', result.error, { context: contextParts.join(', ') });
      }

      return [];
    } catch (err) {
      const contextParts: string[] = [];
      if (options.parent) {
        contextParts.push('parent="' + options.parent + '"');
      }
      if (options.query) {
        contextParts.push('query="' + options.query + '"');
      }
      contextParts.push('limit=' + limit);
      this.logFetchError('Failed to fetch scope nodes', err, { context: contextParts.join(', ') });
      return [];
    } finally {
      // Unsubscribe for extra safety, even though with subscribe: false and awaiting,
      // the request completes before return, so this is mostly a no-op
      subscription.unsubscribe();
    }
  }

  public fetchDashboards = async (scopeNames: string[]): Promise<ScopeDashboardBinding[]> => {
    const subscription = dispatch(
      scopeAPIv0alpha1.endpoints.getFindScopeDashboardBindingsResults.initiate(
        {
          scope: scopeNames,
        },
        { subscribe: false }
      )
    );
    try {
      const result = await subscription;

      if ('data' in result && result.data) {
        // The generated API returns items compatible with @grafana/data ScopeDashboardBinding
        return result.data.items ?? [];
      }

      if ('error' in result) {
        this.logFetchError('Failed to fetch dashboards for scopes', result.error, {
          scopeNames: scopeNames.join(', '),
        });
      }

      return [];
    } catch (err) {
      this.logFetchError('Failed to fetch dashboards for scopes', err, { scopeNames: scopeNames.join(', ') });
      return [];
    } finally {
      // Unsubscribe for extra safety, even though with subscribe: false and awaiting,
      // the request completes before return, so this is mostly a no-op
      subscription.unsubscribe();
    }
  };

  public fetchScopeNavigations = async (
    scopeNames: string[],
    options?: { depth?: number; rootScope?: string }
  ): Promise<ScopeNavigation[]> => {
    const subscription = dispatch(
      scopeAPIv0alpha1.endpoints.getFindScopeNavigationsResults.initiate(
        {
          scope: scopeNames,
          ...(options?.depth && { depth: options.depth }),
          ...(options?.rootScope && { rootScope: options.rootScope }),
        },
        { subscribe: false }
      )
    );
    try {
      const result = await subscription;

      if ('data' in result && result.data) {
        // The generated API returns items compatible with ScopeNavigation
        return result.data.items ?? [];
      }

      if ('error' in result) {
        this.logFetchError('Failed to fetch scope navigations for scopes', result.error, {
          scopeNames: scopeNames.join(', '),
        });
      }

      return [];
    } catch (err) {
      this.logFetchError('Failed to fetch scope navigations for scopes', err, { scopeNames: scopeNames.join(', ') });
      return [];
    } finally {
      // Unsubscribe for extra safety, even though with subscribe: false and awaiting,
      // the request completes before return, so this is mostly a no-op
      subscription.unsubscribe();
    }
  };

  public fetchScopeNode = async (scopeNodeId: string): Promise<ScopeNode | undefined> => {
    if (!config.featureToggles.useScopeSingleNodeEndpoint) {
      return Promise.resolve(undefined);
    }

    const subscription = dispatch(
      scopeAPIv0alpha1.endpoints.getScopeNode.initiate({ name: scopeNodeId }, { subscribe: false })
    );
    try {
      const result = await subscription;
      return this.extractDataOrHandleError(result, `scope node: ${scopeNodeId}`);
    } catch (err) {
      this.logFetchError('Failed to fetch scope node', err, { scopeNodeId });
      return undefined;
    } finally {
      // Unsubscribe for extra safety, even though with subscribe: false and awaiting,
      // the request completes before return, so this is mostly a no-op
      subscription.unsubscribe();
    }
  };
}
