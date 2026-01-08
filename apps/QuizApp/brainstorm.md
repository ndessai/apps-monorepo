# project
Build a mobile application that allows users to  quiz themselves or other. The quiz will primarily be based on NAQT format. For now, the app will allow user to start a quiz locally but eventually the user can either host a tournament with other players or join an existing tournament.

## Evolution of the app ##
Describes what versions of the app will support what functionality

*** 


<table>
  <th>Version</th>
  <th>Functionality</th>
  <tr>
    <td>
      MVP
    </td>
    <td>
    MVP Focus will be to allow local self quiz based on middle school NAQT format for middle school. Use only 2 questions for this phase.
      Locally sourced NAQT packet that will ask questions to the user and allow the user to buzz when the question is being read in a timely manner (5 seconds). If the user answers the question correctly either through typing the response or through speaking it out, the app will make the best faith effor to see if the answer matches the expected answer and take the user to either bonus question or next toss up question. As a placeholder, on the first screen called QuizLaunchScreen add option to start quiz, host a tournament and join a tournament. Use bottom tray for answering the questions. 
    </td>
  </tr>
  <tr>
    <td>
      V1
    </td>
  <td>
    Expand on MVP phase and build end to end local quiz workflow with NAQT recommended 24 or 25 questions. User profile should support recoding number of games played, number of points per game (PPG), Assign badges based on these scores to the user etc. 
  </td>
  </tr>
  <tr>
    <td>
      V2
    </td>
  <td>
   This should support multiplayer quizzing. There will not be a backend support but mostly simulation on the frontend how multiplayer quiz will be conducted. This should support hosting a tournament which will create a code which can be shared with other app users to join the quiz. 
  </td>
  </tr>
  <tr>
    <td>
      V3
    </td>
  <td>
   Backend support for multiplayer quiz. Each team can be upto 4 team members. Will suppport ladderboard across the teams etc. 
  </td>
  </tr>
</table>

