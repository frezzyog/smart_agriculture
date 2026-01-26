'use client'

import React from 'react'

const DeviceList = ({ devices = [] }) => {
    return (
        <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-bold mb-4">Your Devices</h2>
            {devices.length === 0 ? (
                <p className="text-gray-500">No devices found.</p>
            ) : (
                <ul className="divide-y">
                    {devices.map((device) => (
                        <li key={device.id} className="py-2 flex justify-between items-center">
                            <div>
                                <p className="font-semibold">{device.name}</p>
                                <p className="text-sm text-gray-400">{device.type} - {device.status}</p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs ${device.status === 'online' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {device.status}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default DeviceList
