import { useEffect } from 'react';
import * as am5 from '@amcharts/amcharts5';
import * as am5map from '@amcharts/amcharts5/map';
import worldLow from '@amcharts/amcharts5-geodata/worldLow';
import am5themesAnimated from '@amcharts/amcharts5/themes/Animated';


/** References:
 * https://www.amcharts.com/docs/v5/getting-started/integrations/react/
 * https://www.amcharts.com/docs/v5/charts/map-chart/#Projections
 * https://www.amcharts.com/docs/v5/charts/map-chart/country-data/
 */

/**
 * Displays interactive map of the world.
 * Users click on one region to learn more about the region's top-selling games
 * and most popular Google queries.
 * @author Jennifer
 * @returns a map React Component
 */
const MapChart = ({ mapData }) => {
  useEffect(() => {

    // Create root element for MapChart
    const root = am5.Root.new('chartdiv');

    root.setThemes([
      am5themesAnimated.new(root)
    ]);

    const chart = root.container.children.push(
      am5map.MapChart.new(root, {
        panX: 'translateX',
        panY: 'translateY',
        wheelY: 'zoom',
        projection: am5map.geoMercator()
      })
    );

    // Base world layer
    const polygonSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        geoJSON: worldLow,
        exclude: ['AQ']
      })
    );

    polygonSeries.setAll({
      idField: 'id',
      polygonIdField: 'id',
    });

    // Set MapPolygon appearance
    polygonSeries.mapPolygons.template.setAll({
      // enable tooltip
      tooltipText: '{name}\n{region}',
      templateField: 'polygonSettings',
      interactive: true,
      stroke: am5.color(0xffffff),
      strokeWidth: 2
    });

    polygonSeries.mapPolygons.template.states.create('hover', {
      fill: am5.color(0xff0000)
    });

    // Highlight on hover
    polygonSeries.mapPolygons.template.events.on('click', (evt) => {
      var dataItem = evt.target.dataItem;
      var zoomAnimation = polygonSeries.zoomToDataItem(dataItem);
      zoomAnimation.waitForStop();
    });

    const regionColors = {
      'Europe': am5.color(0x007bff),
      'Japan': am5.color(0xffb300),
      'North America': am5.color(0x28a745),
      'Other': am5.color(0xdc3545)
    };

    // Set Polygon map data if it exists
    if (mapData?.countries) {
      polygonSeries.data.setAll(
        mapData.countries.map(data => ({
          id: data.country_code.toUpperCase(),
          name: data.location,
          region: data.region,
          polygonSettings: {
            fill: regionColors[data.region] || am5.color(0xffffff)
          }
        }))
      );
    }

    // Dispose on cleanup
    return () => {
      root.dispose();
    };

  }, [mapData?.countries]);

  return <div id="chartdiv" style={{ width: '100%', height: '500px' }} />;
};

export default MapChart;
