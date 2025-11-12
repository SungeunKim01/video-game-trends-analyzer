import { useState } from 'react';
import SelectFilter from './SelectFilter';
import BarChart from './BarChart';

function View1() {

  const [year, setYear] = useState('');
  const [category, setCategory] = useState('');
  const [games, setGames] = useState([]);
  const [trends, setTrends] = useState([]);

  return (
    <div className="view-div">
      <h2>View 1: Best Global Selling Games </h2>
      <SelectFilter
        label="Select Year"
        //fetch all years from db and populate select
        fetchURL="/api/sales/years"
        //if user selects a new year
        onChange={(newYear) => {
          //set new year
          setYear(newYear);
          //fetch global sales / global trends of that year and set data
          fetch(`/api/sales/global/${newYear}`)
            .then(res => res.json())
            .then(json => setGames(json))
            .catch(err => console.error(err));
        }}
      />

      {year && games.length > 0 &&
        <SelectFilter
          label="Select Category"
          //fetch global trend categories from db based on year
          fetchURL={`/api/trends/region/${year}/country/${'GLOBAL'}`}
          //if user selects a new category
          onChange={(newCategory) => {
            setCategory(newCategory);
            fetch(`/api/trends/region/${year}/country/${'GLOBAL'}/category/${newCategory}`)
              .then(res => res.json())
              .then(json => setTrends(json))
              .catch(err => console.error(err));
          }}
        />
      }
      {/* Chart */}
      <BarChart
        rows={games}
      />

      {category && trends.length > 0 &&
        <>
          {trends.map((trend, index) => 
            <p key={index}>
              {trend.name} - Country: {trend.country} - Rank: {trend.rank} 
            </p>
          )}
        </>
      }
    </div>
  );
}

export default View1;