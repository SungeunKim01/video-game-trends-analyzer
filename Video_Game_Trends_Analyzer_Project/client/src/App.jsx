/* eslint-disable @stylistic/max-len */
//import { useState } from 'react'
import './App.css';
import View1 from './components/View1';
import View2 from './components/View2';
import View3 from './components/View3';

function App() {

  return (
    <div className="main-container">
      <div className="gradient-bg"/>

      <div id="title-div">
        <h1>Video Game Trends Analyzer</h1>
        <p>Brief description here!!</p>
        <p>*Scroll down icon here*</p>
      </div>
      <section id="intro-section">
        <h2>Introduction</h2>
        <p className="intro-text">Introduction text here explaining our app. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
      </section>
      <View1 />
      <View2 />
      <View3 />
    </div>
  );
}

export default App;
