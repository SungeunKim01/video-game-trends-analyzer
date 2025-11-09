import { useEffect } from 'react';
import * as am5 from '@amcharts/amcharts5';
import * as am5map from '@amcharts/amcharts5/map';
import worldLow from '@amcharts/amcharts5-geodata/worldLow';


/** References:
 * https://www.amcharts.com/docs/v5/getting-started/integrations/react/
 * https://www.amcharts.com/docs/v5/charts/map-chart/#Projections
 */

/**
 * Displays interactive map of the world.
 * Users click on one region to learn more about the region's top-selling games
 * and most popular Google queries.
 * @author Jennifer
 * @returns a map React Component
 */
const MapChart = () => {
  useEffect(() => {
    const root = am5.Root.new('chartdiv');

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
        geoJSON: worldLow
      })
    );

    // From tutorial: setting value to regions
    polygonSeries.data.setAll([
      { id: 'FR', name: 'France', value: 100 },
      { id: 'ES', name: 'Spain', value: 200 }
    ]);

    // From tutorial: Set MapPolygon appearance
    polygonSeries.mapPolygons.template.setAll({
      // enable tooltip
      tooltipText: '{name}: {value}',
      stroke: am5.color(0xffffff),
      strokeWidth: 2,
      fillOpacity: 0.5
    });

    // Highlight on hover
    polygonSeries.mapPolygons.template.states.create('hover', {
      fill: am5.color(0x677935)
    });

    return () => {
      root.dispose();
    };
  }, []);

  return <div id="chartdiv" style={{ width: '100%', height: '500px' }} />;
};

export default MapChart;
