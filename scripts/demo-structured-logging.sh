#!/usr/bin/env bash
# Demo script for structured logging migration (issue #12)

echo "=== Structured logging migration demo ==="
echo
echo "BEFORE (unstructured - hard to query):"
echo '  logger.Error(fmt.Sprintf("failed to list event: %s", err))'
echo '  logger.Debug(fmt.Sprintf("buildSnapshot: method completed in %d ms", duration))'
echo '  console.error("Failed to fetch scope:", name, errorMessage)'
echo
echo "AFTER (structured - queryable fields):"
echo '  logger.Error("Failed to list events", "error", err, "userId", userID)'
echo '  logger.Debug("buildSnapshot completed", "durationMs", duration)'
echo '  logError(new Error("Failed to fetch scope"), { scopeName: name, errorMessage })'
echo
echo "=== Running structured logging check ==="
./scripts/check-structured-logging.sh
echo
echo "=== Sample backend log fields (from migrated code) ==="
grep -n 'durationMs\|"error"' pkg/services/cloudmigration/cloudmigrationimpl/snapshot_mgmt.go | head -5
echo
echo "=== Frontend logger registry entries ==="
grep "grafana.features\|grafana.dashboard\|grafana.plugins" packages/grafana-runtime/src/services/logging/loggers.ts
