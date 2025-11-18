import { useEffect, useState } from 'react';
import SelectFilter from './SelectFilter';
import MapChart from './MapChart';
// import SelectFilter from './SelectFilter';

function View2() {

  const [year, setYear] = useState('');
  const [mapData, setMapData] = useState(null);
  const [region, setRegion] = useState('');
  const [games, setGames] = useState([]);

  const [error, setError] = useState('');

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

  function handleRegionClick(newRegion) {
    console.log('Region clicked: ', newRegion);
    setRegion(newRegion);
    fetch(`/api/sales/region/${newRegion}/${year}`)
      .then(res => res.json())
      .then(json => setGames(json))
      .catch((err) => {
        setError(err.message);
        console.error(err);
      });
  }

  return (
    <div className="view-div">
      <h2>Explore Top Games and Google Trends by Country</h2>

      <SelectFilter
        key="year-filter"
        label="Select Year"
        //fetch all years from db and populate select
        fetchURL="/api/sales/years"
        value={year}
        //if user selects a new year
        onChange={(newYear) => {
          //set new year
          setYear(newYear);
          //fetch global sales / global trends of that year and set data
          /*fetch(`/api/sales/global/${newYear}`)
            .then(res => res.json())
            .then(json => setGames(json))
            .catch((err) => {
              setError(err.message);
              console.error(err);
            });*/
        }}
      />


      {/* Error display */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <MapChart mapData={mapData} onRegionClick={handleRegionClick} />
      {/* <FilterForm filterConfig={filterConfig} onSubmit={handleSubmit}/> */}

      {games.forEach(game => {
        <p>{game}</p>;
      })}
    </div>
  );
}

export default View2;