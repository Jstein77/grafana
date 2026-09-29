package mysql

import (
	"fmt"
	"sync"
	"testing"
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/backend"

	"github.com/stretchr/testify/require"
)

func TestMacroEngine(t *testing.T) {
	engine := &mySQLMacroEngine{
		logger:    backend.NewLoggerWith("logger", "test"),
		userError: "inspect Grafana server log for details",
	}
	query := &backend.DataQuery{}

	t.Run("Given a time range between 2018-04-12 00:00 and 2018-04-12 00:05", func(t *testing.T) {
		from := time.Date(2018, 4, 12, 18, 0, 0, 0, time.UTC)
		to := from.Add(5 * time.Minute)
		timeRange := backend.TimeRange{From: from, To: to}

		t.Run("interpolate __time function", func(t *testing.T) {
			sql, err := engine.Interpolate(query, timeRange, "select $__time(time_column)")
			require.Nil(t, err)

			require.Equal(t, "select UNIX_TIMESTAMP(time_column) as time_sec", sql)
		})

		t.Run("interpolate __time function wrapped in aggregation", func(t *testing.T) {
			sql, err := engine.Interpolate(query, timeRange, "select min($__time(time_column))")
			require.Nil(t, err)

			require.Equal(t, "select min(UNIX_TIMESTAMP(time_column) as time_sec)", sql)
		})

		t.Run("interpolate __timeGroup function", func(t *testing.T) {
			sql, err := engine.Interpolate(query, timeRange, "GROUP BY $__timeGroup(time_column,'5m')")
			require.Nil(t, err)
			sql2, err := engine.Interpolate(query, timeRange, "GROUP BY $__timeGroupAlias(time_column,'5m')")
			require.Nil(t, err)

			require.Equal(t, "GROUP BY UNIX_TIMESTAMP(time_column) DIV 300 * 300", sql)
			require.Equal(t, sql+" AS \"time\"", sql2)
		})

		t.Run("interpolate __timeGroup function with spaces around arguments", func(t *testing.T) {
			sql, err := engine.Interpolate(query, timeRange, "GROUP BY $__timeGroup(time_column , '5m')")
			require.Nil(t, err)
			sql2, err := engine.Interpolate(query, timeRange, "GROUP BY $__timeGroupAlias(time_column , '5m')")
			require.Nil(t, err)

			require.Equal(t, "GROUP BY UNIX_TIMESTAMP(time_column) DIV 300 * 300", sql)
			require.Equal(t, sql+" AS \"time\"", sql2)
		})

		t.Run("interpolate __timeFilter function", func(t *testing.T) {
			sql, err := engine.Interpolate(query, timeRange, "WHERE $__timeFilter(time_column)")
			require.Nil(t, err)

			require.Equal(t, fmt.Sprintf("WHERE time_column BETWEEN FROM_UNIXTIME(%d) AND FROM_UNIXTIME(%d)", from.Unix(), to.Unix()), sql)
		})

		t.Run("interpolate __timeFrom function", func(t *testing.T) {
			sql, err := engine.Interpolate(query, timeRange, "select $__timeFrom()")
			require.Nil(t, err)

			require.Equal(t, fmt.Sprintf("select FROM_UNIXTIME(%d)", from.Unix()), sql)
		})

		t.Run("interpolate __timeTo function", func(t *testing.T) {
			sql, err := engine.Interpolate(query, timeRange, "select $__timeTo()")
			require.Nil(t, err)

			require.Equal(t, fmt.Sprintf("select FROM_UNIXTIME(%d)", to.Unix()), sql)
		})

		t.Run("interpolate __unixEpochFilter function", func(t *testing.T) {
			sql, err := engine.Interpolate(query, timeRange, "select $__unixEpochFilter(time)")
			require.Nil(t, err)

			require.Equal(t, fmt.Sprintf("select time >= %d AND time <= %d", from.Unix(), to.Unix()), sql)
		})

		t.Run("interpolate __unixEpochNanoFilter function", func(t *testing.T) {
			sql, err := engine.Interpolate(query, timeRange, "select $__unixEpochNanoFilter(time)")
			require.Nil(t, err)

			require.Equal(t, fmt.Sprintf("select time >= %d AND time <= %d", from.UnixNano(), to.UnixNano()), sql)
		})

		t.Run("interpolate __unixEpochNanoFrom function", func(t *testing.T) {
			sql, err := engine.Interpolate(query, timeRange, "select $__unixEpochNanoFrom()")
			require.Nil(t, err)

			require.Equal(t, fmt.Sprintf("select %d", from.UnixNano()), sql)
		})

		t.Run("interpolate __unixEpochNanoTo function", func(t *testing.T) {
			sql, err := engine.Interpolate(query, timeRange, "select $__unixEpochNanoTo()")
			require.Nil(t, err)

			require.Equal(t, fmt.Sprintf("select %d", to.UnixNano()), sql)
		})

		t.Run("interpolate __unixEpochGroup function", func(t *testing.T) {
			sql, err := engine.Interpolate(query, timeRange, "SELECT $__unixEpochGroup(time_column,'5m')")
			require.Nil(t, err)
			sql2, err := engine.Interpolate(query, timeRange, "SELECT $__unixEpochGroupAlias(time_column,'5m')")
			require.Nil(t, err)

			require.Equal(t, "SELECT time_column DIV 300 * 300", sql)
			require.Equal(t, sql+" AS \"time\"", sql2)
		})
	})

	t.Run("Given a time range between 1960-02-01 07:00 and 1965-02-03 08:00", func(t *testing.T) {
		from := time.Date(1960, 2, 1, 7, 0, 0, 0, time.UTC)
		to := time.Date(1965, 2, 3, 8, 0, 0, 0, time.UTC)
		timeRange := backend.TimeRange{
			From: from,
			To:   to,
		}

		t.Run("interpolate __timeFilter function", func(t *testing.T) {
			sql, err := engine.Interpolate(query, timeRange, "WHERE $__timeFilter(time_column)")
			require.Nil(t, err)

			require.Equal(t, fmt.Sprintf("WHERE time_column BETWEEN DATE_ADD(FROM_UNIXTIME(0), INTERVAL %d SECOND) AND FROM_UNIXTIME(%d)", from.Unix(), to.Unix()), sql)
		})

		t.Run("interpolate __unixEpochFilter function", func(t *testing.T) {
			sql, err := engine.Interpolate(query, timeRange, "select $__unixEpochFilter(time)")
			require.Nil(t, err)

			require.Equal(t, fmt.Sprintf("select time >= %d AND time <= %d", from.Unix(), to.Unix()), sql)
		})
	})

	t.Run("Given a time range between 1960-02-01 07:00 and 1980-02-03 08:00", func(t *testing.T) {
		from := time.Date(1960, 2, 1, 7, 0, 0, 0, time.UTC)
		to := time.Date(1980, 2, 3, 8, 0, 0, 0, time.UTC)
		timeRange := backend.TimeRange{
			From: from,
			To:   to,
		}

		t.Run("interpolate __timeFilter function", func(t *testing.T) {
			sql, err := engine.Interpolate(query, timeRange, "WHERE $__timeFilter(time_column)")
			require.Nil(t, err)

			require.Equal(t, fmt.Sprintf("WHERE time_column BETWEEN DATE_ADD(FROM_UNIXTIME(0), INTERVAL %d SECOND) AND FROM_UNIXTIME(%d)", from.Unix(), to.Unix()), sql)
		})

		t.Run("interpolate __unixEpochFilter function", func(t *testing.T) {
			sql, err := engine.Interpolate(query, timeRange, "select $__unixEpochFilter(time)")
			require.Nil(t, err)

			require.Equal(t, fmt.Sprintf("select time >= %d AND time <= %d", from.Unix(), to.Unix()), sql)
		})
	})

	t.Run("interpolation errors are returned instead of being silently ignored", func(t *testing.T) {
		tcs := []struct {
			name    string
			sql     string
			wantErr string
		}{
			{
				name:    "unknown macro",
				sql:     "SELECT $__notAMacro(col)",
				wantErr: "unknown macro __notAMacro",
			},
			{
				name:    "missing time column for __time",
				sql:     "SELECT $__time()",
				wantErr: "missing time column argument for macro __time",
			},
			{
				name:    "missing time column for __timeFilter",
				sql:     "WHERE $__timeFilter()",
				wantErr: "missing time column argument for macro __timeFilter",
			},
			{
				name:    "invalid interval for __timeGroup",
				sql:     "GROUP BY $__timeGroup(time_column,'not-an-interval')",
				wantErr: "error parsing interval 'not-an-interval'",
			},
			{
				name:    "non-positive interval for __timeGroup",
				sql:     "GROUP BY $__timeGroup(time_column,'0s')",
				wantErr: "interval must be positive, got '0s'",
			},
			{
				name:    "missing args for __unixEpochGroup",
				sql:     "SELECT $__unixEpochGroup(time_column)",
				wantErr: "macro __unixEpochGroup needs time column and interval and optional fill value",
			},
			{
				name:    "empty time column for __unixEpochFilter",
				sql:     "SELECT $__unixEpochFilter()",
				wantErr: "missing time column argument for macro __unixEpochFilter",
			},
			{
				name:    "empty time column for __timeGroup",
				sql:     "GROUP BY $__timeGroup(,'5m')",
				wantErr: "macro __timeGroup needs time column and interval",
			},
		}

		from := time.Date(2018, 4, 12, 18, 0, 0, 0, time.UTC)
		to := from.Add(5 * time.Minute)
		timeRange := backend.TimeRange{From: from, To: to}

		for _, tc := range tcs {
			t.Run(tc.name, func(t *testing.T) {
				sql, err := engine.Interpolate(query, timeRange, tc.sql)
				require.EqualError(t, err, tc.wantErr)
				require.Empty(t, sql)
			})
		}
	})

	t.Run("Given queries that contains unallowed user functions", func(t *testing.T) {
		tcs := []string{
			"select \nSESSION_USER(), abc",
			"SELECT session_User( ) ",
			"SELECT session_User(	)\n",
			"SELECT current_user",
			"SELECT current_USER",
			"SELECT current_user()",
			"SELECT Current_User()",
			"SELECT current_user(   )",
			"SELECT current_user(\t )",
			"SELECT user()",
			"SELECT USER()",
			"SELECT SYSTEM_USER()",
			"SELECT System_User()",
			"SELECT System_User(  )",
			"SELECT System_User(\t \t)",
			"SHOW \t grants",
			" show Grants\n",
			"show grants;",
		}

		for _, tc := range tcs {
			_, err := engine.Interpolate(&backend.DataQuery{}, backend.TimeRange{}, tc)
			require.Equal(t, "invalid query - inspect Grafana server log for details", err.Error())
		}
	})
}

func TestMacroEngineConcurrency(t *testing.T) {
	engine := newMysqlMacroEngine(backend.NewLoggerWith("logger", "test"), "error")
	query1 := backend.DataQuery{
		JSON: []byte{},
	}
	query2 := backend.DataQuery{
		JSON: []byte{},
	}
	from := time.Date(2018, 4, 12, 18, 0, 0, 0, time.UTC)
	to := from.Add(5 * time.Minute)
	timeRange := backend.TimeRange{From: from, To: to}

	var wg sync.WaitGroup
	wg.Add(2)

	go func(query backend.DataQuery) {
		defer wg.Done()
		_, err := engine.Interpolate(&query, timeRange, "SELECT $__timeGroup(time_column,'5m')")
		require.NoError(t, err)
	}(query1)

	go func(query backend.DataQuery) {
		_, err := engine.Interpolate(&query, timeRange, "SELECT $__timeGroup(time_column,'5m')")
		require.NoError(t, err)
		defer wg.Done()
	}(query2)

	wg.Wait()
}

func TestStripSQLComments(t *testing.T) {
	t.Run("strips block comments", func(t *testing.T) {
		result := stripSQLComments("SELECT /* comment */ 1")
		require.Equal(t, "SELECT  1", result)
	})

	t.Run("strips line comments with --", func(t *testing.T) {
		result := stripSQLComments("SELECT 1 -- line comment\nFROM t")
		require.Equal(t, "SELECT 1 \nFROM t", result)
	})

	t.Run("strips hash comments", func(t *testing.T) {
		result := stripSQLComments("SELECT 1 # hash comment\nFROM t")
		require.Equal(t, "SELECT 1 \nFROM t", result)
	})

	t.Run("preserves hash inside single-quoted string", func(t *testing.T) {
		sql := `SELECT JSON_UNQUOTE(JSON_EXTRACT(t.properties, '$."Claim #"')) AS claim`
		result := stripSQLComments(sql)
		require.Equal(t, sql, result)
	})

	t.Run("preserves hash inside double-quoted string", func(t *testing.T) {
		sql := `SELECT "col#name" FROM t`
		result := stripSQLComments(sql)
		require.Equal(t, sql, result)
	})

	t.Run("preserves hash inside backtick-quoted identifier", func(t *testing.T) {
		sql := "SELECT `Claim #` FROM t"
		result := stripSQLComments(sql)
		require.Equal(t, sql, result)
	})

	t.Run("preserves -- inside single-quoted string", func(t *testing.T) {
		sql := `SELECT '--not-a-comment' FROM t`
		result := stripSQLComments(sql)
		require.Equal(t, sql, result)
	})

	t.Run("preserves /* inside single-quoted string", func(t *testing.T) {
		sql := `SELECT '/* not a comment */' FROM t`
		result := stripSQLComments(sql)
		require.Equal(t, sql, result)
	})

	t.Run("handles escaped quotes inside strings", func(t *testing.T) {
		sql := `SELECT 'it\'s a #test' FROM t`
		result := stripSQLComments(sql)
		require.Equal(t, sql, result)
	})

	t.Run("handles doubled quotes inside strings", func(t *testing.T) {
		sql := `SELECT 'it''s a #test' FROM t`
		result := stripSQLComments(sql)
		require.Equal(t, sql, result)
	})

	t.Run("real-world JSON path with hash regression", func(t *testing.T) {
		sql := "SELECT\n  JSON_UNQUOTE(JSON_EXTRACT(t.properties, '$.\"Claim #\"')) AS `Claim Number`\nFROM repairshopr.tickets t\nWHERE t.status = 'Resolved'"
		result := stripSQLComments(sql)
		require.Equal(t, sql, result)
	})

	t.Run("hash comment after a quoted string with hash", func(t *testing.T) {
		sql := "SELECT 'Claim #' # this is a comment\nFROM t"
		expected := "SELECT 'Claim #' \nFROM t"
		result := stripSQLComments(sql)
		require.Equal(t, expected, result)
	})

	t.Run("no comments returns unchanged", func(t *testing.T) {
		sql := "SELECT 1 FROM t WHERE id = 42"
		result := stripSQLComments(sql)
		require.Equal(t, sql, result)
	})

	t.Run("strips a block comment shaped like a SQLCommenter tag", func(t *testing.T) {
		// stripSQLComments strips all comments; trailing SQLCommenter tags are
		// preserved earlier in the pipeline by sqlmacro.SplitTrailingSQLCommenter.
		result := stripSQLComments("SELECT 1 /*application='grafana',feature='panel'*/")
		require.Equal(t, "SELECT 1 ", result)
	})
}
