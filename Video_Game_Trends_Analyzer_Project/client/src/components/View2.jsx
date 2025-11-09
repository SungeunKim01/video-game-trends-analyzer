import MapChart from './MapChart';
import FilterForm from './FilterForm';

function View2() {

  const filterConfig = [
    {name: 'country', label: 'country', type: 'text', value: ''}
    // {name: 'category', label: 'category', type: 'text', value: ''}
  ];

  // Handle form submission values
  function handleSubmit(filters) {
    filters.forEach(f => {
      // eslint-disable-next-line no-console
      console.log(`Filter: ${f.name}, ${f.value}`);
    });
  }

  return (
    <div className="view-div">
      <h2>Explore Top Games and Google Trends by Country</h2>
      <MapChart />
      <FilterForm filterConfig={filterConfig} onSubmit={handleSubmit}/>
    </div>
  );
}

export default View2;