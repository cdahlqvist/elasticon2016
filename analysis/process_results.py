#!/usr/bin/env python

import sys
import json
from dateutil.parser import parse as date_parse
import calendar
import math

def date_to_epoch_minute_str(datestring):
    dt =  date_parse(datestring)
    epoch = calendar.timegm(dt.timetuple())
    em = int(math.floor(epoch / 60.0))
    return str(em)

def scale_to_millions(count):
    c = count / 1000000.0
    return c

def scale_to_gb(size):
    s = float(size) / (1024*1024*1024)
    return s

def reduce_ems(ems):
    k = int(ems) - 1
    return str(k)

def increase_ems(ems):
    k = int(ems) + 1
    return str(k)

def find_matching_stat(dict, ems):
    if ems in dict:
        v = dict[ems]
        return v
    elif reduce_ems(ems) in dict:
        k = reduce_ems(ems)
        v = dict[k]
        return v
    elif increase_ems(ems) in dict:
        k = increase_ems(ems)
        v = dict[k]
        return v
    else:
        return 0

seen_labels = set()
storage_count = {}
storage_size = {}
latencies = {}

for line in sys.stdin:
    record = json.loads(line)
    ems = date_to_epoch_minute_str(record['timestamp'])

    if 'record_type' in record and record['record_type'] == 'summary' and record['label'] not in ['index_size','count'] and record['result']['result_code'] == 'OK':
        seen_labels.add(record['label'])
        if ems not in latencies:
            latencies[ems] = {}
        latencies[ems][record['label']] = record['latency_avg']
    elif 'record_type' in record and record['record_type'] == 'detail' and record['driver'] == 'example':
        if record['operation'] == 'count' and record['result']['result_code'] == 'OK':
            if ems not in storage_count or storage_count[ems] < record['result']['count']:
                storage_count[ems] = record['result']['count']
        elif record['operation'] == 'index_size' and record['result']['result_code'] == 'OK':
            if ems not in storage_size or storage_size[ems] < record['result']['primary_size']:
                storage_size[ems] = record['result']['primary_size']

columns = list(seen_labels)
columns.sort()

# Print headers to STDOUT
print "Count(millions), Size(GB)," + ",".join(columns)

# Print data to STDOUT
timestamps = latencies.keys()
timestamps.sort()

for ts in timestamps:
    result_str = str(scale_to_millions(find_matching_stat(storage_count, ts))) + "," + str(scale_to_gb(find_matching_stat(storage_size, ts)))

    for label in columns:
        if label in latencies[ts]:
            result_str = result_str + "," + str(latencies[ts][label])
        else:
            result_str = result_str + ",0"

    print result_str
