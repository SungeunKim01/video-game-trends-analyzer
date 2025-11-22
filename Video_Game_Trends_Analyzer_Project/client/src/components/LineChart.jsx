import { useEffect } from 'react';
import Chart from 'chart.js/auto';

/**
 * component that render a single Chart.js line chart for View3.
 * It receives the already fetched data from its parent (time series rows and legend label)
 * , and reuses an existing chart instance on the same canvas
 * 
 * Properties:
 * rows: [{ year, percent, num_games, total_games }]
 * label: str to show in the legend
 * 
 * this own the Chart.js instance and cleans it up on update and unmount
 * 
 * I refer these specifically from Chart.js:
 * https://www.chartjs.org/docs/latest/charts/line.html
 * https://www.chartjs.org/docs/latest/configuration/responsive.html
 * https://www.chartjs.org/docs/latest/axes/
 * https://www.chartjs.org/docs/latest/configuration/tooltip.html
 * https://www.chartjs.org/docs/latest/developers/plugins.html
 * 
 * @author Sungeun
 * @param {Object} props
 * @param {Array<{year, percent, num_games, total_games}>} props.rows
 * @param {string} props.label
 * @returns React component that draws and updates Chart.js line chart
 */
export default function LineChart({ rows, label }) {
  useEffect(() => {
    const canvas = document.getElementById('view3-line-chart');
    if (!canvas) return;

    // build points w extra fields the tooltip can read
    const points = Array.isArray(rows)
      ? rows.map(r => 
        ({ x: r.year, y: r.percent, num: r.num_games, total: r.total_games }))
      : [];

    let chart = Chart.getChart(canvas);

    if (!chart) {
      chart = new Chart(canvas, {
        type: 'line',
        data: {
          // labels help render the X ticks
          labels: rows.map(r => r.year),
          datasets: [{
            label,
            data: points,
            borderColor: '#997dffff',
            tension: 0.1,
            pointRadius: 3,
            fill: false
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { type: 'category', title: { display: true, text: 'Year' } },
            y: {
              title: { display: true, text: 'Percentage of Games (%)' },
              min: 0,
              max: 100,
              ticks: { callback: v => `${v}%` }
            }
          },
          plugins: {
            title: { display: true, 
              text: 'Percent of games released, by year, that were this genre/platform (%)' },
            legend: { display: true },
            tooltip: {
              callbacks: {
                label: ctx =>{
                  const percentage = ctx.parsed.y;
                  const year = ctx.label;
                  return `${percentage}% of games in ${year}`;
                },
                afterLabel: ctx => {
                  const raw = ctx.raw;
                  return raw ? `Games: ${raw.num} out of ${raw.total} total games` : '';
                }
              }
            }
          }
        }
      });
    } else {
      // update existing chart
      chart.data.labels = rows.map(r => r.year);
      chart.data.datasets[0].label = label;
      chart.data.datasets[0].data = points;
      chart.update();
    }
  }, [rows, label]);

  return (
    <div style={{ width: '99%', height: '50vh', marginTop: '25px' }}>
      <canvas id="view3-line-chart"></canvas>
    </div>
  );
}