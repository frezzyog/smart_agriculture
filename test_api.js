async function test() {
    try {
        const res = await fetch('http://localhost:5000/api/devices');
        const data = await res.json();
        console.log('Status:', res.status);
        console.log('Data:', JSON.stringify(data, null, 2));
        console.log('Is Array:', Array.isArray(data));
    } catch (e) {
        console.error('Fetch error:', e);
    }
}
test();
