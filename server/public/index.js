(function() {
  var updateInterval = 5000;
  var charts = {
    '.totals-chart': {},
    '.averages-chart': {}
  };

  var getTotalUrl = function(timestamp) { return '/api/day/' + timestamp + '/total'; };
  var getAverageUrl = function(timestamp) { return '/api/day/' + timestamp + '/average'; };

  var fetchAndHandle = function(url, handler) {
    $.get(url)
      .done(handler)
      .fail(function() { console.log('something went wrong'); });
  };

  var start = function(url, handler) {
    fetchAndHandle(url, handler);

    return setInterval(function() {
      fetchAndHandle(url, handler);
    }, updateInterval);
  };

  var getLast7Days = function(handler) {
    var today = Date.now();
    var days = _.map(_.range(7), function(i) {
      var current = moment.utc(today).add(-i, 'day');
      return handler(current.valueOf());
    });

    return days;
  };

  var initLast7Days = function(urlConstructor, chartConstructor) {
    var totals = getLast7Days(function(timestamp) {
      return {
        timestamp: timestamp,
        promise: $.get(urlConstructor(timestamp))
      };
    });

    var promises = _.map(totals, 'promise');
    $.when.apply($, promises).done(function() {
      var results = _.reduce(totals, function(results, current) {
        results.push({timestamp: current.timestamp, value: current.promise.responseJSON});
        return results;
      }, []);

      chartConstructor(results.reverse());
    });
  };

  var initChart = function(selector, charts, data) {
    var values = _.map(data, 'value');
    var labels = _.map(data, function(item) {
      return moment.utc(item.timestamp).format('MMMM Do');
    });

    charts[selector].labels = labels;
    charts[selector].values = values;
    charts[selector].chart = new Chartist.Line(selector, {
      labels: labels,
      series: [values]
    });
  };

  var update = function(counterSelector, chartSelector, charts, value) {
    var chartData = charts[chartSelector];
    chartData.values[chartData.values.length - 1] = value;

    chartData.chart.update({
      labels: chartData.labels,
      series: [chartData.values]
    });

    value = Math.round(value * 100) / 100;
    $(counterSelector).text(value);
  };

  var init = function() {
    initLast7Days(getTotalUrl, _.partial(initChart, '.totals-chart', charts));
    initLast7Days(getAverageUrl, _.partial(initChart, '.averages-chart', charts));

    start(getTotalUrl(Date.now()), _.partial(update, '.totals .counter .value', '.totals-chart', charts));
    start(getAverageUrl(Date.now()), _.partial(update, '.averages .counter .value', '.averages-chart', charts));
  };

  window.testableApi = {
    getTotalUrl: getTotalUrl,
    getAverageUrl: getAverageUrl,
    getLast7Days: getLast7Days,
    initChart: initChart,
    update: update
  };

  window.privateApi = {
    init: init
  };
})();
