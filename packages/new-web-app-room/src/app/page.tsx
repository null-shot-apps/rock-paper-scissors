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
  // Add custom shake animation styles
  const shakeStyle = {
    animation: 'shake 0.5s ease-in-out'
  };
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [playerHealth, setPlayerHealth] = useState(10);
  const [computerHealth, setComputerHealth] = useState(10);
  const [playerChoice, setPlayerChoice] = useState<Choice>(null);
  const [computerChoice, setComputerChoice] = useState<Choice>(null);
  const [computerEmoji, setComputerEmoji] = useState('🤖');
  const [countdown, setCountdown] = useState(3);
  const [result, setResult] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [playerAttacking, setPlayerAttacking] = useState(false);
  const [computerAttacking, setComputerAttacking] = useState(false);
  const [playerHit, setPlayerHit] = useState(false);
  const [computerHit, setComputerHit] = useState(false);

  const getRandomChoice = (): Choice => {
    const choiceKeys = Object.keys(choices) as Choice[];
    return choiceKeys[Math.floor(Math.random() * choiceKeys.length)];
  };

  const getRandomEmoji = () => {
    return computerEmojis[Math.floor(Math.random() * computerEmojis.length)];
  };

  const determineWinner = (player: Choice, computer: Choice) => {
    if (!player) return 'computer'; // Player loses if they don't choose
    if (!computer) return 'player'; // Just in case
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
    if (gameState === 'countdown' || gameState === 'choosing') {
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
        // Attack animation sequence
        setPlayerAttacking(true);
        setTimeout(() => {
          setComputerHit(true);
          setComputerHealth(prev => Math.max(0, prev - 1));
        }, 500);
        setTimeout(() => {
          setPlayerAttacking(false);
          setComputerHit(false);
        }, 1000);
      } else if (winner === 'computer') {
        setResult('Computer Wins!');
        // Attack animation sequence
        setComputerAttacking(true);
        setTimeout(() => {
          setPlayerHit(true);
          setPlayerHealth(prev => Math.max(0, prev - 1));
        }, 500);
        setTimeout(() => {
          setComputerAttacking(false);
          setPlayerHit(false);
        }, 1000);
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
    <>
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex flex-col">
      {/* Title */}
      <h1 className="text-4xl font-bold text-center py-4">
        Rock Paper Scissors Battle
      </h1>

      {/* Fighter Arena */}
      <div className="flex-1 flex items-center justify-between px-16">
        {/* Player Fighter */}
        <div className="flex flex-col items-center">
          {/* Player Health Bar */}
          <div className="mb-4 w-48">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-lg">YOU</span>
              <span className="text-sm">{playerHealth}/10 HP</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-4">
              <div 
                className="bg-green-500 h-4 rounded-full transition-all duration-1000"
                style={{ width: getHealthBarWidth(playerHealth) }}
              />
            </div>
          </div>
          {/* Player Fighter */}
          <div 
            className={`text-9xl transition-all duration-300 ${
              playerAttacking ? 'transform translate-x-8' : ''
            } ${
              playerHit ? 'animate-bounce bg-red-500 bg-opacity-30 rounded-full p-4' : ''
            }`}
            style={playerHit ? shakeStyle : {}}
          >
            😎
          </div>
        </div>

        {/* Game State Display */}
        <div className="flex-1 flex items-center justify-center">
          {gameState === 'waiting' && (
            <div className="text-center">
              <p className="text-2xl mb-6">Ready for battle?</p>
              <button
                onClick={startGame}
                className="bg-green-600 hover:bg-green-700 px-8 py-4 rounded-lg text-2xl font-bold transition-colors"
              >
                START BATTLE
              </button>
            </div>
          )}

          {gameState === 'countdown' && (
            <div className="text-center">
              <p className="text-8xl font-bold mb-4">{countdown}</p>
              <p className="text-2xl">Get ready...</p>
            </div>
          )}

          {gameState === 'choosing' && (
            <div className="text-center">
              <p className="text-6xl font-bold mb-4 text-yellow-400">SHOOT!</p>
              <p className="text-2xl">Choose now!</p>
            </div>
          )}

          {(gameState === 'reveal' || gameState === 'result') && (
            <div className="text-center">
              <div className="text-4xl mb-4">
                {playerChoice ? choices[playerChoice].emoji : '❓'} VS {computerChoice ? choices[computerChoice].emoji : '❓'}
              </div>
              <p className="text-3xl font-bold">{result}</p>
            </div>
          )}
        </div>

        {/* Computer Fighter */}
        <div className="flex flex-col items-center">
          {/* Computer Health Bar */}
          <div className="mb-4 w-48">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-lg">COMPUTER</span>
              <span className="text-sm">{computerHealth}/10 HP</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-4">
              <div 
                className="bg-red-500 h-4 rounded-full transition-all duration-1000"
                style={{ width: getHealthBarWidth(computerHealth) }}
              />
            </div>
          </div>
          {/* Computer Fighter */}
          <div 
            className={`text-9xl transition-all duration-300 ${
              computerAttacking ? 'transform -translate-x-8' : ''
            } ${
              computerHit ? 'animate-bounce bg-red-500 bg-opacity-30 rounded-full p-4' : ''
            }`}
            style={computerHit ? shakeStyle : {}}
          >
            {computerEmoji}
          </div>
        </div>
      </div>

      {/* Choice Buttons - Bottom Center */}
      <div className="pb-8">
        {(gameState === 'countdown' || gameState === 'choosing') && (
          <div className="flex justify-center gap-8">
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
                <div className="text-5xl mb-2">{choice.emoji}</div>
                <div className="text-lg font-bold">{choice.name}</div>
              </button>
            ))}
          </div>
        )}

        {/* Instructions */}
        {gameState === 'waiting' && (
          <div className="mt-8 text-center text-lg text-gray-300">
            <p>Choose Rock, Paper, or Scissors during the countdown!</p>
            <p>If you don&apos;t choose in time, you automatically lose!</p>
            <p>First to 0 HP loses the battle!</p>
          </div>
        )}
      </div>
    </div>
    </>
  );
}






















