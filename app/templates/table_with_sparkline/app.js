(function() {
  var randomWalk;

  window.App = Ember.Application.create();

  App.TableSparklineExample = Ember.Namespace.create();

  randomWalk = function(numSteps) {
    var lastValue, _i, _results;
    lastValue = 0;
    return (function() {
      _results = [];
      for (var _i = 0; 0 <= numSteps ? _i < numSteps : _i > numSteps; 0 <= numSteps ? _i++ : _i--){ _results.push(_i); }
      return _results;
    }).apply(this).map(function() {
      return lastValue = lastValue + d3.random.normal()();
    });
  };

  App.TableSparklineExample.SparkCellView = Ember.Table.TableCell.extend({
    template: Ember.Handlebars.compile(""),
    heightBinding: 'controller.rowHeight',
    sparkContent: Ember.computed(function() {
      return randomWalk(100);
    }).property(),
    onWidthDidChange: Ember.observer(function() {
      this.$('svg').remove();
      return this.renderD3View();
    }, 'width'),
    didInsertElement: function() {
      return this.renderD3View();
    },
    renderD3View: function() {
      var data, fill, g, h, len, line, max, min, p, svg, w, xscale, yscale;
      data = this.get('sparkContent');
      h = this.get('height');
      w = this.get('width');
      p = 2;
      min = Math.min.apply(null, data);
      max = Math.max.apply(null, data);
      len = data.length;
      fill = d3.scale.category10();
      xscale = d3.scale.linear().domain([0, len]).range([p, w - p]);
      yscale = d3.scale.linear().domain([min, max]).range([h - p, p]);
      line = d3.svg.line().x(function(d, i) {
        return xscale(i);
      }).y(function(d) {
        return yscale(d);
      });
      svg = d3.select("#" + (this.get('elementId'))).append('svg:svg').attr('height', h).attr('width', w);
      g = svg.append('svg:g');
      return g.append('svg:path').attr('d', line(data)).attr('stroke', function(d) {
        return fill(Math.round(Math.random()) * 10);
      }).attr('fill', 'none');
    }
  });

  App.ApplicationView = Ember.View.extend({
    classNames: 'ember-app',
    templateName: 'application'
  });

  App.ApplicationController = Ember.Controller.extend({
    numRows: 100,
    columns: Ember.computed(function() {
      var close, high, low, name, open, spark;
      name = Ember.Table.ColumnDefinition.create({
        columnWidth: 100,
        headerCellName: 'Name',
        getCellContent: function(row) {
          return 'Asset ' + row['name'];
        }
      });
      open = Ember.Table.ColumnDefinition.create({
        columnWidth: 100,
        headerCellName: 'Open',
        getCellContent: function(row) {
          return row['open'].toFixed(2);
        }
      });
      spark = Ember.Table.ColumnDefinition.create({
        columnWidth: 200,
        headerCellName: 'Sparkline',
        tableCellViewClass: 'App.TableSparklineExample.SparkCellView',
        getCellContent: Ember.K
      });
      close = Ember.Table.ColumnDefinition.create({
        columnWidth: 100,
        headerCellName: 'Close',
        getCellContent: function(row) {
          return row['close'].toFixed(2);
        }
      });
      low = Ember.Table.ColumnDefinition.create({
        columnWidth: 100,
        headerCellName: 'Low',
        getCellContent: function(row) {
          return row['low'].toFixed(2);
        }
      });
      high = Ember.Table.ColumnDefinition.create({
        columnWidth: 100,
        headerCellName: 'High',
        getCellContent: function(row) {
          return row['high'].toFixed(2);
        }
      });
      return [name, open, spark, close, low, high];
    }),
    content: Ember.computed(function() {
      var _i, _ref, _results;
      return (function() {
        _results = [];
        for (var _i = 0, _ref = this.get('numRows'); 0 <= _ref ? _i < _ref : _i > _ref; 0 <= _ref ? _i++ : _i--){ _results.push(_i); }
        return _results;
      }).apply(this).map(function(num, index) {
        var data;
        data = randomWalk(100);
        return {
          name: index,
          timeseries: data,
          open: data[0],
          close: data[99],
          low: Math.min.apply(null, data),
          high: Math.max.apply(null, data)
        };
      });
    }).property('numRows')
  });

}).call(this);
