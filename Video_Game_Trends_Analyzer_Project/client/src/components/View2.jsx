import { useEffect, useState } from 'react';
import MapChart from './MapChart';
import SelectFilter from './SelectFilter';

function View2() {
  const [mapData, setMapData] = useState(null);

  // const filterConfig = [
  //   {name: 'country', label: 'country', type: 'text', value: ''}
  //   // {name: 'category', label: 'category', type: 'text', value: ''}
  // ];

  // // Handle form submission values
  // function handleSubmit(filters) {
  //   filters.forEach(f => {
  //     // eslint-disable-next-line no-console
  //     console.log(`Filter: ${f.name}, ${f.value}`);
  //   });
  // }
  
  useEffect(() => {
    async function getDefaultGlobalData() {
      try {
        // Default value when the Map Chart launches
        const rawMapData = await fetch('/api/sales/region/global/2016');
        const mapData = await rawMapData.json();
        setMapData(mapData);

      } catch (err) {
        throw new Error ('Error fetching map data:', err);
      }
    }

    getDefaultGlobalData();
  }, []);

  return (
    <div className="view-div">
      <h2>Explore Top Games and Google Trends by Country</h2>
      <MapChart mapData={mapData}/>
      {/* <FilterForm filterConfig={filterConfig} onSubmit={handleSubmit}/> */}
    </div>
  );
}

export default View2;