import { useState } from 'react';


/** References:
 * https://react.dev/reference/react/useState#updating-objects-and-arrays-in-state
 */

/**
 * Dynamically create a Filter based on a set of configurations.
 * @returns 
 */
function FilterForm({ filterConfig, onSubmit }) {

  // Create shallow copy of filterConfig
  const [allFilters, setAllFilters] = useState(
    filterConfig.map(filter => ({ ...filter }))
  );

  function handleSubmit (evt) {
    evt.preventDefault();
    const result = allFilters.map(filter => ({
      name: filter.name,
      label: filter.label,
      type: filter.type,
      value: filter.value
    }));
    onSubmit(result);
  };

  function handleChange (filterName, newFilterValue) {
    setAllFilters(prevVersion =>
      prevVersion.map(filter =>
        filter.name === filterName ?
          // Update new value to the respective filter input
          {...filter, value: newFilterValue} : filter
      ));
  };

  return (
    <form onSubmit={handleSubmit}>
      {filterConfig.map(filter =>
        <div key={filter.name} className="filter-option-div">
          <label>
            {filter.label}:
            <input
              type={filter.type}
              value={allFilters[filter.name]}
              onChange={evt => handleChange(filter.name, evt.target.value)}
              placeholder={filter.placeholder || ''}
            />
          </label>
        </div>
      )}
      <button type="submit">Apply Filters</button>
    </form>
  );
}

export default FilterForm;