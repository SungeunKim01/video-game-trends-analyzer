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
    <div className="view-div view1-container">
      <div className="view1-header">
        <h2> Global Trends </h2>

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

        {/*context for user */}
        <p className="description-text">
          This bar chart shows the global sales of the top 10 most sold games of the selected year, 
          in millions. Hover over a bar to see details about a game, including the game sales, 
          the genre, and the publisher.
        </p>
        <p className="description-text">
          The side also shows the top 5 most searched terms on Google Trends for that year.
          Select a specific search category through the dropdown menu. 
        </p>
      </div>

      <div className="view1-body">
        <div className="view1-left-column">
          <h3>Top 10 Video Games</h3>
          
          {/* Error display */}
          {error && <p style={{ color: 'red' }}>{error}</p>}

          {/* Chart */}
          <BarChart
            rows={games}
          />
        </div>

        <div className="view1-right-column">
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

          {category && trends.length > 0 && (
            <table className="global-trends-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Query</th>
                </tr>
              </thead>
              <tbody>
                {trends.map((trend, index) => (
                  <tr key={index}>
                    <td>{trend.rank}</td>
                    <td>{trend.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default View1;