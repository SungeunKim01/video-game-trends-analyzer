import { useState } from 'react';
import SelectFilter from './SelectFilter';
import BarChart from './BarChart';
import './View1.css';

function View1() {

  const [year, setYear] = useState('');
  const [category, setCategory] = useState('');
  const [games, setGames] = useState([]);
  const [trends, setTrends] = useState([]);

  const [error, setError] = useState('');

  return (
    <div className="view-div" id="view-1">
      <div className="left-column">
        <div className="view-title-header">
          <h2>Global Trends </h2>
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
              fetch(`/api/sales/global/${newYear}`)
                .then(res => res.json())
                .then(json => setGames(json))
                .catch((err) => {
                  setError(err.message);
                  console.error(err);
                });
            }}
          />
        </div>

        <h3>Top 10 Video Games</h3>
          
        {/* Error display */}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {/* Chart */}
        <BarChart
          rows={games}
        />
      </div>

      <div className="right-column">
        <p className="description-text">
          Brief description here! Brief description here! Brief description here!!
        </p>
        <h3>Top 5 Google Searches</h3>
      
        {year && games.length > 0 &&
        <SelectFilter
          key={year}
          label="Select Category"
          //fetch global trend categories from db based on year
          fetchURL={`/api/trends/region/${year}/country/${'GLOBAL'}`}
          value={category}
          //if user selects a new category
          onChange={(newCategory) => {
            setCategory(newCategory);
            fetch(`/api/trends/region/${year}/country/${'GLOBAL'}/category/${newCategory}`)
              .then(res => res.json())
              .then(json => setTrends(json))
              .catch((err) => {
                setError(err.message);
                console.error(err);
              });
          }}
        />
        }

        {category && trends.length > 0 &&
        <>
          {trends.map((trend, index) => 
            <p key={index} className="global-trends-list">
              {trend.name} - Country: {trend.country} - Rank: {trend.rank} 
            </p>
          )}
        </>
        }
      </div>
    </div>
  );
}

export default View1;