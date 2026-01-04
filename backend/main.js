// Handle requests and communicate with Lambda functions
import { STSClient, GetCallerIdentityCommand } from "@aws-sdk/client-sts";

// Replace with your real Lambda API URL
const apiUrl = ";

let simulationTimerId = null; 
let isSimulationRunning = false;
const flashcards = [
    "This simulation sends requests to two different AWS regions (us-east-2 and us-west-1). You select the maximum number of requests to send (between 10 and 200) to each region.",
    "Route 53 uses Latency-Based Routing to direct user traffic. It automatically routes you to the AWS region that provides the fastest response time.",
    "If one region goes offline, Route 53 Health Checks will detect the failure and automatically redirect all traffic to the healthy region, ensuring zero downtime.",
    "Both regions are Active-Active. This means they both handle traffic simultaneously, unlike a disaster recovery setup where one sits idle."
];
let currentCardIndex = 0;

function updateCard() {
    const textElement = document.getElementById('flashcard-text');
    textElement.style.opacity = 0; 
    
    setTimeout(() => {
        textElement.textContent = flashcards[currentCardIndex];
        textElement.style.opacity = 1; 
    }, 100);
}

function nextCard() {
    currentCardIndex = (currentCardIndex + 1) % flashcards.length;
    updateCard();
}

function prevCard() {
    currentCardIndex = (currentCardIndex - 1 + flashcards.length) % flashcards.length;
    updateCard();
}


async function isRegionAvailable(region) {
  const client = new STSClient({ 
    region: region,
    maxAttempts: 1, 
    requestHandler: {
        connectionTimeout: 2000, 
        socketTimeout: 2000
    }
  });

  try {
    await client.send(new GetCallerIdentityCommand({}));
    document.getElementById(`${region}-status`).innerHTML = `${region}: <span style="color:green;">Active</span>`;
    return true; 
  } catch (error) {
    document.getElementById(`${region}-status`).innerHTML = `${region}: <span style="color:red;">Inactive</span>`;
    console.warn(`Region ${region} check failed:`, error.message);
    return false;
  }
}


function stopSimulation() {
    isSimulationRunning = false;
    if (simulationTimerId) {
        clearTimeout(simulationTimerId);
        simulationTimerId = null;
    }
    
    // Reset buttons
    const simBtn = document.getElementById('simulate-button');
    const stopBtn = document.getElementById('stop-button');
    if(simBtn) {
        simBtn.disabled = false;
        simBtn.innerHTML = "Start";
    }
    if(stopBtn) stopBtn.disabled = true;
    console.log("Simulation Stopped.");
}

async function runSimulation() {
    if (isSimulationRunning) return; 
    isSimulationRunning = true;

    document.getElementById('simulate-button').innerHTML = "Simulating...";
    const simButton = document.getElementById('simulate-button');
    const stopButton = document.getElementById('stop-button');
    const numInput = document.getElementById('num_requests').value;
    const count = parseInt(numInput);
    
    // Input validation
    if (count > 2000) {
        alert("Please enter a number less than or equal to 2000.");
        return;
    }
    if (count < 10) {
        alert("Please enter a number greater than or equal to 10.");
        return;
    }

    // Enabling stop button and disabling simulation button
    simButton.disabled = true;
    stopButton.disabled = false;

    let requestsSent = 0;
    async function sendNextRequest() {
        if (!isSimulationRunning) return;
        requestsSent++;

        document.getElementById('r1_requests').innerHTML = `${requestsSent}`;
        document.getElementById('r2_requests').innerHTML = `${requestsSent}`;
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
            document.getElementById('r1_incoming_requests').innerHTML = `${data.response.num}`;
            document.getElementById('r2_incoming_requests').innerHTML = `${data.response.num}`;
            document.getElementById('r1_latency').innerHTML = `${Math.trunc(data.latency*1000)}ms`;
            document.getElementById('r2_latency').innerHTML = `${Math.trunc(data.latency*1000)}ms`;
            console.log("Simulation Request Result:", data);
        } catch (error) {
            console.error("Error:", error);
        }

        const randomDelay = Math.floor(Math.random() * (2000 - 500 + 1) + 500);
        if (isSimulationRunning) {
            simulationTimerId = setTimeout(sendNextRequest, randomDelay);
        }
    }
    sendNextRequest();
}


async function runQuery() {
    const listContainer = document.getElementById('image-list');

    targetQuery = document.getElementById('target').value;
    numResults = document.getElementById('n_output').value;
    // Input validation
    if (numResults > 200) {
        alert("Please enter a number less than or equal to 200.");
        return;
    }
    if (numResults < 1) {
        alert("Please enter a number greater than or equal to 1.");
        return;
    }
    if (targetQuery === "") {
        alert("Please enter a valid target query.");
        document.getElementById('search-button').innerHTML = "Search";
        return;
    }
    document.getElementById('search-button').innerHTML = "Searching...";
    document.getElementById('search-button').disabled = true;
    console.log(`Querying for ${targetQuery} with ${numResults} results.`);

    try {
        listContainer.innerHTML = '<li style="text-align:center; color:#888;">Fetching images...</li>';
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                target: targetQuery,
                num: numResults,
                mode: "query"
             })
        });
        
        // Handle the response
        const data = await response.json();
        document.getElementById('search-button').disabled = false;
        document.getElementById('search-button').innerHTML = "Search";
        document.getElementById('search-latency').innerHTML = `Latency: ${Math.trunc(data.latency*1000)}ms`;
        console.log("Query Result:", data);

        // Display image files and their respective URLs
        img_files_dict = data.response.img_files;
        listContainer.innerHTML = '';
        img_files_dict.forEach((img) => {
            const li = document.createElement('li');
            li.textContent = `${img['key'].split('/').pop()}`;
            li.onclick = function() { 
                displayImage(img['url']); 
            };
            listContainer.appendChild(li);
        });
        if (listContainer.firstChild) {
            listContainer.firstChild.click();
        }

        alert(data.message);
    } catch (error) {
        console.error("Error:", error);
        listContainer.innerHTML = '<li style="color:red; padding:15px;">Error loading images.</li>';
        alert(error);
    }
}


async function displayImage(img_url) {
    const imgElement = document.getElementById('displayed-image');
    const placeholder = document.getElementById('placeholder-text');
    const listContainer = document.getElementById('image-list');

    // Update the image source
    imgElement.src = img_url;
    imgElement.alt = "Selected Image";
    imgElement.style.display = 'block'; 
    if(placeholder) placeholder.style.display = 'none';

    Array.from(listContainer.children).forEach(child => {
        child.style.backgroundColor = '';
        child.style.fontWeight = 'normal';
    });

    selectedLi.style.backgroundColor = '#eef2f5';
    selectedLi.style.fontWeight = '600';
    selectedLi.style.color = '#009bff';
}