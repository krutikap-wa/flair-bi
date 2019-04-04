var COMMON = require('../extras/common.js')(),
    UTIL = require('../extras/util.js')(),
    LEGEND = require('../extras/legend_barcharts.js')();

function stackedverticalbar() {

    var _NAME = 'stackedverticalbar';

    var _config,
        _dimension,
        _measure,
        _showLegend,
        _legendPosition,
        _sort,
        _tooltip,
        _showXaxis,
        _showYaxis,
        _showXaxisLabel,
        _showYaxisLabel,
        _xAxisColor,
        _yAxisColor,
        _showGrid,
        _stacked,
        _displayName,
        _legendData,
        _showValues = [],
        _displayNameForMeasure = [],
        _fontStyle = [],
        _fontWeight = [],
        _numberFormat = [],
        _textColor = [],
        _displayColor = [],
        _borderColor = [],
        _fontSize = [];

    var _local_svg,
        _Local_data;

    var x, y;
    var margin = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 45
    };
    var _local_svg, _Local_data, _originalData, _localLabelStack = [], legendBreakCount = 1;
    var legendSpace = 20, axisLabelSpace = 20, offsetX = 16, offsetY = 3, div;
    var parentWidth, parentHeight, plotWidth, plotHeight, container;

    var filter = false, filterData = [];
    var threshold = [];

    var _setConfigParams = function (config) {
        this.dimension(config.dimension);
        this.measure(config.measure);
        this.showLegend(config.showLegend);
        this.legendPosition(config.legendPosition);

        this.showXaxis(config.showXaxis);
        this.showYaxis(config.showYaxis);
        this.showXaxisLabel(config.showXaxisLabel);

        this.showYaxisLabel(config.showYaxisLabel);
        this.xAxisColor(config.xAxisColor);
        this.yAxisColor(config.yAxisColor);
        this.displayName(config.displayName);
        this.showYaxis(config.showYaxis);
        this.showXaxisLabel(config.showXaxisLabel);

        this.showValues(config.showValues);
        this.displayNameForMeasure(config.displayNameForMeasure);
        this.fontStyle(config.fontStyle);
        this.fontWeight(config.fontWeight);
        this.numberFormat(config.numberFormat);
        this.textColor(config.textColor);
        this.displayColor(config.displayColor);
        this.borderColor(config.borderColor);
        this.fontSize(config.fontSize);

        this.legendData(config.displayColor, config.measure);
    }

    var _buildTooltipData = function (datum, chart) {
        var output = "";
        output += "<table><tr>"
            + "<th>" + chart.dimension() + ": </th>"
            + "<td>" + datum.data[chart.dimension()] + "</td>"
            + "</tr><tr>"
            + "<th>" + datum.key + ": </th>"
            + "<td>" + datum.data[datum.key] + "</td>"
            + "</tr></table>";

        return output;
    }

    var onLassoStart = function (lasso, scope) {
        return function () {
            if (filter) {
                lasso.items().selectAll('rect')
                    .classed('not_possible', true)
                    .classed('selected', false);
            }
        }
    }

    var onLassoDraw = function (lasso, scope) {
        return function () {
            filter = true;
            lasso.items().selectAll('rect')
                .classed('selected', false);

            lasso.possibleItems().selectAll('rect').each(function (d, i) {
                var item = d3.select(this).node().className.baseVal.split(' ')[0];
                d3.selectAll('rect.' + item)
                    .classed('not_possible', false)
                    .classed('possible', true);

            });
            lasso.possibleItems().selectAll('rect')
                .classed('not_possible', false)
                .classed('possible', true);

            lasso.notPossibleItems().selectAll('rect')
                .classed('not_possible', true)
                .classed('possible', false);
        }
    }

    var onLassoEnd = function (lasso, scope) {
        return function () {
            var data = lasso.selectedItems().data();
            if (!filter) {
                return;
            }
            if (data.length > 0) {
                lasso.items().selectAll('rect')
                    .classed('not_possible', false)
                    .classed('possible', false);
            }

            lasso.selectedItems().selectAll('rect')
                .classed('selected', true)

            lasso.notSelectedItems().selectAll('rect');

            var confirm = $(scope).parent().find('div.confirm')
                .css('visibility', 'visible');

            var _filter = [];
            var keys = UTIL.getMeasureList(data[0].data, _dimension);
            data.forEach(function (d) {
                var obj = new Object();
                var temp = d.data[_dimension[0]];
                var searchObj = _filter.find(o => o[_dimension[0]] === temp);
                if (searchObj == undefined) {
                    obj[_dimension[0]] = d.data[_dimension[0]];
                    for (var index = 0; index < keys.length; index++) {
                        obj[keys[index]] = d.data[keys[index]];
                    }
                    _filter.push(obj)
                }
            });
            if (_filter.length > 0) {
                filterData = _filter;
            }
        }
    }

    var applyFilter = function (chart) {
        return function () {
            if (filterData.length > 0) {
                chart.update(filterData);
            }
        }
    }

    var clearFilter = function () {
        return function () {
            chart.update(_originalData);
        }
    }

    var _handleMouseOverFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            d3.select(this).style('cursor', 'pointer')
                .style('cursor', 'pointer')
                .style('fill', COMMON.HIGHLIGHTER);
            var border = UTIL.getDisplayColor(_measure.indexOf(d.key), _displayColor)
            if (tooltip) {
                UTIL.showTooltip(tooltip);
                UTIL.updateTooltip.call(tooltip, _buildTooltipData(d, me), container, border);
            }
        }
    }

    var _handleMouseMoveFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            if (tooltip) {
                var border = UTIL.getDisplayColor(_measure.indexOf(d.key), _displayColor)
                UTIL.updateTooltip.call(tooltip, _buildTooltipData(d, me, border), container, border);
            }
        }
    }

    var _handleMouseOutFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            d3.select(this).style('cursor', 'default')
                .style('fill', function (d1, i) {
                    return UTIL.getDisplayColor(_measure.indexOf(d1.key), _displayColor);
                })
                .style('stroke', function (d1, i) {
                    return UTIL.getBorderColor(_measure.indexOf(d1.key), _borderColor);
                });

            if (tooltip) {
                UTIL.hideTooltip(tooltip);
            }
        }
    }

    function chart(selection) {
        _local_svg = selection;

        selection.each(function (data) {
            _originalData = data;
            div = d3.select(this).node().parentNode;

            _local_svg = d3.select(this);
            var width = div.clientWidth,
                height = div.clientHeight;

            parentWidth = width - 2 * COMMON.PADDING - margin.left;
            parentHeight = (height - 2 * COMMON.PADDING - axisLabelSpace * 2);

            container = _local_svg.append('g')
                .attr('transform', 'translate(' + COMMON.PADDING + ', ' + COMMON.PADDING + ')');

            _local_svg.attr('width', width)
                .attr('height', height)

            d3.select(div).append('div')
                .attr('class', 'sort_selection');

            d3.select(div).append('div')
                .attr('class', 'arrow-down');

            var str = UTIL.createAlert($(div).attr('id'), _measure);
            $(div).append(str);

            var _filter = UTIL.createFilterElement()
            $(div).append(_filter);

            $(document).on('click', '_local_svg', function (e) {
                if ($("#myonoffswitch").prop('checked') == false) {
                    var element = e.target
                    if (element.tagName == "_local_svg") {
                        $('#Modal_' + $(div).attr('id') + ' .measure').val('')
                        $('#Modal_' + $(div).attr('id') + ' .threshold').val('')
                        $('#Modal_' + $(div).attr('id') + ' .measure').attr('disabled', false)
                        $('#Modal_' + $(div).attr('id')).modal('toggle');
                    }
                }
            })

            $(document).on('click', '#Modal_' + $(div).attr('id') + ' .ThresholdSubmit', function (e) {
                var newValue = $('#Modal_' + $(div).attr('id') + ' .threshold').val();
                var obj = new Object()
                obj.measure = $('#Modal_' + $(div).attr('id') + ' .measure').val()
                obj.threshold = newValue;
                threshold.push(obj);
                $('#Modal_' + $(div).attr('id')).modal('toggle');
            })


            var legendWidth = 0,
                legendHeight = 0;

            plotWidth = parentWidth;
            plotHeight = parentHeight;

            if (_showLegend) {
                var stackedverticalbarLegend = LEGEND.bind(chart);

                var result = stackedverticalbarLegend(_legendData, container, {
                    width: parentWidth,
                    height: parentHeight,
                    legendBreakCount: legendBreakCount
                });

                legendWidth = result.legendWidth;
                legendHeight = result.legendHeight;
                legendBreakCount = result.legendBreakCount;

                switch (_legendPosition) {
                    case 'Top':
                        plotHeight = parentHeight - legendHeight - axisLabelSpace;
                        break;
                    case 'Bottom':
                        plotHeight = parentHeight - legendHeight - axisLabelSpace * 2;
                        break;
                    case 'Right':
                    case 'Left':
                        plotWidth = parentWidth - legendWidth;
                        break;
                }

                if ((_legendPosition == 'Top') || (_legendPosition == 'Bottom')) {
                    plotWidth = parentWidth;
                    plotHeight = parentHeight - 3 * axisLabelSpace;
                    legendSpace = 20;
                } else if ((_legendPosition == 'Left') || (_legendPosition == 'Right')) {
                    var legend = _local_svg.selectAll('.item');
                    legendSpace = legend.node().parentNode.getBBox().width;
                    plotWidth = (parentWidth - legendSpace) - margin.left + axisLabelSpace;
                    plotHeight = parentHeight;

                    legend.attr('transform', function (d, i) {
                        if (_legendPosition == 'Left') {
                            return 'translate(0, ' + i * 20 + ')';

                        }
                        else if (_legendPosition == 'Right') {
                            return 'translate(' + (parentWidth - legendSpace + axisLabelSpace) + ', ' + i * 20 + ')';
                        }
                    });
                }
            }
            else {
                legendSpace = 0;
                plotWidth = parentWidth;
                plotHeight = parentHeight;
            }

            if (_tooltip) {
                tooltip = d3.select(this.parentNode).select('#tooltip');
            }

            drawPlot.call(this, data);
        });
    }

    var drawViz = function (element) {
        var me = this;

        element.append('rect')
            .style('fill', function (d, i) {
                return UTIL.getDisplayColor(_measure.indexOf(d.key), _displayColor);;
            })
            .style('stroke', function (d, i) {
                return UTIL.getBorderColor(_measure.indexOf(d.key), _borderColor);
            })
            .attr("x", function (d) {
                return x(d.data[_dimension[0]]);
            })
            .attr('class', function (d, i) {
                return d.data[_dimension[0]];
            })
            .attr("y", function (d) { return y(d[1]); })
            .attr("height", function (d) { return y(d[0]) - y(d[1]); })
            .attr("width", x.bandwidth())
            .style('stroke-width', 2)
            .on('mouseover', _handleMouseOverFn.call(chart, tooltip, _local_svg))
            .on('mousemove', _handleMouseMoveFn.call(chart, tooltip, _local_svg))
            .on('mouseout', _handleMouseOutFn.call(chart, tooltip, _local_svg))
            .on('click', function (d) {
                if ($("#myonoffswitch").prop('checked') == false) {
                    $('#Modal_' + $(div).attr('id') + ' .measure').val(d.key);
                    $('#Modal_' + $(div).attr('id') + ' .threshold').val('');
                    $('#Modal_' + $(div).attr('id') + ' .measure').attr('disabled', true);;
                    $('#Modal_' + $(div).attr('id')).modal('toggle');
                }
                else {
                    var confirm = d3.select('.confirm')
                        .style('visibility', 'visible');
                    var _filter = _Local_data.filter(function (d1) {
                        return d.data[_dimension[0]] === d1[_dimension[0]]
                    })
                    var rect = d3.select(this);
                    if (rect.classed('selected')) {
                        rect.classed('selected', false);
                        filterData.map(function (val, i) {
                            if (val[_dimension[0]] == d[_dimension[0]]) {
                                filterData.splice(i, 1)
                            }
                        })
                    } else {
                        rect.classed('selected', true);
                        var isExist = filterData.filter(function (val) {
                            if (val[_dimension[0]] == d[_dimension[0]]) {
                                return val
                            }
                        })
                        if (isExist.length == 0) {
                            filterData.push(_filter[0]);
                        }
                    }
                }
            })

        element.append('text')
            .text(function (d, i) {
                return UTIL.getFormattedValue(d.data[d.key], UTIL.getValueNumberFormat(_measure.indexOf(d.key), _numberFormat));
            })
            .attr('x', function (d, i) {
                return x(d.data[_dimension[0]]) + x.bandwidth() / 2;
            })
            .attr('y', function (d, i) {
                return y(d[1]) + 5;
            })
            .attr('dy', function (d, i) {
                return offsetX / 2;
            })
            .style('text-anchor', 'middle')
            .attr('visibility', function (d, i) {
                return UTIL.getVisibility(_showValues[_measure.indexOf(d.key)]);
            })
            .attr('visibility', function (d, i) {
                if (this.getAttribute('visibility') == 'hidden') return 'hidden';
                var rect = d3.select(this.previousElementSibling).node(),
                    rectWidth = rect.getAttribute('width'),
                    rectHeight = rect.getAttribute('height');

                if (rectHeight <= ((offsetX / 2) + parseFloat(d3.select(this).style('font-size').replace('px', '')))) {
                    return 'hidden';
                }

                if (this.getComputedTextLength() > parseFloat(rectWidth)) {
                    return 'hidden';
                }

                return 'visible';
            })
            .style('font-style', function (d, i) {
                return _fontStyle[_measure.indexOf(d.key)]["fontStyle"];
            })
            .style('font-weight', function (d, i) {
                return _fontWeight[_measure.indexOf(d.key)]["fontWeight"];
            })
            .style('font-size', function (d, i) {
                return _fontSize[_measure.indexOf(d.key)]['fontSize'] + 'px';
            })
            .style('fill', function (d, i) {
                return _textColor[_measure.indexOf(d.key)]["textColor"];
            });
    }
    var drawPlot = function (data) {
        var me = this;
        _Local_data = data;

        var confirm = $(me).parent().find('div.confirm')
            .css('visibility', 'hidden');

        var plot = container.append('g')
            .attr('class', 'stackedverticalbar-plot')
            .classed('plot', true)
            .attr('transform', function () {
                if (_legendPosition == 'Top') {
                    return 'translate(' + margin.left + ', ' + parseInt(legendSpace * 2 + (20 * parseInt(legendBreakCount))) + ')';
                } else if (_legendPosition == 'Bottom') {
                    return 'translate(' + margin.left + ', 0)';
                } else if (_legendPosition == 'Left') {
                    return 'translate(' + (legendSpace + margin.left + axisLabelSpace) + ', 0)';
                } else if (_legendPosition == 'Right') {
                    return 'translate(' + margin.left + ', 0)';
                }
            });
        if (!_showLegend) {
            _local_svg.select('.plot')
                .attr('transform', function () {
                    return 'translate(' + margin.left + ', ' + 0 + ')';
                });
        }

        x = d3.scaleBand()
            .rangeRound([0, plotWidth])
            .paddingInner(0.1)
            .padding([0.1])
            .align(0.1);

        y = d3.scaleLinear()
            .rangeRound([plotHeight, 0]);

        var keys = UTIL.getMeasureList(data[0], _dimension);

        for (i = 0; i < data.length; i++) {
            var t = 0;
            for (j = 0; j < keys.length; j++) {
                t = parseInt(t) + parseInt(data[i][keys[j]]);
            }
            data[i].total = t;
        }

        x.domain(data.map(function (d) { return d[_dimension[0]]; }));
        y.domain([0, d3.max(data, function (d) {
            return d.total;
        })]).nice();

        data.map(function (val) {
            delete val['total'];
        })

        var labelStack = [];
        var stack = plot.append('g')
            .attr('class', 'stack')
            .selectAll('g')
            .data(d3.stack().keys(keys)(data))
            .enter().append('g')
            .attr('class', 'stackedverticalbar-group');

        var stackedverticalbar = stack.selectAll('g')
            .data(function (d, i) {
                d.forEach(function (datum) {
                    datum.key = d.key;
                })
                return d;
            })
            .enter().append('g')
            .attr('class', 'stackedverticalbar');

        drawViz(stackedverticalbar);

        plot.append("g")
            .attr("class", "x_axis")
            .attr("transform", "translate(0," + plotHeight + ")")
            .call(d3.axisBottom(x))
            .append("text")
            .attr("x", plotWidth / 2)
            .attr("y", 2 * axisLabelSpace)
            .attr("dy", "0.32em")
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .style('text-anchor', 'middle')
            .style('visibility', UTIL.getVisibility(_showXaxisLabel))
            .text(function () {
                return _displayName;
            });

        plot.append("g")
            .attr("class", "y_axis")
            .call(d3.axisLeft(y).ticks(null, "s"))
            .append("text")
            .attr("x", plotHeight / 2)
            .attr("y", 2 * axisLabelSpace)
            .attr("transform", function (d) { return "rotate(" + 90 + ")"; })
            .attr("dy", "0.32em")
            .style('visibility', UTIL.getVisibility(_showYaxisLabel))
            .attr("font-weight", "bold")
            .style('text-anchor', 'middle')
            .text(function () {
                return _displayNameForMeasure.map(function (p) { return p; }).join(', ');
            });

        UTIL.setAxisColor(_local_svg, _yAxisColor, _xAxisColor, _showYaxis, _showXaxis, _showYaxis, _showXaxis);

        _local_svg.select('g.sort').remove();
        UTIL.sortingView(container, parentHeight, parentWidth + margin.left, legendBreakCount, axisLabelSpace, offsetX);

        _local_svg.select('g.sort').selectAll('text')
            .on('click', function () {
                var order = d3.select(this).attr('class')
                switch (order) {
                    case 'ascending':
                        UTIL.toggleSortSelection(me, 'ascending', drawPlot, _local_svg, keys, _Local_data);
                        break;
                    case 'descending':
                        UTIL.toggleSortSelection(me, 'descending', drawPlot, _local_svg, keys, _Local_data);
                        break;
                    case 'reset': {
                        _local_svg.select(me.parentElement).select('.plot').remove();
                        drawPlot.call(me, _Local_data);
                        break;
                    }
                }
            });

        d3.select(div).select('.filterData')
            .on('click', applyFilter(chart));

        d3.select(div).select('.removeFilter')
            .on('click', clearFilter());

        _local_svg.select('g.lasso').remove()
        var lasso = d3.lasso()
            .hoverSelect(true)
            .closePathSelect(true)
            .closePathDistance(100)
            .items(stackedverticalbar)
            .targetArea(_local_svg);

        lasso.on('start', onLassoStart(lasso, me))
            .on('draw', onLassoDraw(lasso, me))
            .on('end', onLassoEnd(lasso, me));

        _local_svg.call(lasso);
    }

    chart._legendInteraction = function (event, data) {
        switch (event) {
            case 'mouseover':
                _legendMouseOver(data);
                break;
            case 'mousemove':
                _legendMouseMove(data);
                break;
            case 'mouseout':
                _legendMouseOut(data);
                break;
            case 'click':
                _legendClick(data);
                break;
        }
    }

    var _legendMouseOver = function (data) {

        d3.selectAll('g.stackedverticalbar')
            .filter(function (d) {
                return d.key === data;
            })
            .select('rect')
            .style('fill', COMMON.HIGHLIGHTER);
    }

    var _legendMouseMove = function (data) {

    }

    var _legendMouseOut = function (data) {
        d3.selectAll('g.stackedverticalbar')
            .filter(function (d) {
                return d.key === data;
            })
            .select('rect')
            .style('fill', function (d, i) {
                return UTIL.getDisplayColor(_measure.indexOf(d.key), _displayColor);
            });
    }

    var _legendClick = function (data) {
        var _filter = UTIL.getFilterData(_localLabelStack, data, _originalData)
        drawPlot.call(this, _filter);
    }
    chart._getName = function () {
        return _NAME;
    }

    chart.update = function (data) {

        _Local_data = data,
            filterData = [];

        x = d3.scaleBand()
            .rangeRound([0, plotWidth])
            .paddingInner(0.1)
            .padding([0.1])
            .align(0.1);
        var labelStack = [];
        y = d3.scaleLinear()
            .rangeRound([plotHeight, 0]);

        var keys = UTIL.getMeasureList(data[0], _dimension);

        for (i = 0; i < data.length; i++) {
            var t = 0;
            for (j = 0; j < keys.length; j++) {
                t = parseInt(t) + parseInt(data[i][keys[j]]);
            }
            data[i].total = t;
        }

        x.domain(data.map(function (d) { return d[_dimension[0]]; }));
        y.domain([0, d3.max(data, function (d) {
            return d.total;
        })]).nice();

        data.map(function (val) {
            delete val['total'];
        })
        var plot = _local_svg.select('.plot')

        var stack = _local_svg.select('g.stack').selectAll('g.stackedverticalbar-group')
            .data(d3.stack().keys(keys)(data))

        stack.enter().append('g')
            .attr('class', 'stackedverticalbar-group');

        stack.exit().remove();

        var stackedVerticalbarGroup = plot.select('g.stack').selectAll('g.stackedverticalbar-group');

        var stackedverticalbar = stackedVerticalbarGroup.selectAll('g.stackedverticalbar')
            .data(function (d, i) {
                d.forEach(function (datum) {
                    datum.key = d.key;
                })
                return d;
            });


        stackedverticalbar.select('rect')
            .attr("x", function (d) {
                return x(d.data[_dimension[0]]);
            })
            .attr('class', function (d, i) {
                return d.data[_dimension[0]];
            })
            .attr("y", function (d) { return y(d[1]); })
            .attr("height", function (d) { return y(d[0]) - y(d[1]); })
            .attr("width", x.bandwidth())
            .style('stroke-width', 2)

        stackedverticalbar.select('text')
            .text(function (d, i) {
                return UTIL.getFormattedValue(d.data[d.key], UTIL.getValueNumberFormat(_measure.indexOf(d.key), _numberFormat));
            })
            .attr('x', function (d, i) {
                return x(d.data[_dimension[0]]) + x.bandwidth() / 2;
            })
            .attr('y', function (d, i) {
                return y(d[1]) + 5;
            })
            .attr('dy', function (d, i) {
                return offsetX / 2;
            })
            .style('text-anchor', 'middle')

        var newBars = stackedverticalbar.enter().append('g')
            .attr('class', 'stackedverticalbar');

        drawViz(newBars);

        plot.select('.x_axis')
            .transition()
            .duration(COMMON.DURATION)
            .call(d3.axisBottom(x));

        plot.select('.y_axis')
            .transition()
            .duration(COMMON.DURATION)
            .call(d3.axisLeft(y).ticks(null, "s"));

        stackedverticalbar.exit()
            .transition()
            .duration(COMMON.DURATION)
            .remove();

        UTIL.setAxisColor(_local_svg, _yAxisColor, _xAxisColor, _showYaxis, _showXaxis);
        UTIL.displayThreshold(threshold, data, keys);
    }

    chart.config = function (value) {
        if (!arguments.length) {
            return _config;
        }
        _config = value;
        _setConfigParams.call(chart, _config);
        return chart;
    }

    chart.dimension = function (value) {
        if (!arguments.length) {
            return _dimension;
        }
        _dimension = value;
        return chart;
    }

    chart.measure = function (value) {
        if (!arguments.length) {
            return _measure;
        }
        _measure = value;
        return chart;
    }

    chart.showLegend = function (value) {
        if (!arguments.length) {
            return _showLegend;
        }
        _showLegend = value;
        return chart;
    }

    chart.legendPosition = function (value) {
        if (!arguments.length) {
            return _legendPosition;
        }
        _legendPosition = value;
        return chart;
    }

    chart.sort = function (value) {
        if (!arguments.length) {
            return _sort;
        }
        _sort = value;
        return chart;
    }

    chart.tooltip = function (value) {
        if (!arguments.length) {
            return _tooltip;
        }
        _tooltip = value;
        return chart;
    }

    chart.showXaxis = function (value) {
        if (!arguments.length) {
            return _showXaxis;
        }
        _showXaxis = value;
        return chart;
    }

    chart.showYaxis = function (value) {
        if (!arguments.length) {
            return _showYaxis;
        }
        _showYaxis = value;
        return chart;
    }

    chart.showXaxisLabel = function (value) {
        if (!arguments.length) {
            return _showXaxisLabel;
        }
        _showXaxisLabel = value;
        return chart;
    }

    chart.showYaxisLabel = function (value) {
        if (!arguments.length) {
            return _showYaxisLabel;
        }
        _showYaxisLabel = value;
        return chart;
    }

    chart.xAxisColor = function (value) {
        if (!arguments.length) {
            return _xAxisColor;
        }
        _xAxisColor = value;
        return chart;
    }

    chart.yAxisColor = function (value) {
        if (!arguments.length) {
            return _yAxisColor;
        }
        _yAxisColor = value;
        return chart;
    }

    chart.showGrid = function (value) {
        if (!arguments.length) {
            return _tooltip;
        }
        _showGrid = value;
        return chart;
    }

    chart.stacked = function (value) {
        if (!arguments.length) {
            return _tooltip;
        }
        _stacked = value;
        return chart;
    }

    chart.displayName = function (value) {
        if (!arguments.length) {
            return _tooltip;
        }
        _displayName = value;
        return chart;
    }

    chart.legendData = function (measureConfig, measureName) {
        _legendData = {
            measureConfig: measureConfig,
            measureName: measureName
        }
        return _legendData;
    }

    chart.showValues = function (value, measure) {
        return UTIL.baseAccessor.call(_showValues, value, measure, _measure);
    }

    chart.displayNameForMeasure = function (value, measure) {
        return UTIL.baseAccessor.call(_displayNameForMeasure, value, measure, _measure);
    }

    chart.fontStyle = function (value, measure) {
        return UTIL.baseAccessor.call(_fontStyle, value, measure, _measure);
    }

    chart.fontWeight = function (value, measure) {
        return UTIL.baseAccessor.call(_fontWeight, value, measure, _measure);
    }

    chart.numberFormat = function (value, measure) {
        return UTIL.baseAccessor.call(_numberFormat, value, measure, _measure);
    }

    chart.textColor = function (value, measure) {
        return UTIL.baseAccessor.call(_textColor, value, measure, _measure);
    }

    chart.displayColor = function (value, measure) {
        return UTIL.baseAccessor.call(_displayColor, value, measure, _measure);
    }

    chart.borderColor = function (value, measure) {
        return UTIL.baseAccessor.call(_borderColor, value, measure, _measure);
    }

    chart.fontSize = function (value, measure) {
        return UTIL.baseAccessor.call(_fontSize, value, measure, _measure);
    }
    return chart;
}

module.exports = stackedverticalbar;
