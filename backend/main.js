// Handle requests and communicate with Lambda functions

async function runSimulation() {
    const numInput = document.getElementById('num_requests').value;
    const count = parseInt(numInput);
    // Replace with your real Lambda API URL
    const apiUrl = "";

    if (count > 50) {
        alert("Please enter a number less than or equal to 50.");
        return;
    }
    if (count < 1) {
        alert("Please enter a number greater than or equal to 1.");
        return;
    }

    // Set the requests count
    document.getElementById('r1_requests').innerHTML = `${count}`;
    document.getElementById('r2_requests').innerHTML = `${count}`;

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

    // Live update the incoming requests
    for (let i = 1; i <= count; i++) {
        document.getElementById('r1_incoming_requests').innerHTML = `${i}`;
        document.getElementById('r2_incoming_requests').innerHTML = `${i}`;
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}