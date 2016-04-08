(function() {
  var updateInterval = 5000;

  var getTotalUrl = function(timestamp) { return '/api/day/' + timestamp + '/total'; };
  var getAverageUrl = function(timestamp) { return '/api/day/' + timestamp + '/average'; };
  var charts = {
    '.totals-chart': {},
    '.averages-chart': {}
  };

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

  var initChart = function(selector, data) {
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

  var update = function(counterSelector, chartSelector, value) {
    var chartData = charts[chartSelector];
    chartData.values[chartData.values.length - 1] = value;

    chartData.chart.update({
      labels: chartData.labels,
      series: [chartData.values]
    });

    $(counterSelector).text(value);
  };

  initLast7Days(getTotalUrl, _.partial(initChart, '.totals-chart'));
  initLast7Days(getAverageUrl, _.partial(initChart, '.averages-chart'));

  start(getTotalUrl(Date.now()), _.partial(update, '.totals .counter', '.totals-chart'));
  start(getAverageUrl(Date.now()), _.partial(update, '.averages .counter', '.averages-chart'));
})();
