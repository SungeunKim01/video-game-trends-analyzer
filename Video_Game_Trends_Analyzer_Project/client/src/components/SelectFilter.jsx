import { useEffect, useState } from 'react';


/** References:
 * https://react.dev/reference/react/useState#updating-objects-and-arrays-in-state
 */

/**
 * Dynamically create a select dropdown menu based on what needs to be fetched from the db.
 * @prop `fetchURL`: String that indicates route to fetch from in express
 * @prop `label`: Label of the select field.
 * @prop `onChange`: Callback function that is called when user changes options
 * @returns A select element populated by what is fetched from the given URL
 */
function SelectFilter({ fetchURL, label, onChange, value }) {

  const [options, setOptions] = useState([]);
  //const [selected, setSelected] = useState('');
  //https://react.dev/reference/react/useRef
  //const initialLoad = useRef(true);

  useEffect(() => {
    //dont fetch if no url
    if(!fetchURL) return;

    const fetchData = async () => {
      try{
        const response = await fetch(fetchURL);
        if (!response.ok) throw new Error(`status code: ${response.status}`);
        const data = await response.json();

        let list;
        if (Array.isArray(data)){
          list = data;
        } else{
          throw new Error('cannot find array to populate dropdown');
        }
        //set options of select field
        setOptions(list);

        //set default values on initial load
        if (list.length > 0 && !value) {
          onChange?.(list[0]);
        }

      } catch(error){
        console.error('fetch error:', error);
        setOptions([]);
      }
    };

    //reset initialLoad useRef when new URL
    //initialLoad.current = true;
    fetchData();

  }, [fetchURL]);

  const handleChange = (e) => {
    //setSelected(e.target.value);
    onChange?.(e.target.value);
  };

  return (
    <div className="select-filter">
      <label>{label}</label>
      <select value={value ?? ''} onChange={handleChange}>
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