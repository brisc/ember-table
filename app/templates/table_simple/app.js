(function() {

  window.App = Ember.Application.create();

  App.ApplicationView = Ember.View.extend({
    classNames: 'ember-app',
    templateName: 'application'
  });

  App.ApplicationController = Ember.Controller.extend({
    numRows: 100,
    columns: Ember.computed(function() {
      var closeColumn, dateColumn, highColumn, lowColumn, openColumn;
      dateColumn = Ember.Table.ColumnDefinition.create({
        columnWidth: 150,
        headerCellName: 'Date',
        getCellContent: function(row) {
          return row['date'].toDateString();
        }
      });
      openColumn = Ember.Table.ColumnDefinition.create({
        columnWidth: 100,
        headerCellName: 'Open',
        getCellContent: function(row) {
          return row['open'].toFixed(2);
        }
      });
      highColumn = Ember.Table.ColumnDefinition.create({
        columnWidth: 100,
        headerCellName: 'High',
        getCellContent: function(row) {
          return row['high'].toFixed(2);
        }
      });
      lowColumn = Ember.Table.ColumnDefinition.create({
        columnWidth: 100,
        headerCellName: 'Low',
        getCellContent: function(row) {
          return row['low'].toFixed(2);
        }
      });
      closeColumn = Ember.Table.ColumnDefinition.create({
        columnWidth: 100,
        headerCellName: 'Close',
        getCellContent: function(row) {
          return row['close'].toFixed(2);
        }
      });
      return [dateColumn, openColumn, highColumn, lowColumn, closeColumn];
    }),
    content: Ember.computed(function() {
      var _i, _ref, _results;
      return (function() {
        _results = [];
        for (var _i = 0, _ref = this.get('numRows'); 0 <= _ref ? _i < _ref : _i > _ref; 0 <= _ref ? _i++ : _i--){ _results.push(_i); }
        return _results;
      }).apply(this).map(function(index) {
        var date;
        date = new Date();
        date.setDate(date.getDate() + index);
        return {
          date: date,
          open: Math.random() * 100 - 50,
          high: Math.random() * 100 - 50,
          low: Math.random() * 100 - 50,
          close: Math.random() * 100 - 50,
          volume: Math.random() * 1000000
        };
      });
    }).property('numRows')
  });

}).call(this);
