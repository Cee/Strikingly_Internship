var url = "http://strikingly-interview-test.herokuapp.com/guess/process";
var userId = "ceecirno@gmail.com";
var secretKey;

var numberOfGuessAllowedForEachWord;
var numberOfWordsToGuess;
var numberOfWordsTried;
var numberOfGuessAllowedForThisWord;

var initGameData = {
	"userId" : userId,
	"action" : "initiateGame"
}
var nextWordData = {};
var guessWordData = {};
var testResultData = {
	"userId" : userId,
	"action" : "getTestResults"
}
var submitData = {
	"userId" : userId,
	"action" : "submitTestResults"
}

var guessingWord;
var guessingWordLength;

$.ajaxSetup({ 
    async : false 
}); 

function init(){
	$.post(url, initGameData, function (data, textStatus) {
		console.log(data);
		var numberData = data.data;
		numberOfWordsToGuess = numberData.numberOfWordsToGuess;
		numberOfGuessAllowedForEachWord = numberData.numberOfGuessAllowedForEachWord;
		secretKey = data.secret;
    	nextWordData.userId = initGameData.userId;
    	nextWordData.secret = secretKey;
    	nextWordData.action = 'nextWord';
	}, 'json');
};

function getNextWord(){
	console.log(nextWordData);
	$.post(url, nextWordData, function (data, textStatus){
		console.log(data);
		guessingWord = data.word;
		guessingWordLength = guessingWord.length;
		numberOfGuessAllowedForThisWord = data.data.numberOfGuessAllowedForThisWord;
		guessWordData.userId = initGameData.userId;
		guessWordData.secret = secretKey;
		guessWordData.action = 'guessWord';
	}, 'json');
};

function guess(guessChar){
	guessWordData.guess = guessChar;
	$.post(url, guessWordData, function (data, textStatus){
		console.log(data);
		guessingWord = data.word;
		numberOfWordsTried = data.data.numberOfWordsTried;
	}, 'json');
};

function getTestResults(){
	testResultData.secret = secretKey;
	$.post(url, testResultData, function (data, textStatus){
		console.log(data);
	});
};

function submitTestResults(){
	submitData.secret = secretKey;
	$.post(url, submitData, function (data, textStatus){
		console.log(data);
	});
}

function playGame(){
	while (numberOfWordsToGuess > 0){
		getNextWord();
		var searchDic = new Array();
		for (x in dictionary){
			if (dictionary[x].length == guessingWordLength){
				searchDic.push(dictionary[x].toUpperCase());
			}
		}

		count = 0;
		var possibleGuesses = 'ETAOINSHRDLCUMWFGYPBVKJXQZ'.split('');
		var hasChosen = {};
		for (x in possibleGuesses){
			hasChosen[possibleGuesses[x]] = false;
		}
		do {
			
			var nextSearchDic = new Array();
			for (x in searchDic){
				var flag = true;
				for (var i = 0; i < guessingWordLength; i++){
					if ((guessingWord.charAt(i) != '*') 
						&& (guessingWord.charAt(i) != searchDic[x].charAt(i))){
						flag = false;
						break;
					}
				}
				if (flag){
					nextSearchDic.push(searchDic[x]);
				}
			}
			console.log(nextSearchDic);

			var frequency = {};
			
			for (x in possibleGuesses){
				frequency[possibleGuesses[x]] = 0;
			}
			for (x in nextSearchDic){
				for (var i = 0; i < guessingWordLength; i++){
					if (guessingWord.charAt(i) == '*'){
						frequency[nextSearchDic[x].charAt(i)] += 1; 
					}
				}
			}
			console.log(frequency);

			var allStar = true;
			for (var i = 0; i < guessingWordLength; i++){
				if (guessingWord.charAt(i) != '*'){
					allStar = false;
					break;
				}
			}

			var chooseChar;
			if (allStar){
				chooseChar = possibleGuesses[count];
				count++;
			} else {
				var max = -1;
				for (x in possibleGuesses){
					if ((frequency[possibleGuesses[x]] > max)
					 && (hasChosen[possibleGuesses[x]] == false)){
						max = frequency[possibleGuesses[x]];
						chooseChar = possibleGuesses[x];
					}
				}
				if (max < 0){
					break;
				} else if (max == 0){
					while (hasChosen[possibleGuesses[count]]){
						count++;
					}
					chooseChar = possibleGuesses[count];
				}
			}
			if (count > 25){
				break;
			} else {
				hasChosen[chooseChar] = true;
				console.log(chooseChar);
				var oldWord = guessingWord;
				if (numberOfGuessAllowedForThisWord >= 1) guess(chooseChar);
				if (oldWord == guessingWord) numberOfGuessAllowedForThisWord--;
			}
		} while ((guessingWord.indexOf('*') != -1) && (numberOfGuessAllowedForThisWord > 0));
		numberOfWordsToGuess--;
	}
	getTestResults();
};

init();
playGame();
submitTestResults();
