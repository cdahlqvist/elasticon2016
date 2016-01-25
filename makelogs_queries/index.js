
var _ = require('lodash');
var fs = require('fs');
var moment = require('moment');
var util = require('../../lib/util');

module.exports.init = function(esClient, parameters, driver_data) {
  var state = {};
  
  set_state_value('index_pattern', state, parameters, "rankin*");
  set_state_value('fetch_size', state, parameters, 500);
  set_state_value('match_term_count', state, parameters, 1);
  set_state_value('terms_file', state, parameters, false);
  set_state_value('timeout', state, parameters, 30000);

  set_state_value('period', state, parameters, 30);

  if (parameters && parameters['days']) {
    state.days = parse_days(parameters['days']);
  } else {
    state.days = parse_days('-1,0');
  }

  if (parameters && parameters['terms_file']) {
    driver_data["terms"] = load_string_file(parameters['terms_file']);
  } else { 
    driver_data["terms"] = ["*"];
  }

  return state;
}

module.exports.match_query = function(esClient, state, driver_data, operation_parameters, result_callback) {
  var end_ts = _.random(state.days.start, state.days.end);
  var start_ts = end_ts - (state.period * 24 * 3600 * 1000);

  var index_pattern = state['index_pattern'];
  if(operation_parameters.index_pattern) {
    index_pattern = operation_parameters.index_pattern;
  }

  var fetch_size = state['fetch_size'];
  if(operation_parameters.fetch_size) {
    fetch_size = operation_parameters.fetch_size;
  }

  var match_term_count = state['match_term_count'];
  if(operation_parameters.match_term_count && operation_parameters.match_term_count > 0) {
    match_term_count = operation_parameters.match_term_count;
  }

  var text_filter;
  if(match_term_count > 0) {
    var terms = [];
    for(var i = 0; i < match_term_count; i++) {
      terms.push(driver_data.terms[_.random(0, driver_data.terms.length - 1)]);
    }

    text_filter = "text: " + terms.join(" ");
  } else {
    text_filter = "*";
  }

  esClient.search({
    preference: end_ts.toString(),
    body: {"size":fetch_size,"query":{"filtered":{"query":{"match":{"text":text_filter}},"filter":{"bool":{"must": [{"range": {"@timestamp":{"gte":start_ts,"lte":end_ts,"format":"epoch_millis"}}}]}}}}},
    requestTimeout: state.timeout
  }, function (err, resp) {
    if (err) {
      result_callback( { result_code: 'ERROR' } );
    }

    result_callback( { result_code: 'OK' } );
  });
}


module.exports.stats_by_ip_agg = function(esClient, state, driver_data, operation_parameters, result_callback) {
  var end_ts = _.random(state.days.start, state.days.end);
  var start_ts = end_ts - (state.period * 24 * 3600 * 1000);

  var index_pattern = state['index_pattern'];
  if(operation_parameters.index_pattern) {
    index_pattern = operation_parameters.index_pattern;
  }

  var match_term_count = state['match_term_count'];
  if(operation_parameters.match_term_count && operation_parameters.match_term_count > 0) {
    match_term_count = operation_parameters.match_term_count;
  }

  var text_filter;
  if(match_term_count > 0) {
    var terms = [];
    for(var i = 0; i < match_term_count; i++) {
      terms.push(driver_data.terms[_.random(0, driver_data.terms.length - 1)]);
    }

    text_filter = "text: " + terms.join(" ");
  } else {
    text_filter = "*";
  }

  esClient.search({
    index: index_pattern,
    body: {"size":0,"aggs":{"3":{"terms":{"field":"ip","size":20,"order":{"_count":"desc"}},"aggs":{"2":{"sum":{"field":"bytes"}}}}},"query":{"filtered":{"query":{"query_string":{"analyze_wildcard":true,"query":"*"}},"filter":{"bool":{"must":[{"query":{"query_string":{"query":text_filter,"analyze_wildcard":true}}},{"range":{"@timestamp":{"gte":start_ts,"lte":end_ts,"format":"epoch_millis"}}}],"must_not":[]}}}}},
    requestTimeout: state.timeout
  }, function (err, resp) {
    if (err) {
      result_callback( { result_code: 'ERROR' } );
    }

    result_callback( { result_code: 'OK' } );
  });
}

module.exports.responsecode_date_histogram_agg = function(esClient, state, driver_data, operation_parameters, result_callback) {
  var end_ts = _.random(state.days.start, state.days.end);
  var start_ts = end_ts - (state.period * 24 * 3600 * 1000);

  var index_pattern = state['index_pattern'];
  if(operation_parameters.index_pattern) {
    index_pattern = operation_parameters.index_pattern;
  }

  var match_term_count = state['match_term_count'];
  if(operation_parameters.match_term_count && operation_parameters.match_term_count > 0) {
    match_term_count = operation_parameters.match_term_count;
  }

  var text_filter;
  if(match_term_count > 0) {
    var terms = [];
    for(var i = 0; i < match_term_count; i++) {
      terms.push(driver_data.terms[_.random(0, driver_data.terms.length - 1)]);
    }

    text_filter = "text: " + terms.join(" ");
  } else {
    text_filter = "*";
  }

  esClient.search({
    index: index_pattern,
    body: {"size":0,"aggs":{"2":{"date_histogram":{"field":"@timestamp","interval":"12h","min_doc_count":1,"extended_bounds":{"min":start_ts,"max":end_ts}},"aggs":{"3":{"terms":{"field":"response","size":10,"order":{"_count":"desc"}}}}}},"query":{"filtered":{"query":{"query_string":{"analyze_wildcard":true,"query":"*"}},"filter":{"bool":{"must":[{"query":{"query_string":{"query":text_filter,"analyze_wildcard":true}}},{"range":{"@timestamp":{"gte":start_ts,"lte":end_ts,"format":"epoch_millis"}}}],"must_not":[]}}}}},
    requestTimeout: state.timeout
  }, function (err, resp) {
    if (err) {
      result_callback( { result_code: 'ERROR' } );
    }

    result_callback( { result_code: 'OK' } );
  });
}

module.exports.filtered_kibana_msearch = function(esClient, state, driver_data, operation_parameters, result_callback) {
  var end_ts = _.random(state.days.start, state.days.end);
  var start_ts = end_ts - (state.period * 24 * 3600 * 1000);

  var match_term_count = state['match_term_count'];
  if(operation_parameters.match_term_count && operation_parameters.match_term_count > 0) {
    match_term_count = operation_parameters.match_term_count;
  }

  var text_filter;
  if(match_term_count > 0) {
    var terms = [];
    for(var i = 0; i < match_term_count; i++) {
      terms.push(driver_data.terms[_.random(0, driver_data.terms.length - 1)]);
    }

    text_filter = "text: " + terms.join(" ");
  } else {
    text_filter = "*";
  }

  var bulk_body = [
    {"index":state.index_pattern,"search_type":"count","ignore_unavailable":true},
    {"size":0,"aggs":{"2":{"terms":{"field":"host","size":5,"order":{"_count":"desc"}}}},"highlight":{"pre_tags":["@kibana-highlighted-field@"],"post_tags":["@/kibana-highlighted-field@"],"fields":{"*":{}}},"query":{"filtered":{"query":{"query_string":{"query":"*","analyze_wildcard":true}},"filter":{"bool":{"must":[{"query":{"match":{"response":{"query":"503","type":"phrase"}}}},{"query":{"query_string":{"query":text_filter,"analyze_wildcard":true}}},{"range":{"@timestamp":{"gte":start_ts,"lte":end_ts}}}],"must_not":[]}}}}},
    {"index":state.index_pattern,"search_type":"count","ignore_unavailable":true},
    {"size":0,"aggs":{"2":{"date_histogram":{"field":"@timestamp","interval":"1d","pre_zone":"+01:00","pre_zone_adjust_large_interval":true,"min_doc_count":1,"extended_bounds":{"min":start_ts,"max":end_ts}},"aggs":{"3":{"terms":{"field":"extension","size":5,"order":{"_count":"desc"}}}}}},"highlight":{"pre_tags":["@kibana-highlighted-field@"],"post_tags":["@/kibana-highlighted-field@"],"fields":{"*":{}},"fragment_size":2147483647},"query":{"filtered":{"query":{"query_string":{"query":"response: 503","analyze_wildcard":true}},"filter":{"bool":{"must":[{"query":{"query_string":{"query":text_filter,"analyze_wildcard":true}}},{"range":{"@timestamp":{"gte":start_ts,"lte":end_ts}}}],"must_not":[]}}}}},
    {"index":state.index_pattern,"search_type":"count","ignore_unavailable":true},
    {"size":0,"aggs":{"2":{"terms":{"field":"host","size":5,"order":{"_count":"desc"}},"aggs":{"3":{"terms":{"field":"extension","size":5,"order":{"_count":"desc"}}}}}},"highlight":{"pre_tags":["@kibana-highlighted-field@"],"post_tags":["@/kibana-highlighted-field@"],"fields":{"*":{}},"fragment_size":2147483647},"query":{"filtered":{"query":{"query_string":{"query":"response: 503","analyze_wildcard":true}},"filter":{"bool":{"must":[{"query":{"query_string":{"query":text_filter,"analyze_wildcard":true}}},{"range":{"@timestamp":{"gte":start_ts,"lte":end_ts}}}],"must_not":[]}}}}},
    {"index":state.index_pattern,"search_type":"count","ignore_unavailable":true},
    {"size":0,"aggs":{"2":{"terms":{"field":"request.raw","size":10,"order":{"_count":"desc"}}}},"highlight":{"pre_tags":["@kibana-highlighted-field@"],"post_tags":["@/kibana-highlighted-field@"],"fields":{"*":{}},"fragment_size":2147483647},"query":{"filtered":{"query":{"query_string":{"query":"response: 503","analyze_wildcard":true}},"filter":{"bool":{"must":[{"query":{"query_string":{"query":text_filter,"analyze_wildcard":true}}},{"range":{"@timestamp":{"gte":start_ts,"lte":end_ts}}}],"must_not":[]}}}}},
    {"index":state.index_pattern,"search_type":"count","ignore_unavailable":true},
    {"size":0,"aggs":{"2":{"terms":{"field":"geo.src","size":10,"order":{"_count":"desc"}}}},"highlight":{"pre_tags":["@kibana-highlighted-field@"],"post_tags":["@/kibana-highlighted-field@"],"fields":{"*":{}},"fragment_size":2147483647},"query":{"filtered":{"query":{"query_string":{"query":"response: 503","analyze_wildcard":true}},"filter":{"bool":{"must":[{"query":{"query_string":{"query":text_filter,"analyze_wildcard":true}}},{"range":{"@timestamp":{"gte":start_ts,"lte":end_ts}}}],"must_not":[]}}}}}
  ];

  esClient.msearch({
    preference: end_ts.toString(),
    body: bulk_body,
    requestTimeout: state.timeout
  }, function (err, resp) {
    if (err) {
      result_callback( { result_code: 'ERROR', visualizations: 5 } );
    }

    result_callback( { result_code: 'OK', visualizations: 5 } );
  });
}

module.exports.kibana_msearch = function(esClient, state, driver_data, operation_parameters, result_callback) {
  var end_ts = _.random(state.days.start, state.days.end);
  var start_ts = end_ts - (state.period * 24 * 3600 * 1000);

  var match_term_count = state['match_term_count'];
  if(operation_parameters.match_term_count && operation_parameters.match_term_count > 0) {
    match_term_count = operation_parameters.match_term_count;
  }

  var text_filter;
  if(match_term_count > 0) {
    var terms = [];
    for(var i = 0; i < match_term_count; i++) {
      terms.push(driver_data.terms[_.random(0, driver_data.terms.length - 1)]);
    }

    text_filter = "text: " + terms.join(" ");
  } else {
    text_filter = "*";
  }

  var bulk_body = [
    {"index":state.index_pattern,"search_type":"count","ignore_unavailable":true},
    {"query":{"filtered":{"query":{"query_string":{"query":"*","analyze_wildcard":true}},"filter":{"bool":{"must":[{"query":{"query_string":{"query":text_filter,"analyze_wildcard":true}}},{"range":{"@timestamp":{"gte":start_ts,"lte":end_ts}}}],"must_not":[]}}}},"size":0,"aggs":{"3":{"terms":{"field":"ip","size":10,"order":{"_count":"desc"}},"aggs":{"4":{"sum":{"field":"bytes"}}}}}},
    {"index":state.index_pattern,"search_type":"count","ignore_unavailable":true},
    {"size":0,"aggs":{"2":{"date_histogram":{"field":"@timestamp","interval":"1d","pre_zone":"+01:00","pre_zone_adjust_large_interval":true,"min_doc_count":1,"extended_bounds":{"min":start_ts,"max":end_ts}},"aggs":{"1":{"cardinality":{"field":"ip"}}}}},"highlight":{"pre_tags":["@kibana-highlighted-field@"],"post_tags":["@/kibana-highlighted-field@"],"fields":{"*":{}}},"query":{"filtered":{"query":{"match_all":{}},"filter":{"bool":{"must":[{"query":{"query_string":{"query":text_filter,"analyze_wildcard":true}}},{"range":{"@timestamp":{"gte":start_ts,"lte":end_ts}}}],"must_not":[]}}}}},
    {"index":state.index_pattern,"search_type":"count","ignore_unavailable":true},
    {"size":0,"aggs":{"2":{"date_histogram":{"field":"@timestamp","interval":"1d","pre_zone":"+01:00","pre_zone_adjust_large_interval":true,"min_doc_count":1,"extended_bounds":{"min":start_ts,"max":end_ts}},"aggs":{"3":{"terms":{"field":"response","size":5,"order":{"_count":"desc"}}}}}},"highlight":{"pre_tags":["@kibana-highlighted-field@"],"post_tags":["@/kibana-highlighted-field@"],"fields":{"*":{}}},"query":{"filtered":{"query":{"match_all":{}},"filter":{"bool":{"must":[{"query":{"query_string":{"query":text_filter,"analyze_wildcard":true}}},{"range":{"@timestamp":{"gte":start_ts,"lte":end_ts}}}],"must_not":[]}}}}},
    {"index":state.index_pattern,"search_type":"count","ignore_unavailable":true},
    {"size":0,"aggs":{"2":{"terms":{"field":"referer","size":10,"order":{"_count":"desc"}}}},"highlight":{"pre_tags":["@kibana-highlighted-field@"],"post_tags":["@/kibana-highlighted-field@"],"fields":{"*":{}}},"query":{"filtered":{"query":{"match_all":{}},"filter":{"bool":{"must":[{"query":{"query_string":{"query":text_filter,"analyze_wildcard":true}}},{"range":{"@timestamp":{"gte":start_ts,"lte":end_ts}}}],"must_not":[]}}}}},
    {"index":state.index_pattern,"search_type":"count","ignore_unavailable":true},
    {"size":0,"aggs":{"2":{"terms":{"field":"geo.src","size":10,"order":{"_count":"desc"}}}},"highlight":{"pre_tags":["@kibana-highlighted-field@"],"post_tags":["@/kibana-highlighted-field@"],"fields":{"*":{}}},"query":{"filtered":{"query":{"match_all":{}},"filter":{"bool":{"must":[{"query":{"query_string":{"query":text_filter,"analyze_wildcard":true}}},{"range":{"@timestamp":{"gte":start_ts,"lte":end_ts}}}],"must_not":[]}}}}},
    {"index":state.index_pattern,"search_type":"count","ignore_unavailable":true},
    {"size":0,"aggs":{"2":{"terms":{"field":"response","size":5,"order":{"_count":"desc"}}}},"highlight":{"pre_tags":["@kibana-highlighted-field@"],"post_tags":["@/kibana-highlighted-field@"],"fields":{"*":{}}},"query":{"filtered":{"query":{"match_all":{}},"filter":{"bool":{"must":[{"query":{"query_string":{"query":text_filter,"analyze_wildcard":true}}},{"range":{"@timestamp":{"gte":start_ts,"lte":end_ts}}}],"must_not":[]}}}}}
  ];

  esClient.msearch({
    preference: end_ts.toString(),
    body: bulk_body,
    requestTimeout: state.timeout
  }, function (err, resp) {
    if (err) {
      result_callback( { result_code: 'ERROR', visualizations: 6 } );
    }

    result_callback( { result_code: 'OK', visualizations: 6 } );
  });
}


function parse_days(str) {
  var interval, start, end;
  var absolute_day = /^(\d{4}-\d{2}-\d{2})$/;
  var absolute_day_interval = /^(\d{4}-\d{2}-\d{2}),(\d{4}-\d{2}-\d{2})$/;
  var relative_day_interval = /^([+-]?\d+),([+-]?\d+)$/;
 
  var match = absolute_day.exec(str);

  if (match) {
    start = moment(match[1]).utc().startOf('day').valueOf();
    end = moment(match[1]).utc().endOf('day').valueOf();

    interval = { start: start, end: end};
  } 

  match = absolute_day_interval.exec(str);

  if (match) {
    start = moment(match[1]).utc().startOf('day').valueOf();
    end = moment(match[2]).utc().endOf('day').valueOf();

    interval = { start: start, end: end};
  }

  match = relative_day_interval.exec(str);

  if (match) {
    start = moment().utc().startOf('day').add('days', parseInt(match[1])).valueOf();
    end = moment().utc().endOf('day').add('days', parseInt(match[2])).valueOf();

    interval = { start: start, end: end};
  }

  return interval;
}

function set_state_value(name, state, parameters, default_value) {
  if (parameters && parameters[name]) {
    state[name] = parameters[name];
  } else {
    state[name] = default_value;
  }
}

function load_string_file(str_file) {
  try {
    var file_data = fs.readFileSync(str_file, {encoding: 'utf-8'});
    var string_array = file_data.split(/\r?\n/);
    return string_array;
  }
  catch (e) {
    var logmsg = 'makelogs_kibana error: unable to load file ' + str_file + ': ' + e.message;
    util.log(logmsg);
    return undefined;
  }
}
