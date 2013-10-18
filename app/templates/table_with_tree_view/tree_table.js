(function() {

  Number.prototype.toCurrency = function() {
    var value;
    if (isNaN(this) || !isFinite(this)) {
      return '-';
    }
    value = Math.abs(this).toFixed(2);
    value = value.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
    return (this < 0 ? '-$' : '$') + value;
  };

  Number.prototype.toPercent = function() {
    if (isNaN(this) || !isFinite(this)) {
      return '-';
    }
    return Math.abs(this * 100).toFixed(2) + "%";
  };

  App.TreeTableExample = Ember.Namespace.create();

  App.TreeTableExample.TreeDataAdapter = Ember.Mixin.create({
    data: null,
    columns: Ember.computed(function() {
      var columns, data, names;
      data = this.get('data');
      if (!data) {
        return;
      }
      names = this.get('data.value_factors').getEach('display_name');
      columns = names.map(function(name, index) {
        return Ember.Table.ColumnDefinition.create({
          index: index,
          headerCellName: name,
          getCellContent: function(row) {
            var object;
            object = row.values[this.get('index')];
            if (object.type === 'money') {
              return object.value.toCurrency();
            }
            if (object.type === 'percent') {
              return object.value.toPercent();
            }
            return "-";
          }
        });
      });
      columns.unshiftObject(this.get('groupingColumn'));
      return columns;
    }).property('data.valueFactors.@each', 'groupingColumn'),
    groupingColumn: Ember.computed(function() {
      var groupingFactors, name;
      groupingFactors = this.get('data.grouping_factors');
      name = groupingFactors.getEach('display_name').join(' ▸ ');
      return Ember.Table.ColumnDefinition.create({
        headerCellName: name,
        columnWidth: 400,
        maxWidth: 700,
        isTreeColumn: true,
        isSortable: false,
        textAlign: 'text-align-left',
        headerCellViewClass: 'App.TreeTableExample.HeaderTreeCell',
        tableCellViewClass: 'App.TreeTableExample.TreeCell',
        contentPath: 'group_value'
      });
    }).property('data.grouping_factors.@each'),
    root: Ember.computed(function() {
      var data;
      data = this.get('data');
      if (!data) {
        return;
      }
      return this.createTree(null, data.root);
    }).property('data', 'sortAscending', 'sortColumn'),
    rows: Ember.computed(function() {
      var maxGroupingLevel, root, rows;
      root = this.get('root');
      if (!root) {
        return Ember.A();
      }
      rows = this.flattenTree(null, root, Ember.A());
      this.computeStyles(null, root);
      maxGroupingLevel = Math.max.apply(rows.getEach('groupingLevel'));
      rows.forEach(function(row) {
        return row.computeRowStyle(maxGroupingLevel);
      });
      return rows;
    }).property('root'),
    bodyContent: Ember.computed(function() {
      var rows;
      rows = this.get('rows');
      if (!rows) {
        return Ember.A();
      }
      rows = rows.slice(1, rows.get('length'));
      return rows.filterProperty('isShowing');
    }).property('rows'),
    footerContent: Ember.computed(function() {
      var rows;
      rows = this.get('rows');
      if (!rows) {
        return Ember.A();
      }
      return rows.slice(0, 1);
    }).property('rows'),
    orderBy: function(item1, item2) {
      var result, sortAscending, sortColumn, value1, value2;
      sortColumn = this.get('sortColumn');
      sortAscending = this.get('sortAscending');
      if (!sortColumn) {
        return 1;
      }
      value1 = sortColumn.getCellContent(item1.get('content'));
      value2 = sortColumn.getCellContent(item2.get('content'));
      result = Ember.compare(value1, value2);
      if (sortAscending) {
        return result;
      } else {
        return -result;
      }
    },
    createTree: function(parent, node) {
      var children, row,
        _this = this;
      row = App.TreeTableExample.TreeTableRow.create();
      children = (node.children || []).map(function(child) {
        return _this.createTree(row, child);
      });
      row.setProperties({
        isRoot: !parent,
        isLeaf: Ember.isEmpty(children),
        content: node,
        parent: parent,
        children: children,
        groupName: node.group_name,
        isCollapsed: false
      });
      return row;
    },
    flattenTree: function(parent, node, rows) {
      var _this = this;
      rows.pushObject(node);
      (node.children || []).forEach(function(child) {
        return _this.flattenTree(node, child, rows);
      });
      return rows;
    },
    computeStyles: function(parent, node) {
      var _this = this;
      node.computeStyles(parent);
      return node.get('children').forEach(function(child) {
        return _this.computeStyles(node, child);
      });
    }
  });

  App.TreeTableExample.TreeTableRow = Ember.Table.Row.extend({
    content: null,
    children: null,
    parent: null,
    isRoot: false,
    isLeaf: false,
    isCollapsed: false,
    isShowing: true,
    indentationSpacing: 20,
    groupName: null,
    computeStyles: function(parent) {
      var groupingLevel, indentType, indentation, isShowing, pGroupingLevel, spacing;
      groupingLevel = 0;
      indentation = 0;
      isShowing = true;
      if (parent) {
        isShowing = parent.get('isShowing') && !parent.get('isCollapsed');
        pGroupingLevel = parent.get('groupingLevel');
        groupingLevel = pGroupingLevel;
        if (parent.get('groupName') !== this.get('groupName')) {
          groupingLevel += 1;
        }
        indentType = groupingLevel === pGroupingLevel ? 'half' : 'full';
        spacing = this.get('indentationSpacing');
        if (!parent.get('isRoot')) {
          indentation = parent.get('indentation');
          indentation += (indentType === 'half' ? spacing / 2 : spacing);
        }
      }
      this.set('groupingLevel', groupingLevel);
      this.set('indentation', indentation);
      return this.set('isShowing', isShowing);
    },
    computeRowStyle: function(maxLevels) {
      var level;
      level = this.getFormattingLevel(this.get('groupingLevel'), maxLevels);
      return this.set('rowStyle', "ember-table-row-style-" + level);
    },
    recursiveCollapse: function(isCollapsed) {
      this.set('isCollapsed', isCollapsed);
      return this.get('children').forEach(function(child) {
        return child.recursiveCollapse(isCollapsed);
      });
    },
    getFormattingLevel: function(level, maxLevels) {
      switch (maxLevels) {
        case 1:
          return 5;
        case 2:
          if (level === 1) {
            return 2;
          }
          return 5;
        case 3:
          if (level === 1) {
            return 1;
          }
          if (level === 2) {
            return 3;
          }
          return 5;
        case 4:
          if (level === 1) {
            return 1;
          }
          if (level === 2) {
            return 2;
          }
          if (level === 4) {
            return 4;
          }
          return 5;
        case 5:
          return level;
        default:
          if (level === maxLevels) {
            return 5;
          }
          return Math.min(level, 4);
      }
    }
  });

  App.TreeTableExample.HeaderCell = Ember.Table.HeaderCell.extend({
    templateName: 'table-tree-header-cell'
  });

  App.TreeTableExample.TreeCell = Ember.Table.TableCell.extend({
    templateName: 'table-tree-cell',
    classNames: 'ember-table-table-tree-cell',
    styleBindings: ['indentation:padding-left'],
    indentation: Ember.computed.alias('row.indentation')
  });

  App.TreeTableExample.HeaderTreeCell = Ember.Table.HeaderCell.extend({
    templateName: 'table-header-tree-cell',
    classNames: 'ember-table-table-header-tree-cell'
  });

  App.TreeTableExample.TableComponent = Ember.Table.EmberTableComponent.extend(App.TreeTableExample.TreeDataAdapter, {
    numFixedColumns: 1,
    isCollapsed: false,
    isHeaderHeightResizable: true,
    rowHeight: 30,
    hasHeader: true,
    minHeaderHeight: 30,
    hasFooter: true,
    sortAscending: false,
    sortColumn: null,
    selection: null,
    actions: {
      toggleTableCollapse: function(event) {
        var children, isCollapsed;
        this.toggleProperty('isCollapsed');
        isCollapsed = this.get('isCollapsed');
        children = this.get('root.children');
        if (!(children && children.get('length') > 0)) {
          return;
        }
        children.forEach(function(child) {
          return child.recursiveCollapse(isCollapsed);
        });
        return this.notifyPropertyChange('rows');
      },
      toggleCollapse: function(row) {
        row.toggleProperty('isCollapsed');
        return Ember.run.next(this, function() {
          return this.notifyPropertyChange('rows');
        });
      },
      sortByColumn: function(column) {
        column.toggleProperty('sortAscending');
        this.set('sortColumn', column);
        return this.set('sortAscending', column.get('sortAscending'));
      },
      onSelectionsDidChange: Ember.observer(function() {
        return console.log('selectionsDidChange');
      }, 'selection.@each')
    }
  });

}).call(this);
