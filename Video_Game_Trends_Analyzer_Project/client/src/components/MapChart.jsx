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
const MapChart = ({ mapData, onRegionClick }) => {
  useEffect(() => {

    // Create root element for MapChart
    const root = am5.Root.new('mapchart');

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
      templateField: 'polygonSettings',
      interactive: false,
      fill: am5.color(0xcccccc),
      fillOpacity: 0.7
    });

    polygonSeries.mapPolygons.template.states.create('hover', {
      fillOpacity: 1
    });

    // Zoom in when country is clicked
    polygonSeries.mapPolygons.template.events.on('click', (evt) => {
      console.log(evt.target.dataItem.dataContext);
      const clickedRegion = evt.target.dataItem.dataContext.region;
      var dataItem = evt.target.dataItem;
      if (dataItem?.dataContext?.isActive){
        // var zoomAnimation = polygonSeries.zoomToDataItem(dataItem);
        // zoomAnimation.waitForStop();
      }
      if (clickedRegion) {
        onRegionClick(clickedRegion, evt.target.dataItem.dataContext.id);
      }
    });

    // const regionColors = {
    //   'Europe': am5.color(0x6677D0),
    //   'Japan': am5.color(0xf72585),
    //   'North America': am5.color(0xb494fe),
    //   'Other': am5.color(0x89B7EA)
    // };

    // Set Polygon map data if it exists
    if (mapData?.countries) {
      polygonSeries.data.setAll(
        mapData.countries.map(data => ({
          id: data.country_code.toUpperCase(),
          name: data.location,
          region: data.region,
          isActive: true,
          polygonSettings: {
            fill: am5.color(0x6677D0),
            tooltipText: `${data.location}\n${data.region}`
          }
        }))
      );
    }

    // Dispose on cleanup
    return () => {
      root.dispose();
    };

  }, [mapData?.countries]);

  return <div id="mapchart" style={{ width: '100%', height: '50vh' }} />;
};

export default MapChart;
