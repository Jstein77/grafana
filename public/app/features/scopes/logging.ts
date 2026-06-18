import { type LogContext } from '@grafana/faro-web-sdk';
import { getLogger } from '@grafana/runtime/unstable';

const logger = () => getLogger('grafana.features.scopes');

export const logInfo = (message: string, contexts?: LogContext) => logger().logInfo(message, contexts);

export const logWarning = (message: string, contexts?: LogContext) => logger().logWarning(message, contexts);

export const logError = (error: Error, contexts?: LogContext) => logger().logError(error, contexts);
