// Handle requests and communicate with Lambda functions

// Replace with your real Lambda API URL
const apiUrl = "";


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


async function runSimulation() {
    document.getElementById('simulate-button').innerHTML = "Simulating...";
    document.getElementById('simulate-button').disabled = true;
    const stopButton = document.getElementById('stop-button');
    const numInput = document.getElementById('num_requests').value;
    const count = parseInt(numInput);
    
    // Input validation
    if (count > 200) {
        alert("Please enter a number less than or equal to 200.");
        return;
    }
    if (count < 10) {
        alert("Please enter a number greater than or equal to 10.");
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
        
        stopButton.disabled = false;
        const data = await response.json();
        while (stopButton.click()) {
            console.log("Simulation Result:", data);
        }
        
        document.getElementById('simulate-button').disabled = false;
        document.getElementById('simulate-button').innerHTML = "Start";
        stopButton.disabled = true;
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