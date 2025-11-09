import { useState } from 'react';


/** References:
 * https://react.dev/reference/react/useState#updating-objects-and-arrays-in-state
 */

/**
 * Dynamically create a Filter based on a set of configurations.
 * @prop `filterConfig`: array of `<input>` properties.
 * @prop `onSubmit`: Callback function called when the form is submitted.
 * @returns A form with input fields defined by `filterConfig` and a submit handler.
 */
function FilterForm({ filterConfig, onSubmit }) {

  // Create shallow copy of filterConfig
  const [allFilters, setAllFilters] = useState(
    filterConfig.map(filter => ({ ...filter }))
  );

  /* Convert values in allFilters into array
   * and send it back to parent Component
  */
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

  // Update filter input values when there's a change
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