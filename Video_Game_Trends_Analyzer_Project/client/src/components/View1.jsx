import { useState } from 'react';
import SelectFilter from './SelectFilter';

function View1() {

  const [year, setYear] = useState('');
  const [data, setData] = useState([]);

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
          //fetch global sales of that year and set data
          fetch(`/api/sales/global/${newYear}`)
            .then(res => res.json())
            .then(json => setData(json.data || []))
            .catch(err => console.error(err));
        }}
      />

      {year && data.length > 0 &&
        <>
          {data.map((game, index) => 
            <p key={index}>
              {game.name} - {game.global_sales.toFixed(2)} million
            </p>
          )}
        </>
      }
    </div>
  );
}

export default View1;