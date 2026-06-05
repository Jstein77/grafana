package v1beta1

import "strings"

// #TimeIntervalName is referenced by notification policy and alert rule settings.
// +k8s:validation:minLength=1
// +k8s:validation:pattern="^.+$"
#TimeIntervalName: string & strings.MinRunes(1) & =~"^.+$"

TimeIntervalSpec: {
	name: #TimeIntervalName
	time_intervals: [...#Interval]
}

#TimeRange: {
	start_time: string
	end_time:   string
}
#Interval: {
	times?: [...#TimeRange]
	weekdays?: [...string]
	days_of_month?: [...string]
	months?: [...string]
	years?: [...string]
	location?: string
}
