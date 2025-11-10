import { useEffect, useState } from 'react';


/** References:
 * https://react.dev/reference/react/useState#updating-objects-and-arrays-in-state
 */

/**
 * Dynamically create a Filter based on a set of configurations.
 * @prop `filterConfig`: array of `<input>` properties.
 * @prop `onSubmit`: Callback function called when the form is submitted.
 * @returns A form with input fields defined by `filterConfig` and a submit handler.
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
          list = extractList(data);
          //set list of options to just use data from fetch if it is an array
        } else if (Array.isArray(data)){
          list = data;
        } else{
          throw new Error('cannot find array to populate dropdown');
        }
        //set options of select field
        setOptions(list);
      } catch(error){
        console.error('fetch error:', error);
        setOptions([]);
      }
    };
    fetchData();
  }, [fetchURL, extractList]);

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