export default function DeviceDetailsPage({ params }) {
    const { id } = params

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Device Details: {id}</h1>
            <div className="bg-white p-6 rounded shadow">
                <p className="text-gray-600">Detailed information and configuration for device {id} will appear here.</p>
            </div>
        </div>
    )
}
