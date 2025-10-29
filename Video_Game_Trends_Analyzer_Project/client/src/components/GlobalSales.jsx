import { useState } from 'react';
import './GlobalSales.css';
import { useEffect } from 'react';

export default function GlobalSales(){
  const [data, setData] = useState([]);
  const [year, setYear] = useState(2006);

  //load top 10 global sales for video games published in 2006 on initial load
  useEffect(() => {
    fetch(`/api/sales/global/${year}`).then(resp => {
      if(resp.ok){
        return resp.json();
      } else{
        throw new Error('status code:' + resp.status);
      }
    }).then(json => {
      setData(json.data);
    }).catch(error => {
      console.error(error.message);
    });
  }, []);

  return(
    <div>
      <h2>Displaying Top 10 global sales for video games published in {year}:</h2>
      <div className="sales-list">
        {data.map((game, index) => 
          <p key={index}>
            {game.name} - {game.global_sales.toFixed(2)} million
          </p>
        )}
      </div>
    </div>
  );
}