import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


export default function Graph({data, xKey, yKeys, timeKey}: {data: any, xKey: string, yKeys: string[], timeKey: string}) {
    console.log(data)

    return (
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            width={500}
            height={300}
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            {yKeys.map((key) => (
              <Bar key={key} dataKey={key} stackId="a" fill={`#${Math.floor(Math.random()*16777215).toString(16)}`} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
}
