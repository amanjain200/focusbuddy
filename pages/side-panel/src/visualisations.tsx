import React, {useState} from 'react'
import { PieChart, Pie, Tooltip, Cell } from 'recharts';
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  LabelList
} from "recharts";
import { LineChart, Line } from 'recharts';

interface DomainDetails {
  prevTimeStamp: number;
  totalActiveTime: number;
  category: string;
  interactionCount: number
}

interface AllUrls {
  [domain: string]: DomainDetails;
}

export const categoriesPie = (allDomains : AllUrls) => {
  const [activeIndex, setActiveIndex] = useState(-1);

  let categories: { [key: string]: number } = {};
  for (const domain in allDomains) {
    const category = allDomains[domain].category;
    categories[category] = (categories[category] || 0) + allDomains[domain].totalActiveTime;
  }
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const data = Object.keys(categories).map((key) => ({
    name: key,
    students: categories[key],
  }));

    const onPieEnter: (data: any, index: number) => void = (_, index) => {
      setActiveIndex(index);
    };

  return (
    <PieChart width={250} height={250}>
    <Pie
        activeIndex={activeIndex}
        data={data}
        dataKey="students"
        outerRadius={100}
        fill="green"
        onMouseEnter={onPieEnter}
        style={{ cursor: 'pointer', outline: 'none' }} // Ensure no outline on focus
    >
        {data.map((entry: any, index: number) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
    </Pie>
    <Tooltip content={<CustomTooltip />} />
</PieChart>
  )
}

export const DomainActiveTimeBar = (allDomains : AllUrls) => {
  const timeSpent: { [key: string]: number } = {};
  for (const domain in allDomains) {
    timeSpent[domain] = allDomains[domain].totalActiveTime;
  }
  const top10TimeSpent = Object.entries(timeSpent)
  .sort((a, b) => b[1] - a[1]) // Sort by time spent (descending)
  .slice(0, 10) // Take the top 10
  .reduce((acc, [domain, time]) => {
    acc[domain] = time;
    return acc;
  }, {} as { [key: string]: number });

  const data = Object.keys(top10TimeSpent).map((key) => ({
    name: key,
    students: top10TimeSpent[key],
  }));
  return (
    <BarChart width={250} height={250} data={data} layout="vertical">
    <CartesianGrid stroke="#ccc" />
    <XAxis type="number" />
    <YAxis dataKey="name" type="category" width={150} />
    <Bar dataKey="students" fill="green">
    </Bar>
  </BarChart>
  )
}


const tabSwitchingFreqvsTime = (tabSwitchHistory: number[]) => {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  const last24Hours = now - 24 * oneHour;

  // Filter only tab switches from the last 24 hours
  const recentHistory = tabSwitchHistory.filter(timestamp => timestamp >= last24Hours);

  // Create hourly buckets
  const buckets: { [key: string]: number } = {};

  for (let i = 0; i < 24; i++) {
    const hourTimestamp = last24Hours + i * oneHour;
    const timeLabel = new Date(hourTimestamp).toISOString().slice(11, 13) + ":00"; // Format: "HH:00"
    buckets[timeLabel] = 0;
  }

  // Count tab switches per hour
  recentHistory.forEach(timestamp => {
    const hourBucket = new Date(timestamp).toISOString().slice(11, 13) + ":00";
    if (buckets[hourBucket] !== undefined) {
      buckets[hourBucket]++;
    }
  });

  // Convert to array for Recharts
  return Object.keys(buckets).map(hour => ({
    time: hour,
    count: buckets[hour]
  }));
};

export const TabSwitchingChart = ({ tabSwitchHistory }: { tabSwitchHistory: number[] }) => {
  const tabSwitchData = tabSwitchingFreqvsTime(tabSwitchHistory);

  return (
    <LineChart width={500} height={300} data={tabSwitchData} >
      <CartesianGrid stroke="#ccc" />
      <XAxis dataKey="time" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="count" stroke="blue" strokeWidth={2} />
    </LineChart>
  );
};

export const focusVsDistractionPie = (allDomains : AllUrls) => {
  const [activeIndex, setActiveIndex] = useState(-1);

  let categories: { [key: string]: number } = {};
  for (const domain in allDomains) {
    const category = allDomains[domain].category;
    if(category === "Productivity" || category === "Coding" || category === "News" || category === "Education" || category === 'AI Tools' || category === "Finance" || category === "Healthcare") {
      categories["Focus"] = (categories["Focus"] || 0) + allDomains[domain].totalActiveTime;

    }else{
      categories["Distraction"] = (categories["Distraction"] || 0) + allDomains[domain].totalActiveTime;
    }
  }
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const data = Object.keys(categories).map((key) => ({
    name: key,
    students: categories[key],
  }));

    const onPieEnter: (data: any, index: number) => void = (_, index) => {
      setActiveIndex(index);
    };

  return (
    <PieChart width={250} height={250}>
    <Pie
        activeIndex={activeIndex}
        data={data}
        dataKey="students"
        outerRadius={100}
        fill="green"
        onMouseEnter={onPieEnter}
        style={{ cursor: 'pointer', outline: 'none' }} // Ensure no outline on focus
    >
        {data.map((entry: any, index: number) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
    </Pie>
    <Tooltip content={<CustomTooltip />} />
</PieChart>
  )
}

function visualisations() {
  return (
    <div>
      
    </div>
  )
}

export default visualisations


const formatDuration = (ms: number) => {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  if (days > 0) return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
};


const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0]; 
    return (
      <div style={{ background: "#fff", padding: "8px", border: "1px solid #ccc", borderRadius: "5px" }}>
        <p>{name}: <strong>{formatDuration(value)}</strong></p>
      </div>
    );
  }
  return null;
};