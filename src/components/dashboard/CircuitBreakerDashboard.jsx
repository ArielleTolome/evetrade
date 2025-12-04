import React, { useState, useEffect } from 'react';
import { registry as circuitBreakerRegistry, CircuitState } from '../../utils/circuitBreaker';
import { Badge } from '../ui/Badge';

const CircuitBreakerDashboard = () => {
  const [circuits, setCircuits] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCircuits(circuitBreakerRegistry.getAllStatus());
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

  const getBadgeColor = (state) => {
    switch (state) {
      case CircuitState.CLOSED:
        return 'bg-green-500';
      case CircuitState.OPEN:
        return 'bg-red-500';
      case CircuitState.HALF_OPEN:
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const exportMetrics = () => {
    const metrics = circuitBreakerRegistry.getMetrics();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(metrics, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "circuit_breaker_metrics.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Circuit Breaker Dashboard</h2>
        <button
          onClick={exportMetrics}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Export Metrics
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold">Endpoint</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">State</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">Failure Rate</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">Last Trip</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-600">
            {circuits.map((circuit) => (
              <tr key={circuit.name}>
                <td className="px-4 py-2 whitespace-nowrap">{circuit.name}</td>
                <td className="px-4 py-2">
                  <Badge className={getBadgeColor(circuit.state)}>
                    {circuit.state}
                  </Badge>
                </td>
                <td className="px-4 py-2">
                  {(circuit.failureRate * 100).toFixed(2)}%
                </td>
                <td className="px-4 py-2">
                  {circuit.stats.lastTrip ? new Date(circuit.stats.lastTrip.time).toLocaleTimeString() : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CircuitBreakerDashboard;
