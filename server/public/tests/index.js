describe('front-end', function() {
  it('should produce correct url using getTotalUrl', function() {
    expect(testableApi.getTotalUrl(42)).to.deep.equal('/api/day/42/total');
  });

  it('should produce correct url using getAverageUrl', function() {
    expect(testableApi.getAverageUrl(42)).to.deep.equal('/api/day/42/average');
  });

  describe('getLast7Days', function() {
    var clock;

    before(function() {
      clock = sinon.useFakeTimers(new Date(2011, 11, 25).valueOf());
    });

    after(function() {
      clock.restore();
    });

    it('should produce transformed timstamps for the last 7 days', function() {
      var results = testableApi.getLast7Days(function(t) { return t + 'TEST'; });
      var expected = ["1324771200000TEST",
                      "1324684800000TEST",
                      "1324598400000TEST",
                      "1324512000000TEST",
                      "1324425600000TEST",
                      "1324339200000TEST",
                      "1324252800000TEST"];
      expect(results).to.deep.equal(expected);
    });
  });

  describe('initChart', function() {
    it('should fill charts object and init the chart', function() {
      var charts = {
        selector: {}
      };

      var chartistSelector;
      var chartistOptions;
      window.Chartist = {
        Line: function(selector, options) {
          chartistSelector = selector;
          chartistOptions = options;

          return {test: true};
        }
      };

      var data = [{value: 42, timestamp: new Date(2011, 11, 25).valueOf()}];
      testableApi.initChart('selector', charts, data);
      var expected = {
        "selector": {
          "labels": ["December 25th"],
          "values": [42],
          "chart": {test: true}
        }
      };

      expect(chartistSelector).to.equal('selector');
      expect(chartistOptions).to.deep.equal({labels: ["December 25th"], series: [[42]]});
      expect(charts).to.deep.equal(expected);
    });
  });

  describe('update', function() {
    it('should update charts and counters', function() {
      var counterNewValue;

      window.$ = function(selector) {
        return {text: function(value) {
          counterNewValue = value;
        }};
      };

      var charts = {
        'chart-selector': {
          values: [1, 2, 3],
          labels: ['A', 'B', 'C'],
          chart: {
            update: sinon.stub()
          }
        }
      };

      var expectedCharts = {
        'chart-selector': {
          values: [1, 2, 100],
          labels: ['A', 'B', 'C'],
          chart: {
            update: sinon.stub()
          }
        }
      };

      testableApi.update('counter-selector', 'chart-selector', charts, 100);

      expect(counterNewValue).to.equal(100);
      expect(charts['chart-selector'].values).to.deep.equal([1, 2, 100]);
      expect(charts['chart-selector'].labels).to.deep.equal(['A', 'B', 'C']);
      expect(charts['chart-selector'].chart.update.args[0][0]).to.deep.equal({
        series: [[1, 2, 100]],
        labels: ['A', 'B', 'C']
      });
    });
  });
});
