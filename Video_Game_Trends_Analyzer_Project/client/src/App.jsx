//import { useState } from 'react'
import './App.css';
// import GlobalSales from './components/GlobalSales';
import View1 from './components/View1';
import View2 from './components/View2';
import View3 from './components/View3';

function App() {

  return (
    <div>
      <h1>Video Game Trends Analyzer</h1>
      {/* <GlobalSales/> */}
      <View1 />
      <hr />
      <View2 />
      <hr />
      <View3 />
    </div>
  );
}

export default App;
