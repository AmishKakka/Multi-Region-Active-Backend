// Handle requests and communicate with Lambda functions

async function runSimulation() {
    const numInput = document.getElementById('num_requests').value;
    const count = parseInt(numInput);
    
    // Replace with your real Lambda API URL
    const apiUrl = "";

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ num: count })
        });
        
        const data = await response.json();
        console.log("Simulation Result:", data);
        // alert(data.message);
        
    } catch (error) {
        console.error("Error:", error);
    }
}