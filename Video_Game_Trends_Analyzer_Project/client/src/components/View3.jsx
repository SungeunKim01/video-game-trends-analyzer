import { useState, useEffect, Suspense, lazy } from 'react';
import SelectFilter from './SelectFilter';
// import LineChart from './LineChart';
import './View3.css';


// Lazy-load the MapChart component
const LineChart = LazyLineChart();

function LazyLineChart() {
  return lazy(() => import('./LineChart'));
}

/**
 * View 3 — Genre/Platform time series selector
 *
 * this lets user chooses a type bte genre and playform
 * the 2nd dropdown  fetches the distinct values for that type
 * When a value is selected, fetch the time series rows from the server:
 * - GET /api/sales/:type/:value to get [{ year, percent, num_games, total_games }]
 * and pass those rows to <LineChart/> to render a line chart
 *
 * one effect clears ui when the type changes
 * another effect fetches rows only when both type & value are valid
 * If fetch fails, set an error msg and clear rows
 *
 * @author Sungeun
 * @returns the panel with dropdowns and a line chart
 */
function View3() {
  const [type, setType] = useState('genre');
  const [value, setValue] = useState('');
  //[{year, percent, num_games, total_games}]
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  // 1st clear, then switch type
  function handleTypeChange(e) {
    const nextType = e.target.value;
    setError('');
    setRows([]);
    setValue('');
    setType(nextType);
  }

  //clear ui when type changes
  useEffect(() => {
    setRows([]);
    setError('');
  }, [type]);

  //Fetch time series when both type and value are set
  useEffect(() => {
    if (!value || value.trim() === '') return;

    let isActive = true;
    (async () => {
      try {
        const res = await fetch(`/api/sales/${type}/${encodeURIComponent(value)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        // [{year, percent, num_games, total_games}]
        const data = await res.json();
        if (isActive) {
          setRows(data);
          setError('');
        }
      } catch (err) {
        if (isActive) {
          console.error('Fetch error:', err);
          setError('Failed to load data');
          setRows([]);
        }
      }
    })();

    return () => {
      isActive = false;
    };
  }, [type, value]);

  return (
    <div className="view-div view3-container">
      <div className="view3-left-column">
        {/* error */}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <h2>Genre &amp; Platform Trends</h2>
        {/* Chart*/}
        <Suspense fallback={<div>Loading line chart…</div>}>
          <LineChart
            rows={rows}
            label={`${type === 'genre' ? 'Genre' : 'Platform'}: ${value}`}
          />
        </Suspense>
      </div>

      <div className="view3-right-column">
        {/*context for user */}
        <p style={{ maxWidth: '820px'}}
          className="description-text view3-description">
          This chart shows, for each year, what percentage of all released games
          belong to the selected {type}.
        </p>
        <p style={{ maxWidth: '820px'}}
          className="description-text view3-description">
          Hover over a point to see the exact percentage and how many games that is out of the total
          number of games released that year.
        </p>

        <div>
          <label className="select-filter">
            Filter by:&nbsp;
            <select value={type} onChange={handleTypeChange}>
              <option value="genre">Genre</option>
              <option value="platform">Platform</option>
            </select>
          </label>

          {/*reset dropdown when type changes*/}
          <SelectFilter
            key={type}
            fetchURL={`/api/sales/${type}`}
            label={type === 'genre' ? 'Choose a Genre: ' : 'Choose a Platform: '}
            value={value}
            onChange={setValue}
          />
        </div>
      </div>
    </div>
  );
}

export default View3;
