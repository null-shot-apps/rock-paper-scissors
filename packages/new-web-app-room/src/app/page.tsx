'use client';

import { useEffect, useState } from 'react';

type Choice = 'rock' | 'paper' | 'scissors' | null;
type GameState = 'waiting' | 'countdown' | 'choosing' | 'reveal' | 'result';

const choices = {
  rock: { emoji: '✊', name: 'Rock' },
  paper: { emoji: '✋', name: 'Paper' },
  scissors: { emoji: '✌️', name: 'Scissors' }
};

const computerEmojis = ['🤖', '👾'];

export default function RockPaperScissorsGame() {
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [playerHealth, setPlayerHealth] = useState(10);
  const [computerHealth, setComputerHealth] = useState(10);
  const [playerChoice, setPlayerChoice] = useState<Choice>(null);
  const [computerChoice, setComputerChoice] = useState<Choice>(null);
  const [computerEmoji, setComputerEmoji] = useState('🤖');
  const [countdown, setCountdown] = useState(3);
  const [result, setResult] = useState('');
  const [gameStarted, setGameStarted] = useState(false);

  const getRandomChoice = (): Choice => {
    const choiceKeys = Object.keys(choices) as Choice[];
    return choiceKeys[Math.floor(Math.random() * choiceKeys.length)];
  };

  const getRandomEmoji = () => {
    return computerEmojis[Math.floor(Math.random() * computerEmojis.length)];
  };

  const determineWinner = (player: Choice, computer: Choice) => {
    if (!player || !computer) return 'tie';
    if (player === computer) return 'tie';
    
    const winConditions = {
      rock: 'scissors',
      paper: 'rock',
      scissors: 'paper'
    };
    
    return winConditions[player] === computer ? 'player' : 'computer';
  };

  const startGame = () => {
    setGameStarted(true);
    setGameState('countdown');
    setCountdown(3);
    setPlayerChoice(null);
    setComputerChoice(null);
    setComputerEmoji(getRandomEmoji());
  };

  const handlePlayerChoice = (choice: Choice) => {
    if (gameState === 'choosing') {
      setPlayerChoice(choice);
    }
  };

  useEffect(() => {
    if (gameState === 'countdown') {
      const timer = setTimeout(() => {
        if (countdown > 1) {
          setCountdown(countdown - 1);
        } else {
          setGameState('choosing');
          setCountdown(0);
          
          // Auto-choose for computer
          const compChoice = getRandomChoice();
          setComputerChoice(compChoice);
          
          // Give player brief moment to choose, then reveal
          setTimeout(() => {
            setGameState('reveal');
          }, 1000);
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [gameState, countdown]);

  useEffect(() => {
    if (gameState === 'reveal') {
      const winner = determineWinner(playerChoice, computerChoice);
      
      if (winner === 'player') {
        setResult('You Win!');
        setComputerHealth(prev => Math.max(0, prev - 1));
      } else if (winner === 'computer') {
        setResult('Computer Wins!');
        setPlayerHealth(prev => Math.max(0, prev - 1));
      } else {
        setResult('Tie!');
      }
      
      setGameState('result');
      
      // Check for game over
      setTimeout(() => {
        if (playerHealth <= 1 && winner === 'computer') {
          setResult('Game Over! Computer Wins!');
          setGameStarted(false);
          setPlayerHealth(10);
          setComputerHealth(10);
          setGameState('waiting');
        } else if (computerHealth <= 1 && winner === 'player') {
          setResult('Victory! You Win!');
          setGameStarted(false);
          setPlayerHealth(10);
          setComputerHealth(10);
          setGameState('waiting');
        } else {
          // Continue game after 2 second pause
          setTimeout(() => {
            startGame();
          }, 2000);
        }
      }, 2000);
    }
  }, [gameState, playerChoice, computerChoice, playerHealth, computerHealth]);

  const getHealthBarWidth = (health: number) => `${(health / 10) * 100}%`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-4">
      <div className="max-w-md mx-auto">
        {/* Title */}
        <h1 className="text-3xl font-bold text-center mb-6">
          Rock Paper Scissors Battle
        </h1>

        {/* Health Bars */}
        <div className="mb-8">
          {/* Player Health */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">You</span>
              <span className="text-sm">{playerHealth}/10 HP</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-4">
              <div 
                className="bg-green-500 h-4 rounded-full transition-all duration-500"
                style={{ width: getHealthBarWidth(playerHealth) }}
              />
            </div>
          </div>

          {/* Computer Health */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">Computer {computerEmoji}</span>
              <span className="text-sm">{computerHealth}/10 HP</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-4">
              <div 
                className="bg-red-500 h-4 rounded-full transition-all duration-500"
                style={{ width: getHealthBarWidth(computerHealth) }}
              />
            </div>
          </div>
        </div>

        {/* Game Area */}
        <div className="text-center mb-8">
          {gameState === 'waiting' && (
            <div>
              <p className="text-xl mb-6">Ready for battle?</p>
              <button
                onClick={startGame}
                className="bg-green-600 hover:bg-green-700 px-8 py-4 rounded-lg text-xl font-bold transition-colors"
              >
                START BATTLE
              </button>
            </div>
          )}

          {gameState === 'countdown' && (
            <div>
              <p className="text-6xl font-bold mb-4">{countdown}</p>
              <p className="text-xl">Get ready...</p>
            </div>
          )}

          {gameState === 'choosing' && (
            <div>
              <p className="text-4xl font-bold mb-4 text-yellow-400">SHOOT!</p>
              <p className="text-lg">Choose now!</p>
            </div>
          )}

          {(gameState === 'reveal' || gameState === 'result') && (
            <div>
              <div className="flex justify-center items-center gap-8 mb-6">
                <div className="text-center">
                  <p className="text-sm mb-2">You</p>
                  <div className="text-6xl">
                    {playerChoice ? choices[playerChoice].emoji : '❓'}
                  </div>
                </div>
                <div className="text-2xl">VS</div>
                <div className="text-center">
                  <p className="text-sm mb-2">Computer {computerEmoji}</p>
                  <div className="text-6xl">
                    {computerChoice ? choices[computerChoice].emoji : '❓'}
                  </div>
                </div>
              </div>
              <p className="text-2xl font-bold">{result}</p>
            </div>
          )}
        </div>

        {/* Choice Buttons */}
        {gameState === 'choosing' && (
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(choices).map(([key, choice]) => (
              <button
                key={key}
                onClick={() => handlePlayerChoice(key as Choice)}
                className={`p-6 rounded-lg border-2 transition-all ${
                  playerChoice === key
                    ? 'border-yellow-400 bg-yellow-400/20'
                    : 'border-gray-600 hover:border-white'
                }`}
              >
                <div className="text-4xl mb-2">{choice.emoji}</div>
                <div className="text-sm">{choice.name}</div>
              </button>
            ))}
          </div>
        )}

        {/* Instructions */}
        {gameState === 'waiting' && (
          <div className="mt-8 text-center text-sm text-gray-300">
            <p>Choose Rock, Paper, or Scissors during the countdown!</p>
            <p>If you don't choose in time, you automatically lose!</p>
            <p>First to 0 HP loses the battle!</p>
          </div>
        )}
      </div>
    </div>
  );
}


