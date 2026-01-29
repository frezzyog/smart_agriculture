export default function DeviceDetailsPage({ params }) {
    const { id } = params

    return (
        <div className="lg:ml-64 space-y-6 bg-background min-h-screen p-4 md:p-8 transition-all duration-500">
            <h1 className="text-2xl font-bold text-foreground">Device Details: {id}</h1>
            <div className="bg-card p-6 rounded-2xl border border-border">
                <p className="text-foreground/60">Detailed information and configuration for device {id} will appear here.</p>
            </div>
        </div>
    )
}
