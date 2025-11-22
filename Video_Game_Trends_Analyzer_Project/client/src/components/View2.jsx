import { useEffect, useState } from 'react';
import SelectFilter from './SelectFilter';
import MapChart from './MapChart';
import './View2.css';

function View2() {

  const [year, setYear] = useState('');
  const [mapData, setMapData] = useState(null);
  const [region, setRegion] = useState('');
  const [games, setGames] = useState([]);

  const [country, setCountry] = useState('');
  const [category, setCategory] = useState('');
  const [trends, setTrends] = useState([]);

  const [error, setError] = useState('');

  const REGION_MAP = {
    'North America': 'NA',
    'Europe': 'EU',
    'Japan': 'JP',
    'Other': 'OTHER',
    'Global': 'GLOBAL'
  };
  
  useEffect(() => {
    async function getDefaultGlobalData() {
      try {
        // Default value when the Map Chart launches
        const rawMapData = await fetch('/api/sales/region/global/2016');
        const mapData = await rawMapData.json();
        console.log(mapData);
        setMapData(mapData);

      } catch (err) {
        throw new Error ('Error fetching map data:', err);
      }
    }

    getDefaultGlobalData();
  }, []);

  function handleRegionClick(newRegion, newCountry) {
    //map region
    const regionCode = REGION_MAP[newRegion];

    console.log('Region clicked: ', newRegion);

    setRegion(regionCode);
    setCountry(newCountry);

    //use prevYear to get latest year state instead of stale value
    //https://react.dev/reference/react/useState#updating-state-based-on-the-previous-state
    setYear(prevYear => {
      fetch(`/api/sales/region/${regionCode}/${prevYear}`)
        .then(res => res.json())
        .then((json) => {
          setTrends([]);
          setGames(json.topVgData);
        })
        .catch((err) => {
          setError(err.message);
          console.error(err);
        });
      return prevYear;
    });
  }

  return (
    <div className="view-div view2-container">
      <div className="view2-header">
        <h2>Regional Trends</h2>

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

            fetch(`/api/sales/region/global/${newYear}`)
              .then(res => res.json())
              .then(json => {
                setMapData(json);
              })
              .catch((err) => {
                setError(err.message);
                console.error(err);
              });

            if(region){
            //fetch global sales of that year and set data
              fetch(`/api/sales/region/${region}/${newYear}`)
                .then(res => res.json())
                .then((json) => {
                  setGames(json.topVgData);
                })
                .catch((err) => {
                  setError(err.message);
                  console.error(err);
                });
            }
          }}
        />

        {year && country &&
        <SelectFilter
          key={year}
          label="Select Category"
          //fetch global trend categories from db based on year
          fetchURL={`/api/trends/region/${year}/country/${country}`}
          value={category}
          //if user selects a new category
          onChange={(newCategory) => {
            setCategory(newCategory);
            fetch(`/api/trends/region/${year}/country/${country}/category/${newCategory}`)
              .then(res => res.json())
              .then(json => {
                setTrends(json);
              })
              .catch((err) => {
                setError(err.message);
                console.error(err);
              });
          }}
        />
        }
      </div>

      <div className="view2-body">
        {/* Error display */}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <MapChart mapData={mapData} onRegionClick={handleRegionClick} />

        {region && games.length > 0 &&
        <div className="view2-list">
          <table>
            <thead>
              <tr>
                <th> Rank </th>
                <th>Game Name</th>
              </tr>
            </thead>
            <tbody>
              {games.map((game, index) => 
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{game.name}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        }

        {category && trends.length > 0 &&
        <div className="view2-list">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Query</th>
              </tr>
            </thead>
            <tbody>
              {trends.map((trend, index) => 
                <tr key={index}>
                  <td>{trend.rank}</td>
                  <td>{trend.name}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        }
      </div>
    </div>
  );
}

export default View2;