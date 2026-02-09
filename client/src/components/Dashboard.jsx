import React, { useState, useEffect } from 'react';
import { syncTransactions, getSheetData } from '../api';

const Dashboard = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filterEmail, setFilterEmail] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

    const fetchData = async () => {
        try {
            const { data } = await getSheetData();
            if (data.success) {
                setData(data.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleSync = async () => {
        setLoading(true);
        try {
            await syncTransactions();
            await fetchData();
        } catch (error) {
            console.error('Error syncing:', error);
            alert('Failed to sync with PayPal');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const parseDate = (dateStr) => {
        if (!dateStr) return null;
        const parts = dateStr.split(' ');
        const dateParts = parts[0].split('/');
        return new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}T${parts[1] || '00:00:00'}`);
    };

    const filteredData = data.filter(row => {
        const emailMatch = filterEmail ? row['Email']?.toLowerCase().includes(filterEmail.toLowerCase()) : true;

        let dateMatch = true;
        if (filterStartDate || filterEndDate) {
            const rowDate = parseDate(row['Date']);
            if (rowDate) {
                if (filterStartDate) {
                    const start = new Date(filterStartDate);
                    start.setHours(0, 0, 0, 0);
                    if (rowDate < start) dateMatch = false;
                }
                if (filterEndDate && dateMatch) {
                    const end = new Date(filterEndDate);
                    end.setHours(23, 59, 59, 999);
                    if (rowDate > end) dateMatch = false;
                }
            }
        }

        return emailMatch && dateMatch;
    });

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">PayPal Transactions</h1>
                <button
                    onClick={handleSync}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                >
                    {loading ? 'Syncing...' : 'Sync Now'}
                </button>
            </div>

            <div className="bg-white shadow rounded-lg p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Email</label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded-md p-2"
                            placeholder="user@example.com"
                            value={filterEmail}
                            onChange={(e) => setFilterEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                            type="date"
                            className="w-full border border-gray-300 rounded-md p-2"
                            value={filterStartDate}
                            onChange={(e) => setFilterStartDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                            type="date"
                            className="w-full border border-gray-300 rounded-md p-2"
                            value={filterEndDate}
                            onChange={(e) => setFilterEndDate(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {data.length > 0 && Object.keys(data[0]).map((key) => (
                                <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {key}
                                </th>
                            ))}
                            {data.length === 0 && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No Data</th>}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredData.map((row, idx) => (
                            <tr key={idx}>
                                {Object.entries(row).map(([key, val], i) => {
                                    let displayVal = val;
                                    if (key === 'Date' && val) {
                                        try {
                                            const d = new Date(val);
                                            if (!isNaN(d.getTime())) {
                                                const day = String(d.getDate()).padStart(2, '0');
                                                const month = String(d.getMonth() + 1).padStart(2, '0');
                                                const year = d.getFullYear();
                                                displayVal = `${day}/${month}/${year}`;
                                            }
                                        } catch (e) {
                                            // keep original if parse fails
                                        }
                                    }
                                    return (
                                        <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {displayVal}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredData.length === 0 && (
                    <div className="p-6 text-center text-gray-500">No transactions found matching your criteria.</div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
