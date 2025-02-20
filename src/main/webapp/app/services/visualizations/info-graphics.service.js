(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('GenerateInfoGraphic', GenerateInfoGraphic);

    GenerateInfoGraphic.$inject = ['VisualizationUtils', '$rootScope', 'D3Utils'];

    function GenerateInfoGraphic(VisualizationUtils, $rootScope, D3Utils) {
        return {
            build: function (record, element, panel) {

                function getProperties(VisualizationUtils, record) {
                    var result = {};

                    var features = VisualizationUtils.getDimensionsAndMeasures(record.fields),
                        dimension = features.dimensions,
                        measures = features.measures,
                        colorSet = D3Utils.getDefaultColorset();

                    result['dimension'] = D3Utils.getNames(dimension);
                    result['measure'] = D3Utils.getNames(measures);
                    result['chartType'] = VisualizationUtils.getPropertyValue(record.properties, 'Info graphic Type').toLowerCase();
                    var displayColor = VisualizationUtils.getFieldPropertyValue(dimension[0], 'Display colour');
                    result['chartDisplayColor'] = (displayColor == null) ? colorSet[0] : displayColor;
                    var borderColor = VisualizationUtils.getFieldPropertyValue(dimension[0], 'Border colour');
                    result['chartBorderColor'] = (borderColor == null) ? colorSet[0] : borderColor;

                    result['kpiDisplayName'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Display name') || result['dimension'][0];
                    result['kpiAlignment'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Text alignment');
                    result['kpiBackgroundColor'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Background Colour');
                    result['kpiNumberFormat'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Number format');
                    result['kpiFontStyle'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font style');
                    result['kpiFontWeight'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font weight');
                    result['kpiFontSize'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font size');
                    result['kpiColor'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Text colour');
                    result['kpiColorExpression'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Text colour expression');
                    result['kpiIcon'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Icon name');
                    result['kpiIconFontWeight'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Icon Font weight');
                    result['kpiIconColor'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Icon colour');
                    result['kpiIconExpression'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Icon Expression');

                    return result;
                }

                if (Object.keys($rootScope.updateWidget).indexOf(record.id) != -1) {
                    if ($rootScope.filterSelection.id != record.id) {
                        var infographics = $rootScope.updateWidget[record.id];
                        for (let index = 0; index < record.data.length; index++) {
                            record.data[index]["high_tolerance"] = record.data[index]["high_tolerance"] - 10;
                            // record.data[index]["variance_percent"] = record.data[index]["variance_percent"] - 50;
                        }
                        infographics.config(getProperties(VisualizationUtils, record))
                            .config(getProperties(VisualizationUtils, record))
                            .update(record.data);
                    }
                } else {
                    $(element[0]).html('')
                    $(element[0]).append('<div height="' + element[0].clientHeight + '" width="' + element[0].clientWidth + '" style="width:' + element[0].clientWidth + 'px; height:' + element[0].clientHeight + 'px;overflow:hidden;position:relative" id="infographics-' + element[0].id + '" ></div>')
                    var div = $('#infographics-' + element[0].id)

                    var infographics = flairVisualizations.infographics()
                        .config(getProperties(VisualizationUtils, record))
                        .tooltip(true)
                        .data(record.data);

                    infographics(div[0])

                    $rootScope.updateWidget[record.id] = infographics;
                }
            }
        }
    }
})();
