document.addEventListener("DOMContentLoaded", () => {
	if(document.getElementById("goToSetup")) goToSetup();
	if(document.getElementById("moveToToss")) Move_To_Toss();
	if(document.getElementById("moveToLive")) inn1_teams_input();
	if(document.getElementById("startMatch") && sessionStorage.getItem("at_live0")==1) inn1_players_input();
	if(document.getElementById("startMatch") && sessionStorage.getItem("at_live0")==2) secondInningInput();
	if(document.getElementById("live") && sessionStorage.getItem("at_live")==1) goToInning1();
	if(document.getElementById("live") && sessionStorage.getItem("at_live")==2) inn2_players_input();
	// if(sessionStorage.getItem("firstTeam") && sessionStorage.getItem("secondTeam")) showScoreCard();
	navigation();
	if(document.getElementById("scoreCard")) showScoreCard();
	if(document.getElementById("matchDetails")) showSummary();
	if(document.getElementById("reset")) reset();
});

class Player {
	name;
	type = "all"; // bat, bowl, all
	status = "dnb"; // dnb, out, playing;
	status_bowl = "notBowling";
	onStrike = false;
	runs = 0;
	ballPlayed = 0;
	fours = 0;
	sixes = 0;
	wicketType = "bowled"; // bowled, caught, lbw, runout, hit wicket
	ballBowled = 0;
	over_stats = [[0]]; // overs_stats[1] will be a array representing the 1st over of this bowler
	dotBowled = 0;
	maidenOvers = 0;
	runConceded = 0;
	wickets = 0;

	constructor(name) {
		this.name = name;
	}
	score(run) {
		this.runs += run;
		if(run===4) this.fours++;
		if(run===6) this.sixes++;
	}
	getSR() {
		if(this.ballPlayed===0) return 0.00;
		else return ((this.runs*100)/(this.ballPlayed)).toFixed(2);
	}
	getER() {
		if(this.ballBowled===0) return 0.00;
		else return ((this.runConceded*6)/(this.ballBowled)).toFixed(2);
	}
	getOversBowled() {
		let ovr = Math.floor((this.ballBowled)/6);
		let ovr_rem = (this.ballBowled)%6;
		if( !ovr_rem ) {
			return `${ovr}`;
		}
		else return `${ovr}.${ovr_rem}`;
	}
	static fromJSON(obj) {
		const p = new Player(obj.name);
		p.type = obj.type;
		p.status = obj.status;
		p.status_bowl = obj.status_bowl;
		p.onStrike = obj.onStrike;
		p.runs = obj.runs;
		p.ballPlayed = obj.ballPlayed;
		p.fours = obj.fours;
		p.sixes = obj.sixes;
		p.wicketType = obj.wicketType;
		p.ballBowled = obj.ballBowled;
		p.over_stats = obj.over_stats;
		p.dotBowled = obj.dotBowled;
		p.maidenOvers = obj.maidenOvers;
		p.runConceded = obj.runConceded;
		p.wickets = obj.wickets;
		return p;
	}
}

class Team {
	name;
	batters = [];
	bowlers = [];
	batFirst;
	status; // can be batting first, batting second;
	score = 0;
	wickets = 0;
	ballsPlayed = 0;
	ballsBowled = 0;
	over_data = [0];
	//this will contain a over as a array : [bowler, 4,0,2,w,wb,nb] etc;

	constructor(name, Bool, status) {
		this.name = name;
		this.batFirst = Bool;
		this.status = status;
	}
	addBatter(player) {
		this.batters.push(player);
	}
	addBowler(player) {
		this.bowlers.push(player);
	}
	getOvers() {
		let a = Math.floor((this.ballsPlayed)/6);
		let b = (this.ballsPlayed)%6;
		return ( !b ? `${a}` : `${a}.${b}`);
	}
	getScore() {
		return `${this.name} ${this.score}/${this.wickets} (${this.getOvers()})`;
	}
	getStriker() {
		for(const b of this.batters) {
			if(b.status === "playing" && b.onStrike === true) return b;
		}
	}
	getNonStriker() {
		for(const b of this.batters) {
			if(b.status === "playing" && b.onStrike === false) return b;
		}
	}
	getBowler() {
		for(const b of this.bowlers) {
			if(b.status_bowl === "bowling") return b;
		}
	}
	getCRR() {
		if(this.ballsPlayed==0) return 0.00;
		else return ((this.score)*6/(this.ballsPlayed)).toFixed(2);
	}
	static fromJSON(obj) {
		const team = new Team(obj.name, obj.batFirst, obj.status);
		team.batFirst = obj.batFirst; 
		team.score = obj.score;
		team.wickets = obj.wickets;
		team.ballsPlayed = obj.ballsPlayed;
		team.ballsBowled = obj.ballsBowled;
		team.over_data = obj.over_data;
		team.batters = obj.batters.map(p => Player.fromJSON(p));
		team.bowlers = obj.bowlers.map(p => Player.fromJSON(p));
		return team;
	}
}

function saveTeam(team, key = "team") {
	sessionStorage.setItem(key, JSON.stringify(team));
}

function loadTeam(key = "team") {
	const data = sessionStorage.getItem(key);
	return data ? Team.fromJSON(JSON.parse(data)) : null;
}

// function savePlayer(player, key = "player") {
// 	sessionStorage.setItem(key, JSON.stringify(player));
// }

// function loadPlayer(key = "player") {
// 	const data = sessionStorage.getItem(key);
// 	return data ? Player.fromJSON(JSON.parse(data)) : null;
// }

function goToSetup() {
	let button1 = document.getElementById("goToSetup");
	if( button1 ) {
		button1.addEventListener("click", () => {
			window.location.href = "./html/setup.html";
		});
	}
}

function Move_To_Toss() {
	let button2 = document.getElementById("moveToToss");
	if( button2 ) {
		button2.addEventListener("click", function () {

			console.log("Button Clicked for moving to toss");

			let team1 = document.getElementById("team1Input").value.trim();
			let team2 = document.getElementById("team2Input").value.trim();
			let errorBox = document.getElementById("errorMsg");
	
			console.log("Team 1 :", team1);
			console.log("Team 2 :", team2);

			if ( !team1 || !team2 ) {
				errorBox.textContent = "Please enter both team names!";
			}
			else if(team1 === team2) {
				errorBox.textContent = "Both teams cannot be same!";
			} 
			else {
				errorBox.textContent = "";
				document.getElementById("teamsInput").style.display = "none";
				document.getElementById("toss").style.display = "block";
				sessionStorage.setItem("visible_div_setup", "toss");
			
				document.getElementById("toss_opt1").innerHTML = team1
				document.getElementById("toss_opt2").innerHTML = team2
		
				sessionStorage.setItem("team1",team1);
				sessionStorage.setItem("team2",team2);
			}
		});
	}
	// console.log(document.getElementsByClassName("InputBG"));
}

function inn1_teams_input() {
	// console.log("IN the move to live 1 function");
	let button3 = document.getElementById("moveToLive");
	if( button3 ) {
		button3.addEventListener("click", () => {
			// console.log(button3)
			const team1 = sessionStorage.getItem("team1");
			const team2 = sessionStorage.getItem("team2");
	
			// console.log(team1, team2)
			const tossWinner = document.getElementById("tossWinner").value;
			const tossDecision = document.getElementById("tossDecision").value;
			const overs = document.getElementById("overs").value;

			sessionStorage.setItem("tossWinner", tossWinner);
			sessionStorage.setItem("tossDecision", tossDecision);
	
			let batFirstTeam, bowlFirstTeam;
	
			if( tossDecision === "bat" ) {
				batFirstTeam = ( tossWinner==="t1" ? team1 : team2 );
				bowlFirstTeam = ( tossWinner==="t1" ? team2 : team1 );
			}
			else {
				bowlFirstTeam = ( tossWinner==="t1" ? team1 : team2 );
				batFirstTeam = ( tossWinner==="t1" ? team2 : team1 );
			}

			// document.getElementById("openers_team1").textContent = `Openers of ${batFirstTeam}`;
			// document.getElementById("first_bowler_team1").textContent = `Bowler of ${bowlFirstTeam}`;
	

			sessionStorage.setItem("batFirst", batFirstTeam);
			sessionStorage.setItem("bowlFirst", bowlFirstTeam);
			sessionStorage.setItem("overs", overs);

			sessionStorage.setItem("at_live0", 1);
			window.location.href = "./live0.html";

			// console.log("here");
			// sessionStorage.setItem("at_Live", true);
		});
	}
}

function inn1_players_input() {

	console.log("inside the inn1_players_input function");
	let button_to_start = document.getElementById("startMatch");
	if(button_to_start) {
		button_to_start.addEventListener("click", () => {

			console.log("now clicked");

			let i1_striker = document.getElementById("strikeBatsman").value.trim();
			let i1_nonstriker = document.getElementById("nonStrikeBatsman").value.trim();
			let i1_bowler = document.getElementById("first_bowler").value.trim();

			if( !i1_bowler || !i1_nonstriker || !i1_striker ) {
				document.getElementById("opener_or_bowler_error").textContent = "Please enter all player names!";
				return;
			}
			else if( i1_striker === i1_nonstriker ) {
				document.getElementById("opener_or_bowler_error").textContent = "Both Batsman can't be same!";
				return;
			}

			// let batFirst = sessionStorage.getItem("batFirst");
			// let bowlFirst = sessionStorage.getItem("bowlFirst");
			// let overs = sessionStorage.getItem("overs");

			sessionStorage.setItem("i1_striker", i1_striker);
			sessionStorage.setItem("i1_nonstriker", i1_nonstriker);
			sessionStorage.setItem("i1_bowler", i1_bowler);

			sessionStorage.setItem("at_live", 1)
			window.location.href = "./live.html";


		});
	}
}

function goToInning1() {
	let inn1_striker = sessionStorage.getItem("i1_striker");
	let inn1_nonstriker = sessionStorage.getItem("i1_nonstriker");
	let inn1_bowler = sessionStorage.getItem("i1_bowler");

	const battingTeamName = sessionStorage.getItem("batFirst");
	const bowlingTeamName = sessionStorage.getItem("bowlFirst");
	const overs = sessionStorage.getItem("overs");

	let firstTeam = loadTeam("firstTeam");
	let secondTeam = loadTeam("secondTeam");

	if(!firstTeam) {
		firstTeam = new Team(battingTeamName, true, "batting first");
		saveTeam("firstTeam", firstTeam);
	}

	if(!secondTeam) {
		secondTeam = new Team(bowlingTeamName, false, "bowling first");
		saveTeam("secondTeam", secondTeam);
	}

	let existingBatterNames = firstTeam.batters.map(b => b.name);
	if (!existingBatterNames.includes(inn1_striker)) {
		const t1p1 = new Player(inn1_striker);
		t1p1.status = "playing";
		t1p1.onStrike = true;
		firstTeam.addBatter(t1p1);
	}
	if (!existingBatterNames.includes(inn1_nonstriker)) {
		const t1p2 = new Player(inn1_nonstriker);
		t1p2.status = "playing";
		t1p2.onStrike = false;
		firstTeam.addBatter(t1p2);
	}

	let existingBowlerNames = secondTeam.bowlers.map(b => b.name);
	if (!existingBowlerNames.includes(inn1_bowler)) {
		const t2p1 = new Player(inn1_bowler);
		t2p1.status_bowl = "bowling";
		secondTeam.addBowler(t2p1);
	}

	saveTeam("firstTeam", firstTeam);
	saveTeam("secondTeam", secondTeam);
	
	let inning1_score = firstTeam.getScore() + ' vs. ' + secondTeam.name;
	document.getElementById("currentScore").textContent = inning1_score;

	// if (!document.getElementById(`batter-row-${striker.name}`)) {
	// 	showBatsman(firstTeam.batters.find(b => b.name === inn1_striker));
	// }
	// if (!document.getElementById(`batter-row-${nonStriker.name}`)) {
	// 	showBatsman(firstTeam.batters.find(b => b.name === inn1_nonstriker));
	// }
	// if (!document.getElementById(`bowler-row-${bowler.name}`)) {
	// 	showBowler(secondTeam.bowlers.find(b => b.name === inn1_bowler));
	// }
	
	// showBatsman(firstTeam.batters.find(b => b.name === inn1_striker));
	// showBatsman(firstTeam.batters.find(b => b.name === inn1_nonstriker));
	// showBowler(secondTeam.bowlers.find(b => b.name === inn1_bowler));

	showBatsman(firstTeam.getStriker());
	showBatsman(firstTeam.getNonStriker());
	showBowler(secondTeam.getBowler());

	// let matchLive = sessionStorage.getItem("matchLive");
	// if(!matchLive) {
	// 	startInnings(firstTeam, secondTeam, overs, -1);
	// 	sessionStorage.setItem("matchLive", "yes");
	// }
	startInnings(firstTeam, secondTeam, overs, -1);
}

function inn2_input() {
	console.log("secondInningInput() here")
	let secondTeam = loadTeam("secondTeam");
	let firstTeam = loadTeam("firstTeam");
	console.log(secondTeam);
	console.log(firstTeam);
	sessionStorage.setItem("at_live0", 2);
	window.location.href = "./live0.html";
}

function secondInningInput() {
	let button_to_start_1 = document.getElementById("startMatch");
	if(button_to_start_1) {
		button_to_start_1.addEventListener("click", () => {

			// alert("in the second inning input");
			console.log("now clicked in second inning");

			let i2_striker = document.getElementById("strikeBatsman").value.trim();
			let i2_nonstriker = document.getElementById("nonStrikeBatsman").value.trim();
			let i2_bowler = document.getElementById("first_bowler").value.trim();

			if( !i2_bowler || !i2_nonstriker || !i2_striker ) {
				document.getElementById("opener_or_bowler_error").textContent = "Please enter all player names!";
				return;
			}
			else if( i2_striker === i2_nonstriker ) {
				document.getElementById("opener_or_bowler_error").textContent = "Both Batsman can't be same!";
				return;
			}

			// let batFirst = sessionStorage.getItem("batFirst");
			// let bowlFirst = sessionStorage.getItem("bowlFirst");
			// let overs = sessionStorage.getItem("overs");

			sessionStorage.setItem("i2_striker", i2_striker);
			sessionStorage.setItem("i2_nonstriker", i2_nonstriker);
			sessionStorage.setItem("i2_bowler", i2_bowler);

			console.log("Second inning starting here");
			sessionStorage.setItem("at_live", 2);
			window.location.href = "./live.html";

		});
	}
}

function inn2_players_input() {
	let inn2_striker = sessionStorage.getItem("i2_striker");
	let inn2_nonstriker = sessionStorage.getItem("i2_nonstriker");
	let inn2_bowler = sessionStorage.getItem("i2_bowler");

	// const battingTeamName = sessionStorage.getItem("batFirst");
	// const bowlingTeamName = sessionStorage.getItem("bowlFirst");
	const overs = sessionStorage.getItem("overs");

	let secondTeam = loadTeam("secondTeam");
	let firstTeam = loadTeam("firstTeam");	

	let existingBatterNames = secondTeam.batters.map(b => b.name)
	if(!existingBatterNames.includes(inn2_striker)) {
		const t2p11 = new Player(inn2_striker);
		t2p11.status = "playing";
		t2p11.onStrike = true;
		secondTeam.addBatter(t2p11);
	}
	if(!existingBatterNames.includes(inn2_nonstriker)) {
		const t2p10 = new Player(inn2_nonstriker);
		t2p10.status = "playing";
		t2p10.onStrike = false;
		secondTeam.addBatter(t2p10);
	}

	let existingBowlerNames = firstTeam.bowlers.map(b => b.name);
	if(!existingBowlerNames.includes(inn2_bowler)) {
		const t1p11 = new Player(inn2_bowler);
		t1p11.status_bowl = "bowling";
		firstTeam.addBowler(t1p11);
	}
	
	saveTeam("firstTeam", firstTeam);
	saveTeam("secondTeam", secondTeam);

	let inning2_score = secondTeam.getScore() + ' vs. ' + firstTeam.getScore();
	document.getElementById("currentScore").textContent = inning2_score;

	// showBatsman(secondTeam.batters.find(b => b.name === inn2_striker));
	// showBatsman(secondTeam.batters.find(b => b.name === inn2_nonstriker));
	// showBowler(firstTeam.bowlers.find(b => b.name === inn2_bowler));

	showBatsman(secondTeam.getStriker());
	showBatsman(secondTeam.getNonStriker());
	showBowler(firstTeam.getBowler());

	// showScore(firstTeam, secondTeam);
	// sessionStorage.setItem("at_live", final);
	// startInnings(secondTeam, firstTeam, overs, firstTeam.score+1);
	// if (!matchLive) {
	// 	startInnings(secondTeam, firstTeam, overs, firstTeam.score + 1);
	// 	sessionStorage.setItem("matchLive", "yes");
	// }
	startInnings(secondTeam, firstTeam, overs, firstTeam.score + 1);
}

function showBatsman(batter) {
	if(batter.onStrike) {
		document.getElementById("striker").textContent = `${batter.name}*`;
		document.getElementById("strikerR").textContent = batter.runs;
		document.getElementById("strikerB").textContent = batter.ballPlayed;
		document.getElementById("striker4s").textContent = batter.fours;
		document.getElementById("striker6s").textContent = batter.sixes;
		document.getElementById("strikerSR").textContent = batter.getSR();
	}
	else if(!batter.onStrike) {
		document.getElementById("nonStriker").textContent = batter.name;
		document.getElementById("nonStrikerR").textContent = batter.runs;
		document.getElementById("nonStrikerB").textContent = batter.ballPlayed;
		document.getElementById("nonStriker4s").textContent = batter.fours;
		document.getElementById("nonStriker6s").textContent = batter.sixes;
		document.getElementById("nonStrikerSR").textContent = batter.getSR();
	}
}

function showBowler(bowler) {
	document.getElementById("bowler").textContent = bowler.name;
	document.getElementById("bowlerO").textContent = bowler.getOversBowled();
	document.getElementById("bowlerM").textContent = bowler.maidenOvers;
	document.getElementById("bowlerR").textContent = bowler.runConceded;
	document.getElementById("bowlerW").textContent = bowler.wickets;
	document.getElementById("bowlerER").textContent = bowler.getER();
}

function startInnings(t1, t2, overs, target) {
	// considering t1 already has two batsman, t2 already has 1 bowler;

	let totalBalls = overs * 6;
	// let currBalls = 0;
	// let striker = t1.batters[0];
	let striker = t1.getStriker();
	// let nonStriker = t1.batters[1];
	let nonStriker = t1.getNonStriker();
	// let bowler = t2.bowlers[0];
	let bowler = t2.getBowler();
	let matchEnded = false;

	// let last_bowler_name = sessionStorage.getItem("lastBowler");
	// if(!last_bowler_name) {
	// 	last_bowler_name = bowler.name;
	// 	sessionStorage.setItem("lastBowler", last_bowler_name);
	// }
	// let lastBowler = t2.bowlers.find(b => b.name === last_bowler_name);
	// lastBowler.status_bowl = "notBowling";

	// if(!t2.bowlers.find(b => b.name === last_bowler_name)) {
	// 	t2.addBowler(lastBowler);
	// }


	// let lastBowlerData = JSON.parse(sessionStorage.getItem("lastBowler") || "null");
	// let lastBowler;

	// if (!lastBowlerData) {
	// 	lastBowler = bowler;
	// 	sessionStorage.setItem("lastBowler", JSON.stringify({
	// 		name: bowler.name,
	// 		team: (target === -1 ? "secondTeam" : "firstTeam")
	// 	}));
	// } 
	// else {
	// 	// Try to find the bowler in t1 or t2 bowlers
	// 	let foundInT1 = t1.bowlers.find(b => b.name === lastBowlerData.name);
	// 	let foundInT2 = t2.bowlers.find(b => b.name === lastBowlerData.name);

	// 	if (foundInT1) {
	// 		lastBowler = foundInT1;
	// 	} else if (foundInT2) {
	// 		lastBowler = foundInT2;
	// 	} else {
	// 		// Bowler not found in either team — assume from t2 (bowling team)
	// 		lastBowler = new Player(lastBowlerData.name);
	// 		lastBowler.status_bowl = "notBowling";
	// 		t2.addBowler(lastBowler); // Add to current bowling team only
	// 	}
	// }

	let lastBowlerData = JSON.parse(sessionStorage.getItem("lastBowler") || "null");
	let lastBowler;

	if (!lastBowlerData) {
		lastBowler = bowler;
		sessionStorage.setItem("lastBowler", JSON.stringify({
			name: bowler.name
		}));
	} else {
		let foundInT2 = t2.bowlers.find(b => b.name === lastBowlerData.name);
		if (foundInT2) {
			lastBowler = foundInT2;
		} else {
			// Bowler not in this innings' bowling team (new innings), reset
			lastBowler = bowler;
			sessionStorage.setItem("lastBowler", JSON.stringify({
				name: bowler.name
			}));
		}
	}
	updateScore();


	function updateScore() {
		showBatsman(striker);
		showBatsman(nonStriker);
		showBowler(bowler);
		showRunRates();
		if(t2.batFirst) {
			document.getElementById("currentScore").textContent = t1.getScore() + ' vs. ' + t2.getScore();
		}
		else {
			document.getElementById("currentScore").textContent = t1.getScore() + ' vs. ' + t2.name;
		}
		// saveTeams();
		checkWin();
		saveTeams();
		let team1 = loadTeam("firstTeam");
		let team2 = loadTeam("secondTeam");
		console.log(team1, team2);
		// showScoreCard();
	}

	function showRunRates() {
		document.getElementById("curRR").textContent = `CRR: ${t1.getCRR()}`;
		if(target === -1) {
			document.getElementById("reqRR").textContent = "";
			return;
		}
		// let target = t2.score + 1;
		// let Target = t2.score + 1;
		let ballsLeft = totalBalls - t2.ballsBowled;
		let runsLeft = t2.score + 1 - t1.score;
		let rr;
		if(ballsLeft===0) rr = 0.00;
		else {
			rr = ((runsLeft)*6/(ballsLeft)).toFixed(2);
		}
		document.getElementById("reqRR").textContent = `RR: ${rr}`;
	}

	function hideRunRates() {
		document.getElementById("curRR").style.display = "none";
		document.getElementById("reqRR").style.display = "none";
	}

	function disableButtons() {
		[0,1,2,3,4,6].forEach(run => {
			document.getElementById(`${run}run`).disabled = true;
		});
		document.getElementById("wide").disabled = true;
		document.getElementById("noBall").disabled = true;
		document.getElementById("wicket").disabled = true;
	}

	function checkWin() {
		if(target==-1) return;
		const inningEnd=()=>{
			return t2.ballsBowled >= totalBalls;
		}
		const allOut=()=>{
			return t1.wickets==10 && !inningEnd();
		}
		const chased=()=>{
			return t1.score>t2.score && !inningEnd();
		}
		let k;
		
		if( chased() ) {
			k = [1, t1.name, 10-t1.wickets, totalBalls-t1.ballsBowled];
			matchEnded = true;
		}
		else if( inningEnd() || allOut() ) {
			let margin = t2.score - t1.score;
			if(margin===0) k = [3,0,0];
			else if(margin < 0) k = [1, t1.name, 10-t1.wickets];
			else k = [2, t2.name, margin];
			matchEnded = true;
		}

		if(matchEnded) {
			sessionStorage.setItem("matchEnded", "true");
			sessionStorage.setItem("matchEndValue", JSON.stringify(k));
			disableButtons();
			hideRunRates();
			showBowler(bowler);
			showResult(k);

			// if(!sessionStorage.getItem("goneToSummary")) {
			window.location.href = "./summary.html";
				// sessionStorage.setItem("goneToSummary", "true");
			// }
			
		}
	}

	function swapStrike() {
		[striker.onStrike, nonStriker.onStrike] = [false, true];
		[striker, nonStriker] = [nonStriker, striker];
	};

	function promptNewBatsman() {
		let error_bat = document.getElementById("bat_inp_error");
		error_bat.textContent = "";

		let a = document.getElementById("live_event_input");
		let b = document.getElementById("batter_input");
		let c = document.getElementById("live");
		let d = document.getElementById("navBar");
		c.style.display = "none";
		d.style.display = "none";
		a.style.display = "flex";
		b.style.display = "block";
		let button5 = document.getElementById("batter_input_button");
		let nameInput = document.getElementById("newBatsmanInput");
		if(button5){
			button5.addEventListener("click",()=>{
				let name = nameInput.value.trim();
				if(!name) {
					error_bat.textContent = "Please Enter Next Bowler Name!";
					return;
				}
				for(let b of t1.batters) {
					if(name === b.name) {
						if(b.status === "playing") {
							error_bat.textContent = `${name} is currently playing!`;
							return;
						}
						else if(b.status === "out") {
							error_bat.textContent = `${name} has been dismissed!`;
							return;
						}
					}
				}
				let newBatsman = new Player(name);
				newBatsman.status = "playing";
				newBatsman.onStrike = true;
				t1.addBatter(newBatsman);
				striker = newBatsman;

				nameInput.value = "";
				c.style.display = "block";
				d.style.display = "block";
				a.style.display = "none";
				b.style.display = "none";

				updateScore();

				if((t2.ballsBowled % 6) === 0) {
					promptNewBowler();
				}
			});
		}
	};

	function promptNewBowler() {
		let error_bowl = document.getElementById("bowl_inp_error");
		error_bowl.textContent = "";

		let a = document.getElementById("live_event_input");
		let b = document.getElementById("bowler_input");
		let c = document.getElementById("live");
		let d = document.getElementById("navBar");
		c.style.display = "none";
		d.style.display = "none";
		a.style.display = "flex";
		b.style.display = "block";

		let button5 = document.getElementById("bowler_input_button");
		let nameInput = document.getElementById("newBowlerInput");

		let newButton = button5.cloneNode(true);
		button5.parentNode.replaceChild(newButton, button5);
		button5 = newButton;	

		if(button5){
			button5.addEventListener("click",()=>{
				// last_bowler_name.status_bowl = "notBowling";
				let name = nameInput.value.trim();
				if(!name) {
					error_bowl.textContent = "Please Enter Next Bowler Name!";
					return;
				}
				if(name === lastBowler.name){
					error_bowl.textContent = `${name} can't bowl two consecutive overs!`;
					return;
				}
				let found = false;
				for(let b of t2.bowlers) {
					if(name === b.name) {
						bowler = b;
						found = true;
						// lastBowler = bowler;
						break;
					}
				}
				if(!found) {
					// let newBowler = new Player(name);
					// newBowler.status_bowl = "bowling";
					bowler = new Player(name);
					t2.addBowler(bowler);
					// bowler.status_bowl = "notBowling";
					// lastBowler = bowler;
					// bowler = newBowler;
				}
				lastBowler.status_bowl = "notBowling";
				bowler.status_bowl = "bowling";
				lastBowler = bowler;

				sessionStorage.setItem("lastBowler", JSON.stringify({
					name: lastBowler.name,
					team: (target === -1 ? "secondTeam" : "firstTeam")
				}));				
				// saveTeams();
				nameInput.value = "";
				c.style.display = "block";
				d.style.display = "flex";
				a.style.display = "none";
				b.style.display = "none";

				updateScore();
			});
		}
		// let t1 = loadTeam("firstTeam"), t2 = loadTeam("secondTeam");

		// console.log(t1);
		// console.log(t2);
	};

	function countMaidens(b) {
		let last_over = b.over_stats[b.over_stats.length - 1];
		if(last_over.length != 6) return 0;
		let isMaiden = true;
		for(a of last_over) {
			if(!isMaiden) return 0;
			isMaiden = isMaiden && ( a===0 || a==="w" || a==="lb" );
		}
		return (isMaiden ? 1 : 0 );
	}

	function checkOverEnd() {
		if(t2.ballsBowled % 6 === 0) {
			bowler.maidenOvers += countMaidens(bowler);
			lastBowler.status_bowl = "notBowling";
			// if(!t2.bowlers.find(b => b.name === last_bowler_name)) {
			// 	t2.addBowler(lastBowler);
			// }
			// sessionStorage.setItem("lastBowler", lastBowler.name);
			sessionStorage.setItem("lastBowler", JSON.stringify({
				name: lastBowler.name,
				team: (target === -1 ? "secondTeam" : "firstTeam")
			}));
			saveTeams();
			updateScore();
			swapStrike();
			if(t2.ballsBowled < totalBalls) promptNewBowler();
			// console.log(bowler);
		}
	}

	function secInning() {
		if(target === -1) {
			sessionStorage.setItem("secondInningsStarted", "true");
			inn2_input();
			console.log("First Innings completed");
		}
		else {
			console.log("second inning completed");
			checkWin();
		}
		// checkWin();
		return;
	}

	function updateOverData(b, result) {
		let over = Math.floor((b.ballBowled-1)/6) + 1;
		if( !b.over_stats[over] ) b.over_stats[over] = [];
		b.over_stats[over].push(result);
	}

	function ball_Played(runs, extra=false) {
		if(extra===false) {
			// currBalls++;
			striker = t1.getStriker();
			striker.ballPlayed++;
			t1.ballsPlayed++;
			bowler.ballBowled++;
			t2.ballsBowled++;
			if(runs===0) {
				bowler.dotBowled++;
			}
		}
		striker.score(runs);
		t1.score += runs;
		bowler.runConceded += runs;

		// if( !bowler.over_stats[over(bowler)] ) bowler.over_stats[over(bowler)] = [];
		// bowler.over_stats[over(bowler)].push(runs);

		updateOverData(bowler, runs)

		if(runs%2) swapStrike();

		if(t2.ballsBowled >= totalBalls) {
			showBatsman(bowler);
			secInning();
		}

		checkOverEnd();
		updateScore();
	}	

	function saveTeams() {
		if(target==-1) {
			saveTeam(t1, "firstTeam");
			saveTeam(t2, "secondTeam");
		}
		else {
			saveTeam(t1, "secondTeam");
			saveTeam(t2, "firstTeam");
		}
	}

	[0,1,2,3,4,6].forEach(run => {
		if(matchEnded) return;
		document.getElementById(`${run}run`).addEventListener("click", () => {
			ball_Played(run);
		});
	});

	document.getElementById("wide").addEventListener("click", () => {
		t1.score++;
		bowler.runConceded++;
		updateOverData(bowler, "wb");
		updateScore();
	});

	document.getElementById("noBall").addEventListener("click", () => {
		t1.score++;
		bowler.runConceded++;
		updateOverData(bowler, "nb");
		updateScore();
	});

	document.getElementById("wicket").addEventListener("click", () => {
		if(matchEnded) return;
		// currBalls++;
		t2.ballsBowled++;
		// if(currBalls >= totalBalls) {
		// 	secInning();
		// }
		t1.wickets++;
		bowler.wickets++;
		t1.ballsPlayed++;
		bowler.ballBowled++;
		striker.ballPlayed++;
		updateOverData(bowler, "w");

		striker.status = "out";
		// if(t2.ballsBowled === totalBalls) {
		// 	striker = nonStriker;
		// 	document.getElementById("nonStrikerRow").style.display = "none";
		// 	secInning();
		// } 
		// else if ((t2.ballsBowled % 6) === 0) {
		// 	// Batsman out AND over completed
		// 	promptNewBatsman();
		// 	// Wait for batsman to be selected, then prompt new bowler
		// 	let button = document.getElementById("batter_input_button");
		// 	let handler = () => {
		// 		button.removeEventListener("click", handler);
		// 		promptNewBowler();
		// 	};
		// 	button.addEventListener("click", handler);
		// } 
		// else {
		// 	// Only wicket, over not completed
		// 	promptNewBatsman();
		// }
		// updateScore();
		
		if(t2.ballsBowled === totalBalls) {
			striker = nonStriker;
			document.getElementById("nonStrikerRow").style.display = "none";
			secInning();
		}
		else {
			promptNewBatsman();
		}

		updateScore();
		if(t2.ballsBowled!=totalBalls) promptNewBatsman();

		// checkOverEnd();
		updateScore();
	});
}

function showResult(r) {
	let aa = loadTeam("firstTeam");
	let bb = loadTeam("secondTeam");

	console.log(aa, bb);
	if(!r) return;
	let a=r[0], name=r[1], margin=r[2];
	let x = document.getElementById("showResult");
	x.style.display = "block";
	if(a==1){
		x.textContent = `${name} won by ${margin} wickets.`;
	}
	else if(a==2){
		x.textContent = `${name} won by ${margin} runs!`;
	}
	else if(a==3){
		x.textContent =`Match Drawn!`;
	}
}

function navigation() {
	const scorecard_live = document.getElementById("scorecard_at-live");
	const scorecard_summary = document.getElementById("scorecard_at-summary");
	const live_scorecard = document.getElementById("live_page_at-scorecard");
	const live_summary = document.getElementById("live_page_at-summary");
	const summary_live = document.getElementById("summary_at-live");
	const summary_scorecard = document.getElementById("summary_at-scorecard");

	if(scorecard_live) {
		scorecard_live.addEventListener("click", ()=>{
			window.location.href = "./scorecard.html";
		});
	}
	if(scorecard_summary) {
		scorecard_summary.addEventListener("click", ()=>{
			window.location.href = "./scorecard.html";
		});
	}
	if(live_scorecard) {
		live_scorecard.addEventListener("click", ()=>{
			window.location.href = "./live.html";
		});
	}
	if(live_summary) {
		live_summary.addEventListener("click", ()=>{
			window.location.href = "./live.html";
		});
	}
	if(summary_live) {
		summary_live.addEventListener("click", ()=>{
			window.location.href = "./summary.html";
		});
	}
	if(summary_scorecard) {
		summary_scorecard.addEventListener("click", ()=>{
			window.location.href = "./summary.html";
		});
	}
}

// function rebuildTeam(jsonData) {
//     let team = new Team(jsonData.name);
//     team.score = jsonData.score;
//     team.wickets = jsonData.wickets;
//     team.ballsPlayed = jsonData.ballsPlayed;
//     team.batFirst = jsonData.batFirst;

//     for (let b of jsonData.batters) {
//         let player = new Player(b.name);
//         player.runs = b.runs;
//         player.ballPlayed = b.ballPlayed;
//         player.fours = b.fours;
//         player.sixes = b.sixes;
//         player.status = b.status;
//         player.onStrike = b.onStrike;
//         team.addBatter(player);
//     }

//     for (let b of jsonData.bowlers) {
//         let player = new Player(b.name);
//         player.ballBowled = b.ballBowled;
//         player.dotBowled = b.dotBowled;
//         player.runConceded = b.runConceded;
//         player.wickets = b.wickets;
//         player.maidenOvers = b.maidenOvers;
//         player.over_stats = b.over_stats || [];
//         team.addBowler(player);
//     }

//     return team;
// }

function showSummary() {
	const summaryEle= document.getElementById("matchDetails");
	if(!summaryEle) {
		console.log("matchDetails not found");
		return;
	}
	let t1 = loadTeam("firstTeam");
	let t2 = loadTeam("secondTeam");

	const summary_teams = document.getElementById("team_Names");
	const summary_toss = document.getElementById("Toss_");
	const summary_eq = document.getElementById("currentEq");

	summary_teams.textContent = `${t1.name} vs. ${t2.name}`;

	let tossWinnerKey = sessionStorage.getItem("tossWinner"); // "t1" or "t2"
	let tossDecision = sessionStorage.getItem("tossDecision"); // "bat" or "bowl"
	let team1Name = sessionStorage.getItem("team1");
	let team2Name = sessionStorage.getItem("team2");

	let tossWinnerName = tossWinnerKey === "t1" ? team1Name : team2Name;
	let decisionText = tossDecision === "bat" ? "Bat First" : "Bowl First";
	
	summary_toss.textContent = `${tossWinnerName} won the Toss and chose to ${decisionText}.`;
	const secondInningsStarted = sessionStorage.getItem("secondInningsStarted") === "true";

	console.log(t1,t2);
	console.log(t1.score, t2.score, t1.ballsPlayed, t2.ballsPlayed);

	const matchEnd = sessionStorage.getItem("matchEnded") === "true";

	const totalBalls = parseInt(sessionStorage.getItem("overs"))*6;
	if(matchEnd) {
		margin = t1.score - t2.score
		if(margin < 0) {
			ballsLeft = totalBalls - t2.ballsPlayed;
			ballStatement = `${ballsLeft} ball${ballsLeft === 1 ? "" : "s"} left.`;
			summary_eq.textContent = `${t2.name} won by ${10-t2.wickets} wickets(${ballStatement})`
		}
		else if(margin > 0) {
			summary_eq.textContent = `${t1.name} won by ${margin} run${margin === 1 ? "" : "s"}.`;
		}
		else {
			summary_eq.textContent = "Match Drawn!";
		}
		return;
	}

	if (secondInningsStarted) {
		let ballsLeft = (parseInt(sessionStorage.getItem("overs")) * 6) - t1.ballsBowled;
		let runsLeft = t1.score - t2.score + 1;
		summary_eq.textContent = `${t2.name} need ${runsLeft} run${runsLeft !== 1 ? 's' : ''} from ${ballsLeft} ball${ballsLeft !== 1 ? 's' : ''} to Win.`;
	}
	else {
		summary_eq.textContent = "Inning 1 in Progress.";
	}


}

function showScoreCard() {
	const scoreCardEle = document.getElementById("scoreCard");
	if(! scoreCardEle) {
		console.log("scoreCard ID not found");
		return;
	} 
	let t1 = loadTeam("firstTeam");
	let t2 = loadTeam("secondTeam");

	console.log("inside showScoreCard");
	console.log("team1 loaded = ", t1);
	console.log("team2 loaded = ", t2);

	if(!t1 || !t2) {
		console.log("team(s) is/are missing in sessionStorage");
		return;
	}

	["batters_1_data", "bowlers_1_data", "batters_2_data", "bowlers_2_data"].forEach(id => {
		document.getElementById(id).innerHTML = "";
	});

	if(t2.ballsPlayed > 0 || t2.score > 0) {
		document.getElementById("secondInnScore").style.display = "block";
	}


	document.getElementById("score1").textContent = t1.getScore();
	document.getElementById("score2").textContent = t2.getScore();
	for(const b of t1.batters) {
		addBatterRow("batters_1_data", b);
	}
	for(const b of t2.bowlers) {
		addBowlerRow("bowlers_1_data", b);
	}
	for(const b of t2.batters) {
		addBatterRow("batters_2_data", b);
	}
	for(const b of t1.bowlers) {
		addBowlerRow("bowlers_2_data", b);
	}

}

function addBatterRow(id, batter) {
	const row = document.createElement("tr");
	const values = [
		batter.status==="playing" ? `${batter.name}*` : batter.name,
		batter.runs,
		batter.ballPlayed,
		batter.fours,
		batter.sixes,
		batter.getSR()
	];

	for(const val of values) {
		const cell = document.createElement("td");
		cell.textContent = val;
		row.appendChild(cell);
	}

	const table = document.getElementById(id);
	if(table) {
		table.appendChild(row);
	}
	// document.getElementById(id).appendChild(row);
}

function addBowlerRow(id, bowler) {
	const row = document.createElement("tr");
	const values = [
		bowler.name,
		bowler.getOversBowled(),
		bowler.maidenOvers,
		bowler.runConceded,
		bowler.wickets,
		bowler.getER()
	];

	for(const val of values) {
		const cell = document.createElement("td");
		cell.textContent = val;
		row.appendChild(cell);
	}

	const table = document.getElementById(id);
	if(table) {
		table.appendChild(row);
	}
	// document.getElementById(id).appendChild(row);
}

function reset() {
	let button = document.getElementById("reset");
	if(button) {
		button.addEventListener("click", () => {
			sessionStorage.clear();
			window.location.href = "../index.html";
		});
	}
}