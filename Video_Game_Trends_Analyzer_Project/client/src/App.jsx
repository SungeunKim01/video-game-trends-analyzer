/* eslint-disable @stylistic/max-len */
//import { useState } from 'react'
import './App.css';
import View1 from './components/View1';
import View2 from './components/View2';
import View3 from './components/View3';

function App() {

  return (
    <>
      <div className="main-container">
        <div className="gradient-bg"/>
        <div id="title-div">
          <h1>Video Game Trends Analyzer</h1>
          <p>Keep Scrolling down to see our data!</p>
          <svg id="down-arrow" xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="#FFFFFF"><path d="M480-80 200-360l42-42 208 208v-686h60v686l208-208 42 42L480-80Z"/></svg>
        </div>
        <section id="intro-section">
          <h2>INTRODUCTION</h2>
          <p className="intro-text">
            Welcome to the Video Game Trends Analyzer! This web app uses a video game sales dataset to determine the most popular games of a certain year, 
            as well as a Google Trends dataset that identifies the most searched google terms around the world per year. Using these datasets, we want to see 
            if there is a correlation between pop culture trends and the most successful video games of each year. We also delve deeper, using different countries
            to compare what different regions are interested in at a specific point in time, or seeing when certain types of games are most popular. </p>
        </section>
        <View1 />
        <View2 />
        <View3 />
      </div>
      <footer>
        © 2025 Jennifer Huang, Yan Chi Ng, Sungeun Kim • Built with React, amChart, and Chart.js
      </footer>
    </>
  );
}

export default App;
