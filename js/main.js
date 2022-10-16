document.addEventListener("DOMContentLoaded", () => {

    const keys = document.querySelectorAll('.keyboard-row button');

    let guessedColors = [["","",""]];
    let guessPrecisions = [];
    let availableSpace = 0;

    let colorToGuess = selectRandomColor();

    let guessedColorsCount = 0;
    let bestPrecision = 0;
    let lowestPrecision = 100;

    let gameEnded = false;

    let debugReset = false;

    //const colorToGuessEl = document.getElementById('guessing-color');
    //colorToGuessEl.style = `background-color:${colorToGuessString};border-color:${colorToGuessString}`;

    initLocalStorage();
    initStatsModal();
    initHelpModal();
    initInfoModal();

    const colorToGuessString = stringToColorString(colorToGuess);

    createSquares();
    handleInpout();
    loadLocalStorage();
    
    function initLocalStorage(){
        const oldDate = window.localStorage.getItem("date");
        const date = new Date();
        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();
        let currentDate = `${day}-${month}-${year}`;
        //console.log(currentDate);

        if(currentDate == oldDate && !debugReset){
            colorToGuess = window.localStorage.getItem("currentColorToGuess") || colorToGuess;
            
            // if(!storedColor){
            //     window.localStorage.setItem("currentColorToGuess", colorToGuess);
            // }
            // else{
            //     console.log("loading color stored : " + storedColor);
            //     colorToGuess = storedColor;
            // }
        }
        else{
            // new Day
            window.localStorage.setItem("date", currentDate);
            resetGameState();
            window.localStorage.setItem("currentColorToGuess", colorToGuess);
        }
        
    }

    function preserveGameStates(){
        window.localStorage.setItem("guessedColors", JSON.stringify(guessedColors));
        window.localStorage.setItem("guessPrecisions", JSON.stringify(guessPrecisions));
        window.localStorage.setItem("guessedColorsCount", guessedColorsCount);
        window.localStorage.setItem("availableSpace", availableSpace);
        window.localStorage.setItem("bestPrecision", bestPrecision);
        window.localStorage.setItem("gameEnded", gameEnded);

        const boardContainer = document.getElementById("board-container");
        window.localStorage.setItem("boardContainer", boardContainer.innerHTML);
    }

    function loadLocalStorage(){
        guessedColorsCount = Number(window.localStorage.getItem("guessedColorsCount")) || guessedColorsCount;
        availableSpace = Number(window.localStorage.getItem("availableSpace")) || availableSpace;
        guessedColors = JSON.parse(window.localStorage.getItem("guessedColors")) || guessedColors;
        guessPrecisions = JSON.parse(window.localStorage.getItem("guessPrecisions")) || guessPrecisions;
        bestPrecision = Number(window.localStorage.getItem("bestPrecision")) || bestPrecision;
        gameEnded = window.localStorage.getItem("gameEnded") == "true" || gameEnded;

        const storedBoardContainer = window.localStorage.getItem("boardContainer");
        if (storedBoardContainer) {
            document.getElementById("board-container").innerHTML =
            storedBoardContainer;
        }
    }

    function resetGameState(){
        window.localStorage.removeItem("guessedColors");
        window.localStorage.removeItem("guessPrecisions");
        window.localStorage.removeItem("guessedColorsCount");
        window.localStorage.removeItem("availableSpace");
        window.localStorage.removeItem("bestPrecision");
        window.localStorage.removeItem("gameEnded");
        window.localStorage.removeItem("boardContainer");
    }

    function handleInpout(){
        for (let i = 0; i < keys.length; i++) {
            keys[i].onclick = ({target}) => {
                const key = target.getAttribute("data-key");
                
                if(gameEnded){
                    return;
                }
                if(key == 'enter'){
                    handleSubmitColor();
                    return;
                }
    
                if(key == 'del'){
                    handleDeleteNumber();
                    return;
                }
                updateGuessedColors(key)
            }
        }
    
        window.addEventListener("keydown", function (event) {
            if (event.defaultPrevented) {
              return; // Do nothing if the event was already processed
            }

            if(gameEnded){
                return;
            }
          
            switch (event.key) {
              case "Backspace":
                handleDeleteNumber();
                break;
              case "Enter":
                handleSubmitColor();
                break;
            }
    
            //console.log(event.code.substring(0,event.code.length-1));
            if(//event.code.substring(0,event.code.length-1) == "Digit" | 
                event.code.substring(0,event.code.length-1) == "Numpad"){
                updateGuessedColors(event.key)
            }
          
            // Cancel the default action to avoid it being handled twice
            event.preventDefault();
          }, true);
          // the last option dispatches the event to the listener first,
          // then dispatches event to window
    }
    function selectRandomColor(){
        const newColor = formatColorValue(String(getRandomInt(256))) 
        + formatColorValue(String(getRandomInt(256)))
        + formatColorValue(String(getRandomInt(256)));
        //console.log(newColor);
        return newColor;
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
      }

    function getCurrentColorArr(){
        const numberOfGuessedColors = guessedColors.length
        return guessedColors[numberOfGuessedColors - 1];
    }

    function updateGuessedColors(number){
        console.log("update color 1");
        if(availableSpace < guessedColors.length * 3){

            const currentValueIndex = availableSpace % 3
            if(!guessedColors[guessedColors.length - 1][currentValueIndex]){
                guessedColors[guessedColors.length - 1][currentValueIndex] = number;}
            else guessedColors[guessedColors.length - 1][currentValueIndex] += number;

            const currentValueString = getCurrentColorArr()[currentValueIndex];

            const availableSpaceEl = document.getElementById(String(availableSpace+1))

            availableSpaceEl.textContent = currentValueString;

            if(availableSpaceEl.textContent.length > 2){
                if(currentValueString > 255){
                    guessedColors[guessedColors.length - 1][currentValueIndex] = "255";
                    availableSpaceEl.textContent = "255";
                }
                availableSpace++;
            }
        }
        
    }

    function handleDeleteNumber(){
        let currentValueIndex = availableSpace % 3;
        //console.log(guessedColors.length);
        if(!guessedColors[guessedColors.length - 1][currentValueIndex]){
            if(currentValueIndex == 0){
                console.log("empty color string");
                return;
            }
            availableSpace--;
            currentValueIndex = availableSpace % 3;
        }

        if(availableSpace == guessedColors.length * 3){
            availableSpace--;
            currentValueIndex = availableSpace % 3;
        }

        const currentValueString = guessedColors[guessedColors.length - 1][currentValueIndex];
        const newValueString = currentValueString.substring(0,currentValueString.length-1);
        guessedColors[guessedColors.length - 1][currentValueIndex] = newValueString;

        const lastNumberEl = document.getElementById(String(availableSpace + 1));
        lastNumberEl.textContent = newValueString;
    }

    function formatColorValue(colorValue){
        return "0".repeat(3 - colorValue.length) + colorValue;
    }

    function handleSubmitColor(){
        availableSpace = guessedColors.length * 3
        //console.log(guessedColors);
        const currentColorArr = getCurrentColorArr()
        //console.log(currentColorArr)
        let completedColorArr = ["","",""];
        for (let index = 0; index < 3; index++) {
            completedColorArr[index] = formatColorValue(currentColorArr[index]);
            //lastNumberEl = document.getElementById(String(availableSpace - 2 + index));    
            //lastNumberEl.textContent = completedColorArr[index];
        }

        const currentColorString = completedColorArr[0] + completedColorArr[1] + completedColorArr[2] ;
        const firstNumberId = guessedColorsCount * 3 + 1;
        const interval = 200;

        if(guessedColors.length == 6){
            endGame();
        }

        for (let index = 0; index < 4; index++) {
            
            setTimeout(() => {
                if(index == 3){
                    precisionEl = document.getElementById("precision-"+ String((guessedColors.length - 2) * 3 + 2))

                    const precision = colorPrecision(currentColorString);
                    guessPrecisions.push(precision);

                    precisionEl.textContent = String(precision).substring(0,4) + "%";

                    if(precision > bestPrecision){
                        bestPrecision = precision;
                        precisionEl.style = `color:${"rgb(181, 159, 59)"}`;
                    }/*
                    else if(precision < lowestPrecision){
                        lowestPrecision = precision;
                        precisionEl.style = `color:${"rgb(58, 58, 60)"}`;
                    }*/
                    else{
                        precisionEl.style = `color:${"rgb(58, 58, 60)"}`;
                    }
                    
                    precisionEl.classList.add("animate__flipInX");
                    preserveGameStates();
                }
                else{
                    const tileColor = stringToColorString(currentColorString)
                    const numberId = firstNumberId + index;
                    const numberEl = document.getElementById(numberId);
                    numberEl.classList.add("animate__flipInX");
                    numberEl.style = `background-color:${tileColor};border-color:${tileColor}`;

                    //lastNumberEl = document.getElementById(String(availableSpace - 2 + index));    
                    numberEl.textContent = completedColorArr[index];
                }
            }, interval * index);
        }

        guessedColorsCount++;

        //console.log("color guessed : " + currentColorString)
        //console.log("precision = " + colorPrecision(currentColorString) + "%");

        if(currentColorString == colorToGuess){
            window.alert("You won");
        }

        guessedColors.push(["","",""]);
    }

    function endGame(){
        gameEnded = true;
        const interval = 200;
        setTimeout(() => {
            for (let index = 0; index < 3; index++) {
                setTimeout(() => {
                    let solutionEl = document.getElementById("solution-" + String(index));
                    solutionEl.textContent = colorToGuess.substring(index*3,index*3+3)
                    solutionEl.classList.add("animate__flipInX");
                    const boardContainer = document.getElementById("board-container");
                    window.localStorage.setItem("boardContainer", boardContainer.innerHTML);
                }, interval * index);   
        }}, interval * 5)
            
        endGameStatsUpdate();
    }

    function createSquares(){
        const gameBoard = document.getElementById("board")

        for (let index = 0; index < 18; index++) {
            
            let square = document.createElement("div");
            square.classList.add("square");
            square.classList.add("animate__animated");

            const colorIndex = index%3

            switch(colorIndex){
                case 0: square.style = `border-color:${"rgb(255,0,0)"}`; break;
                case 1: square.style = `border-color:${"rgb(0,255,0)"}`; break;
                case 2: square.style = `border-color:${"rgb(0,0,255)"}`; break;
            }
            
            square.setAttribute("id", index+1);
            gameBoard.appendChild(square);

            if(index % 3 == 2){
                let precision = document.createElement("div");
                precision.classList.add("precision");
                precision.classList.add("animate__animated");
                precision.setAttribute("id", "precision-" + index);
                gameBoard.appendChild(precision);
            }
        }

        for (let index = 0; index < 4; index++) {
            let spacerSolution = document.createElement("div");
            spacerSolution.classList.add("spacer-solution");
            gameBoard.appendChild(spacerSolution);
        }

        for (let index = 0; index < 3; index++) {
            let solution = document.createElement("div");
            solution.classList.add("solution");
            solution.classList.add("animate__animated");
            solution.setAttribute("id", "solution-" + index);
            solution.textContent = "???";
            solution.style = `background-color:${colorToGuessString};border-color:${colorToGuessString}`;
            gameBoard.appendChild(solution);
        }
    }

    function colorPrecision(colorString){
        const redValue = colorString.substring(0,3) - colorToGuess.substring(0,3);
        const greenValue = colorString.substring(3,6) - colorToGuess.substring(3,6);
        const blueValue = colorString.substring(6,9) - colorToGuess.substring(6,9);

        return 100 - (Math.abs(redValue) + Math.abs(greenValue) + Math.abs(blueValue))/(3*255)*100;
    }

    function stringToColorString(colorString){
        return "rgb(" + colorString.substring(0,3) 
        + "," + colorString.substring(3,6) 
        + "," + colorString.substring(6,9) 
        + ")";
    }

    function initHelpModal() {
        const modal = document.getElementById("help-modal");
    
        // Get the button that opens the modal
        const btn = document.getElementById("help");
    
        // Get the <span> element that closes the modal
        const span = document.getElementById("close-help");
    
        // When the user clicks on the button, open the modal
        btn.addEventListener("click", function () {
            modal.style.display = "block";
        });
    
        // When the user clicks on <span> (x), close the modal
        span.addEventListener("click", function () {
            modal.style.display = "none";
        });
    
        // When the user clicks anywhere outside of the modal, close it
        window.addEventListener("click", function (event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        });
    }

    function initInfoModal(){
        const modal = document.getElementById("info-modal");
        const btn = document.getElementById("info");
        const span = document.getElementById("close-info");

        btn.addEventListener("click", function(){
            modal.style.display = "block";
        })

        span.addEventListener("click", function(){
            modal.style.display = "none";
        })

        window.addEventListener("click", function (event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        });
    }

    function initStatsModal() {
        const modal = document.getElementById("stats-modal");
        const btn = document.getElementById("stats");
        const span = document.getElementById("close-stats");
    
        btn.addEventListener("click", function () {
            updateStatsModal();
            modal.style.display = "block";
        });
    
        span.addEventListener("click", function () {
            modal.style.display = "none";
        });

        window.addEventListener("click", function (event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        });
    }

    function endGameStatsUpdate(){
        const totalGames = window.localStorage.getItem("totalGames") || 0;
        window.localStorage.setItem("totalGames", Number(totalGames) + 1 );

        const bestPrecisions = JSON.parse(window.localStorage.getItem("bestPrecisions")) || Array(50).fill(0);
        const firstPrecisions = JSON.parse(window.localStorage.getItem("firstPrecisions")) || Array(50).fill(0);
        const lowestPrecisions = JSON.parse(window.localStorage.getItem("lowestPrecisions")) || Array(50).fill(0);

        const hPrecision = Math.floor(bestPrecision/2)-1;
        const firstPrecision = Math.floor(guessPrecisions[0]/2)-1;
        const lPrecision = Math.floor(lowestPrecision/2)-1;

        if(bestPrecisions[hPrecision] == 0){
            bestPrecisions[hPrecision] = 3;
        }
        else{
            bestPrecisions[hPrecision]++;
        }

        if(firstPrecisions[firstPrecision] == 0){
            firstPrecisions[firstPrecision] = 3;
        }
        else{
            firstPrecisions[firstPrecision]++;
        }

        if(lowestPrecisions[lPrecision] == 0){
            lowestPrecisions[lPrecision] = 3;
        }
        else{
            lowestPrecisions[lPrecision]++;
        }
        
        window.localStorage.setItem("bestPrecisions", JSON.stringify(bestPrecisions));
        window.localStorage.setItem("firstPrecisions", JSON.stringify(firstPrecisions));
    }

    function updateStatsModal() {
        const totalGames = window.localStorage.getItem("totalGames") || 0;
        const bestPrecisions = JSON.parse(window.localStorage.getItem("bestPrecisions")) || Array(50).fill(0);
        const firstPrecisions = JSON.parse(window.localStorage.getItem("firstPrecisions")) || Array(50).fill(0);

        document.getElementById("total-played").textContent = totalGames;

        const bestPrecisionsChart = document.getElementById("best-precisions-chart");

        if(!document.getElementById("best-precisions-01")){
            for (let index = 0; index < 50; index++) {
                let line = document.createElement("li");
                line.setAttribute("id", "best-precisions-" + index+1);
                bestPrecisionsChart.appendChild(line);
            }
        }

        for (let index = 0; index < 50; index++) {
            const line = document.getElementById("best-precisions-" + index+1)
            line.style.gridColumnEnd = bestPrecisions[index];
            
            if(bestPrecisions[index] == 0){
                line.style.visibility = "hidden";
            }
            else{
                line.style.visibility = "visible";
            }
        }

        const firstPrecisionsChart = document.getElementById("first-precision-chart");

        if(!document.getElementById("first-precisions-01")){
            for (let index = 0; index < 50; index++) {
                let line = document.createElement("li");
                line.setAttribute("id", "first-precisions-" + index+1);
                firstPrecisionsChart.appendChild(line);
            }
        }

        for (let index = 0; index < 50; index++) {
            const line = document.getElementById("first-precisions-" + index+1)
            line.style.gridColumnEnd = firstPrecisions[index];
            
            if(firstPrecisions[index] == 0){
                line.style.visibility = "hidden";
            }
            else{
                line.style.visibility = "visible";
            }
        }
    }
});