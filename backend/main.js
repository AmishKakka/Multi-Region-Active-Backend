// Handle requests and communicate with Lambda functions

// Replace with your real Lambda API URL
const apiUrl = "";


async function runSimulation() {
    const numInput = document.getElementById('num_requests').value;
    const count = parseInt(numInput);
    
    // Input validation
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

    // Sending query to 'simulate-s3-hits' Lambda function
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                num: count,
                mode: "simulation"
             })
        });
        
        const data = await response.json();
        console.log("Simulation Result:", data);
        alert(data.message);
    } catch (error) {
        console.error("Error:", error);
        alert(error);
    }

    // Live update the incoming requests
    for (let i = 1; i <= count; i++) {
        document.getElementById('r1_incoming_requests').innerHTML = `${i}`;
        document.getElementById('r2_incoming_requests').innerHTML = `${i}`;
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}


async function runQuery() {
    targetQuery = document.getElementById('target').value;
    numResults = document.getElementById('n_output').value;
    console.log(`Querying for ${targetQuery} with ${numResults} results.`);

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                target: targetQuery,
                num: numResults,
                mode: "query"
             })
        });
        
        const data = await response.json();
        console.log("Query Result:", data);
        alert(data.message);
    } catch (error) {
        console.error("Error:", error);
        alert(error);
    }
}