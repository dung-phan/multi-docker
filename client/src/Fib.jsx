import axios from 'axios';
import {useState, useEffect} from 'react'

export default function Fib() {
	const [seenIndexes, setSeenIndexes] = useState([]);
	const [values, setValues] = useState({});
	const [index, setIndex] = useState('');

	const fetchValues = async () => {
		const res = await axios.get('/api/values/current');
		setValues(res.data);
  	};

  	const fetchIndexes = async () => {
		const res = await axios.get('/api/values/all');
		setSeenIndexes(res.data);
  	};

   useEffect(() => {
	fetchValues();
	fetchIndexes();
  }, []);
  const handleSubmit = async (event) => {
	event.preventDefault();
	await axios.post('/api/values', { index });
	setIndex('');
  };

  return (
	<div>
	  <form onSubmit={handleSubmit}>
		<label>Enter your index:</label>
		<input
		  value={index}
		  onChange={(e) => setIndex(e.target.value)}
		/>
		<button type="submit">Submit</button>
	  </form>

	  <h3>Indexes I have seen:</h3>
	  <ul>
		{seenIndexes.map(({ number }) => (
		  <li key={number}>{number}</li>
		))}
	  </ul>

	  <h3>Calculated Values:</h3>
	  <ul>
		{Object.entries(values).map(([key, value]) => (
		  <li key={key}>
			For index {key}, I calculated {value}
		  </li>
		))}
	  </ul>
	</div>
  );
}
