import './App.css';
import { useEffect, useState } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

function App() {
  const [channelMeta, setChannelMeta] = useState(null);
  const [channelStats, setChannelStats] = useState(null);
  const [topVideos, setTopVideos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metaRes, statsRes, topRes, vidsRes] = await Promise.all([
          fetch('/api/channel-metadata'),
          fetch('/api/channel-summary'),
          fetch('/api/top-videos'),
          fetch('/api/videos'),
        ]);
        if (!metaRes.ok || !statsRes.ok || !topRes.ok || !vidsRes.ok) throw new Error('API error');
        const meta = await metaRes.json();
        const stats = await statsRes.json();
        const top = await topRes.json();
        const vids = await vidsRes.json();
        setChannelMeta(meta[0]);
        setChannelStats(stats[0]);
        setTopVideos(top);
        setVideos(vids);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  // Chart data
  const videoViewsData = {
    labels: topVideos.map(v => v.title),
    datasets: [
      {
        label: 'Top Video Views',
        data: topVideos.map(v => v.view_count),
        backgroundColor: 'rgba(75,192,192,0.6)',
      },
    ],
  };

  const categoryCounts = topVideos.reduce((acc, v) => {
    acc[v.category] = (acc[v.category] || 0) + 1;
    return acc;
  }, {});
  const categoryData = {
    labels: Object.keys(categoryCounts),
    datasets: [
      {
        label: 'Top Video Categories',
        data: Object.values(categoryCounts),
        backgroundColor: [
          'rgba(255,99,132,0.6)',
          'rgba(54,162,235,0.6)',
          'rgba(255,206,86,0.6)',
          'rgba(75,192,192,0.6)',
          'rgba(153,102,255,0.6)',
          'rgba(255,159,64,0.6)'
        ],
      },
    ],
  };

  const allVideoViews = {
    labels: videos.map(v => v.title),
    datasets: [
      {
        label: 'All Video Views',
        data: videos.map(v => v.view_count),
        borderColor: 'rgba(54,162,235,1)',
        backgroundColor: 'rgba(54,162,235,0.2)',
        fill: true,
      },
    ],
  };

  return (
    <div className="App">
      <h1>YouTube Channel Dashboard</h1>
      {channelMeta && (
        <div className="card">
          <h2>{channelMeta.title}</h2>
          <p>{channelMeta.description}</p>
          <div className="stats-list">
            <li><b>Subscribers</b><br />{channelMeta.subscribers}</li>
            <li><b>Videos</b><br />{channelMeta.video_count}</li>
            <li><b>Total Views</b><br />{channelMeta.view_count}</li>
          </div>
        </div>
      )}
      {channelStats && (
        <div className="card">
          <h3>Channel Stats</h3>
          <ul className="stats-list">
            <li>Total Videos<br />{channelStats.total_videos}</li>
            <li>Average Views<br />{channelStats.average_views}</li>
            <li>Min Views<br />{channelStats.min_views}</li>
            <li>Max Views<br />{channelStats.max_views}</li>
          </ul>
        </div>
      )}
      <div className="charts-row">
        <div className="chart-card" style={{padding: '32px 32px 24px 32px'}}>
          <h3>Top Videos by Views</h3>
          <Bar data={videoViewsData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </div>
        <div className="chart-card">
          <h3>Top Video Categories</h3>
          <Pie data={categoryData} />
        </div>
      </div>
      <div className="chart-card">
        <h3>All Videos - Views Trend</h3>
        <Line data={allVideoViews} options={{ responsive: true }} />
      </div>
    </div>
  );
}

export default App;
