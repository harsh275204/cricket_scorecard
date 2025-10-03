## Cricket Scorekeeper

A web-based, real-time cricket scorekeeping application developed using **JavaScript, HTML, and CSS**. This project allows users to set up matches, record live ball-by-ball scores, and generate detailed scorecards and match summaries.

| Project Author | Date |
| :--- | :--- |
| **Harsh Gupta**  | June 2025  |

---

## ✨ Key Features

The website is flexible, enabling users to create matches, follow live scores, and generate detailed scorecards.

* **Match Setup:** Users can input team names, the number of overs, the toss winner, and the toss decision (bat or ball). Failure to enter required values triggers an error message.
* **Real-Time Scoring (The LIVE Page):** The interface allows dynamic score updates using buttons for runs, wickets, wide balls, and no balls. Key statistics like total runs, wickets, and overs are updated in real-time.
* **Player Input & Validation:** The system manages inputs for openers and new bowlers/batters after a wicket or over ends. It includes error checks for empty fields, duplicate players, and if the bowler bowled the last over.
* **Detailed Scorecard:** A detailed scorecard is generated throughout the match, providing individual performances for both batters and bowlers, segregated by inning.
* **Match Summary:** The summary page displays essential match information, including the toss result. Upon match completion, the winner is displayed, including the margin of victory (runs or wickets).

---

## 🛠️ Technical Implementation

The application is built using a robust front-end structure with **HTML and CSS** for styling and structure, and extensive **JavaScript** for interactivity and functionality.

### State Management (OOP in JavaScript)

The core logic relies on **Object-Oriented Programming (OOP)** in JavaScript, utilizing two classes—**Team** and **Player**—to manage the match state.

* **Team Class:** Stores data like the team name, an array of Player objects, match data (score, wickets), and methods to get overs, score, and run rate.
* **Player Class:** Stores the player's name, runs, fours, sixes, runs conceded, balls bowled, maiden overs, and wickets.
* **Data Persistence:** The website uses **`sessionStorage`** to save and retrieve the Teams Data and the overall match state across different pages.

### Core Functionality

The application employs **Dynamic DOM Manipulation** to display live updates (batter names, scorecards, win messages). The entire inning logic is housed within the central **`startInnings()` function** ("sole of the code").


