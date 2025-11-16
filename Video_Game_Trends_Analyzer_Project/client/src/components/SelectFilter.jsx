import { useEffect, useState } from 'react';


/** References:
 * https://react.dev/reference/react/useState#updating-objects-and-arrays-in-state
 */

/**
 * Dynamically create a select dropdown menu based on what needs to be fetched from the db.
 * @prop `fetchURL`: String that indicates route to fetch from in express
 * @prop `label`: Label of the select field.
 * @prop `extractList`: Optional function that specifies where data is if wrapped inside an object
 * For example, /api/sales/region/:region/:year returns the list of countries 
 * inside of a data object, so we add an anonymous function as input that specifies which property
 * of the object we want to populate the select
 * @prop `onChange`: Callback function that is called when user changes options
 * @returns A select element populated by what is fetched from the given URL
 */
function SelectFilter({ fetchURL, label, extractList, onChange }) {

  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState('');

  useEffect(() => {
    //dont fetch if no url
    if(!fetchURL) return;

    const fetchData = async () => {
      try{
        const response = await fetch(fetchURL);
        if (!response.ok) throw new Error(`status code: ${response.status}`);
        const data = await response.json();

        let list;
        if (extractList) {
          // use extractList function to get specific list from object
          //for country and category, which are an array inside an object
          list = extractList(data);
          //set list of options to just use data from fetch if it is an array
          //basically for years, genre, platform
        } else if (Array.isArray(data)){
          list = data;
        } else{
          throw new Error('cannot find array to populate dropdown');
        }
        //set options of select field
        setOptions(list);

        if (list.length > 0) {
          setSelected(list[0]);
          onChange?.(list[0]);
        }

      } catch(error){
        console.error('fetch error:', error);
        setOptions([]);
      }
    };
    fetchData();
  }, [fetchURL, extractList, onChange]);

  const handleChange = (e) => {
    setSelected(e.target.value);
    onChange?.(e.target.value);
  };

  return (
    <div>
      <label>{label}</label>
      <select value={selected} onChange={handleChange}>
        <option value="">{label}</option>
        {options.map((opt, index) => (
          <option value={opt} key={index}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SelectFilter;