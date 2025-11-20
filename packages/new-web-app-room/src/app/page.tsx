'use client';

import { useEffect, useState, useCallback } from 'react';

type Choice = 'rock' | 'paper' | 'scissors' | null;
type GameState = 'waiting' | 'countdown' | 'choosing' | 'reveal' | 'result';

// Cyberpunk background themes
const cyberpunkThemes = [
  {
    name: 'Neon Pink',
    gradient: 'from-pink-900 via-purple-900 to-blue-900',
    accent: 'text-pink-400',
    glow: 'shadow-pink-500/50'
  },
  {
    name: 'Electric Blue',
    gradient: 'from-blue-900 via-cyan-900 to-teal-900',
    accent: 'text-cyan-400',
    glow: 'shadow-cyan-500/50'
  },
  {
    name: 'Toxic Green',
    gradient: 'from-green-900 via-emerald-900 to-lime-900',
    accent: 'text-green-400',
    glow: 'shadow-green-500/50'
  },
  {
    name: 'Neon Orange',
    gradient: 'from-orange-900 via-red-900 to-pink-900',
    accent: 'text-orange-400',
    glow: 'shadow-orange-500/50'
  },
  {
    name: 'Purple Matrix',
    gradient: 'from-purple-900 via-violet-900 to-indigo-900',
    accent: 'text-purple-400',
    glow: 'shadow-purple-500/50'
  },
  {
    name: 'Cyber Yellow',
    gradient: 'from-yellow-900 via-amber-900 to-orange-900',
    accent: 'text-yellow-400',
    glow: 'shadow-yellow-500/50'
  }
];

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
  
  // Cyberpunk background state
  const [currentThemeIndex, setCurrentThemeIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showThemeChange, setShowThemeChange] = useState(false);

  const [playerHit, setPlayerHit] = useState(false);
  const [computerHit, setComputerHit] = useState(false);
  const [playerFlying, setPlayerFlying] = useState(false);
  const [computerFlying, setComputerFlying] = useState(false);
  const [playerBouncing, setPlayerBouncing] = useState(false);
  const [computerBouncing, setComputerBouncing] = useState(false);
  
  // Flying buttons state
  const [flyingButtons, setFlyingButtons] = useState<{
    [key: string]: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      id: string;
    }
  }>({});

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

  const changeBackground = useCallback(() => {
    setIsTransitioning(true);
    setShowThemeChange(true);
    setTimeout(() => {
      setCurrentThemeIndex((prev) => (prev + 1) % cyberpunkThemes.length);
      setIsTransitioning(false);
    }, 300);
    setTimeout(() => {
      setShowThemeChange(false);
    }, 2000);
  }, []);

  const startGame = useCallback(() => {
    setGameState('countdown');
    setCountdown(3);
    setPlayerChoice(null);
    setComputerChoice(null);
    setComputerEmoji(getRandomEmoji());
    
    // Initialize flying buttons
    const initialButtons: typeof flyingButtons = {};
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    
    Object.keys(choices).forEach((key) => {
      initialButtons[key] = {
        x: Math.random() * (screenWidth - 100), // Random X position across screen width
        y: Math.random() * (screenHeight - 200), // Random Y position across screen height
        vx: (Math.random() - 0.5) * 10, // Random horizontal velocity (-5 to 5)
        vy: (Math.random() - 0.5) * 10, // Random vertical velocity (-5 to 5)
        id: key
      };
    });
    setFlyingButtons(initialButtons);
  }, []);

  const handlePlayerChoice = (choice: Choice) => {
    if (gameState === 'countdown' || gameState === 'choosing') {
      setPlayerChoice(choice);
      // Keep all buttons visible, just update the selected state
      // The selected button will show with green glow
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
            // Stop flying buttons
            setFlyingButtons({});
          }, 1000);
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [gameState, countdown]);

  // Flying buttons animation
  useEffect(() => {
    if (gameState === 'countdown' || gameState === 'choosing') {
      const animationFrame = setInterval(() => {
        setFlyingButtons(prev => {
          const updated = { ...prev };
          const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
          const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
          
          Object.keys(updated).forEach(key => {
            const button = updated[key];
            
            // Update position
            button.x += button.vx;
            button.y += button.vy;
            
            // Bounce off walls (with some padding for button size)
            const padding = 100;
            if (button.x <= padding || button.x >= screenWidth - padding) {
              button.vx = -button.vx;
              button.x = Math.max(padding, Math.min(screenWidth - padding, button.x));
            }
            if (button.y <= padding || button.y >= screenHeight - padding) {
              button.vy = -button.vy;
              button.y = Math.max(padding, Math.min(screenHeight - padding, button.y));
            }
          });
          
          return updated;
        });
      }, 16); // ~60fps
      
      return () => clearInterval(animationFrame);
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'reveal') {
      const winner = determineWinner(playerChoice, computerChoice);
      
      if (winner === 'player') {
        setResult('You Win!');
        // Pokemon-style flying attack animation
        setPlayerFlying(true);
        setTimeout(() => {
          // Player hits computer and bounces back
          setPlayerBouncing(true);
          setComputerHit(true);
          setComputerHealth(prev => Math.max(0, prev - 1));
        }, 1000);
        setTimeout(() => {
          // Reset all animations
          setPlayerFlying(false);
          setPlayerBouncing(false);
          setComputerHit(false);
        }, 1500);
      } else if (winner === 'computer') {
        setResult('Computer Wins!');
        // Pokemon-style flying attack animation
        setComputerFlying(true);
        setTimeout(() => {
          // Computer hits player and bounces back
          setComputerBouncing(true);
          setPlayerHit(true);
          setPlayerHealth(prev => Math.max(0, prev - 1));
        }, 1000);
        setTimeout(() => {
          // Reset all animations
          setComputerFlying(false);
          setComputerBouncing(false);
          setPlayerHit(false);
        }, 1500);
      } else {
        setResult('Tie!');
      }
      
      setGameState('result');
      
      // Check for game over
      setTimeout(() => {
        if (playerHealth <= 1 && winner === 'computer') {
          setResult('Game Over! Computer Wins!');
          setPlayerHealth(10);
          setComputerHealth(10);
          setGameState('waiting');
          // Change background after game over
          changeBackground();
        } else if (computerHealth <= 1 && winner === 'player') {
          setResult('Victory! You Win!');
          setPlayerHealth(10);
          setComputerHealth(10);
          setGameState('waiting');
          // Change background after victory
          changeBackground();
        } else {
          // Continue game after 2 second pause
          setTimeout(() => {
            // Change background after each battle round
            changeBackground();
            setTimeout(() => {
              startGame();
            }, 500); // Small delay to let background transition
          }, 2000);
        }
      }, 2000);
    }
  }, [gameState, playerChoice, computerChoice, playerHealth, computerHealth, startGame, changeBackground]);

  const getHealthBarWidth = (health: number) => `${(health / 10) * 100}%`;
  
  const currentTheme = cyberpunkThemes[currentThemeIndex];

  return (
    <>
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        @keyframes flyRight {
          0% { 
            transform: translateX(0) translateY(0) scale(1); 
          }
          20% { 
            transform: translateX(400px) translateY(-80px) scale(1.2); 
          }
          40% { 
            transform: translateX(800px) translateY(-120px) scale(1.4); 
          }
          60% { 
            transform: translateX(1200px) translateY(-100px) scale(1.3); 
          }
          80% { 
            transform: translateX(1600px) translateY(-40px) scale(1.2); 
          }
          100% { 
            transform: translateX(1800px) translateY(0) scale(1.5); 
          }
        }
        
        @keyframes flyLeft {
          0% { 
            transform: translateX(0) translateY(0) scale(1); 
          }
          20% { 
            transform: translateX(-400px) translateY(-80px) scale(1.2); 
          }
          40% { 
            transform: translateX(-800px) translateY(-120px) scale(1.4); 
          }
          60% { 
            transform: translateX(-1200px) translateY(-100px) scale(1.3); 
          }
          80% { 
            transform: translateX(-1600px) translateY(-40px) scale(1.2); 
          }
          100% { 
            transform: translateX(-1800px) translateY(0) scale(1.5); 
          }
        }
        
        @keyframes bounceBack {
          0% { transform: translateX(1000px) translateY(0) scale(1.5); }
          100% { transform: translateX(0) translateY(0) scale(1); }
        }
        
        @keyframes bounceBackLeft {
          0% { transform: translateX(-1000px) translateY(0) scale(1.5); }
          100% { transform: translateX(0) translateY(0) scale(1); }
        }
        
        .flying-right {
          animation: flyRight 1s ease-out forwards;
          z-index: 50;
        }
        
        .flying-left {
          animation: flyLeft 1s ease-out forwards;
          z-index: 50;
        }
        
        .bouncing-right {
          animation: bounceBack 0.5s ease-in forwards;
        }
        
        .bouncing-left {
          animation: bounceBackLeft 0.5s ease-in forwards;
        }
        
        .flying-button {
          position: fixed;
          z-index: 1000;
          transition: transform 0.1s ease;
          cursor: pointer;
          user-select: none;
          pointer-events: auto;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(10px);
        }
        
        .flying-button:hover {
          transform: scale(1.2);
          box-shadow: 0 0 25px rgba(255, 255, 255, 0.6);
          border-color: #fbbf24 !important;
        }
        
        .flying-button:active {
          transform: scale(0.9);
        }
        
        .flying-button.selected {
          border-color: #10b981 !important;
          background-color: rgba(16, 185, 129, 0.3) !important;
          box-shadow: 0 0 30px rgba(16, 185, 129, 0.8);
          animation: selectedGlow 1.5s infinite;
        }
        
        @keyframes selectedGlow {
          0%, 100% { 
            box-shadow: 0 0 30px rgba(16, 185, 129, 0.8);
            transform: scale(1.1);
          }
          50% { 
            box-shadow: 0 0 40px rgba(16, 185, 129, 1);
            transform: scale(1.15);
          }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        .flying-button {
          animation: pulse 2s infinite;
        }
        
        .background-transition {
          transition: all 0.6s ease-in-out;
        }
        
        .background-transition.transitioning {
          filter: brightness(0.3) saturate(0.5);
          transform: scale(1.02);
        }
        
        @keyframes cyberpunkGlow {
          0%, 100% { 
            box-shadow: 0 0 20px currentColor, 0 0 40px currentColor, 0 0 60px currentColor;
          }
          50% { 
            box-shadow: 0 0 30px currentColor, 0 0 60px currentColor, 0 0 90px currentColor;
          }
        }
        
        .cyberpunk-glow {
          animation: cyberpunkGlow 2s infinite;
        }
        
        .theme-indicator {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1000;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          backdrop-filter: blur(10px);
          border: 1px solid currentColor;
          animation: cyberpunkGlow 3s infinite;
        }
        
        @keyframes backgroundPulse {
          0%, 100% { 
            filter: brightness(1) saturate(1);
          }
          50% { 
            filter: brightness(1.2) saturate(1.3);
          }
        }
        
        .battle-active {
          animation: backgroundPulse 3s infinite;
        }
        
        @keyframes themeChange {
          0% { 
            opacity: 1;
            transform: scale(1);
          }
          50% { 
            opacity: 0.7;
            transform: scale(1.05);
            filter: brightness(2) saturate(2);
          }
          100% { 
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .theme-changing {
          animation: themeChange 0.6s ease-in-out;
        }
        
        .cyberpunk-border {
          border: 2px solid currentColor;
          box-shadow: 
            0 0 10px currentColor,
            inset 0 0 10px rgba(255, 255, 255, 0.1);
        }
        
        .theme-change-notification {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 2000;
          padding: 20px 40px;
          border-radius: 15px;
          font-size: 24px;
          font-weight: bold;
          backdrop-filter: blur(20px);
          border: 2px solid currentColor;
          animation: themeNotification 2s ease-in-out;
          pointer-events: none;
        }
        
        @keyframes themeNotification {
          0% { 
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5);
          }
          20% { 
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.2);
          }
          80% { 
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          100% { 
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
          }
        }
      `}</style>
      <div className={`min-h-screen bg-gradient-to-br ${currentTheme.gradient} text-white flex flex-col background-transition ${isTransitioning ? 'theme-changing' : ''} ${(gameState === 'countdown' || gameState === 'choosing' || gameState === 'reveal') ? 'battle-active' : ''}`}>
      {/* Theme Indicator */}
      <div className={`theme-indicator ${currentTheme.accent} bg-black/30`}>
        {currentTheme.name} Mode
      </div>
      
      {/* Theme Change Notification */}
      {showThemeChange && (
        <div className={`theme-change-notification ${currentTheme.accent} bg-black/50`}>
          🌈 {currentTheme.name} Mode Activated!
        </div>
      )}
      
      {/* Title */}
      <h1 className={`text-4xl font-bold text-center py-4 cyberpunk-glow ${currentTheme.accent}`}>
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
            <div className={`w-full bg-gray-700 rounded-full h-4 cyberpunk-border ${currentTheme.accent}`}>
              <div 
                className={`bg-green-500 h-4 rounded-full transition-all duration-1000 cyberpunk-glow`}
                style={{ width: getHealthBarWidth(playerHealth) }}
              />
            </div>
          </div>
          {/* Player Fighter */}
          <div 
            className={`text-9xl transition-all duration-300 ${
              playerFlying ? 'flying-right' : ''
            } ${
              playerBouncing ? 'bouncing-right' : ''
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
              <div className="flex flex-col gap-4">
                <button
                  onClick={startGame}
                  className={`bg-green-600 hover:bg-green-700 px-8 py-4 rounded-lg text-2xl font-bold transition-all cyberpunk-glow ${currentTheme.glow}`}
                >
                  START BATTLE
                </button>
                <button
                  onClick={changeBackground}
                  className={`bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg text-lg font-bold transition-all cyberpunk-glow ${currentTheme.glow}`}
                >
                  🌈 Change Theme
                </button>
              </div>
            </div>
          )}

          {gameState === 'countdown' && (
            <div className="text-center">
              <p className={`text-8xl font-bold mb-4 cyberpunk-glow ${currentTheme.accent}`}>{countdown}</p>
              <p className="text-2xl">Get ready...</p>
            </div>
          )}

          {gameState === 'choosing' && (
            <div className="text-center">
              <p className={`text-6xl font-bold mb-4 cyberpunk-glow ${currentTheme.accent}`}>SHOOT!</p>
              <p className="text-2xl">Choose now!</p>
            </div>
          )}

          {(gameState === 'reveal' || gameState === 'result') && (
            <div className="text-center">
              <div className="text-4xl mb-4">
                {playerChoice ? choices[playerChoice].emoji : '❓'} VS {computerChoice ? choices[computerChoice].emoji : '❓'}
              </div>
              <p className={`text-3xl font-bold cyberpunk-glow ${currentTheme.accent}`}>{result}</p>
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
            <div className={`w-full bg-gray-700 rounded-full h-4 cyberpunk-border ${currentTheme.accent}`}>
              <div 
                className={`bg-red-500 h-4 rounded-full transition-all duration-1000 cyberpunk-glow`}
                style={{ width: getHealthBarWidth(computerHealth) }}
              />
            </div>
          </div>
          {/* Computer Fighter */}
          <div 
            className={`text-9xl transition-all duration-300 ${
              computerFlying ? 'flying-left' : ''
            } ${
              computerBouncing ? 'bouncing-left' : ''
            } ${
              computerHit ? 'animate-bounce bg-red-500 bg-opacity-30 rounded-full p-4' : ''
            }`}
            style={computerHit ? shakeStyle : {}}
          >
            {computerEmoji}
          </div>
        </div>
      </div>

      {/* Flying Choice Buttons */}
      {(gameState === 'countdown' || gameState === 'choosing') && (
        <>
          {Object.entries(flyingButtons).map(([key, button]) => (
            <button
              key={key}
              onClick={() => handlePlayerChoice(key as Choice)}
              className={`flying-button p-6 rounded-lg border-2 ${
                playerChoice === key
                  ? 'selected border-green-500 bg-green-500/30'
                  : 'border-gray-600 hover:border-white bg-gray-800/90'
              }`}
              style={{
                left: `${button.x - 50}px`,
                top: `${button.y - 50}px`,
              }}
            >
              <div className="text-4xl mb-1">{choices[key as keyof typeof choices].emoji}</div>
              <div className="text-sm font-bold">{choices[key as keyof typeof choices].name}</div>
            </button>
          ))}
        </>
      )}

      {/* Static Choice Buttons for non-flying states */}
      <div className="pb-8">
        {gameState === 'waiting' && (
          <div className="flex justify-center gap-8">
            {Object.entries(choices).map(([key, choice]) => (
              <div
                key={key}
                className="p-6 rounded-lg border-2 border-gray-600 bg-gray-800/50"
              >
                <div className="text-5xl mb-2">{choice.emoji}</div>
                <div className="text-lg font-bold">{choice.name}</div>
              </div>
            ))}
          </div>
        )}

        {/* Instructions */}
        {gameState === 'waiting' && (
          <div className="mt-8 text-center text-lg text-gray-300">
            <p>🎯 Chase and click the flying buttons during countdown!</p>
            <p>⚡ Buttons bounce around like Windows 98 screensaver!</p>
            <p>⏰ If you don&apos;t catch one in time, you automatically lose!</p>
            <p>💥 First to 0 HP loses the battle!</p>
            <p className={`mt-4 ${currentTheme.accent} font-bold cyberpunk-glow`}>
              🌈 Background changes after every battle!
            </p>
          </div>
        )}
        
        {/* Choice confirmation */}
        {playerChoice && (gameState === 'countdown' || gameState === 'choosing') && (
          <div className="mt-4 text-center">
            <div className={`inline-flex items-center gap-2 bg-green-600/20 border border-green-400 rounded-lg px-4 py-2 cyberpunk-glow ${currentTheme.glow}`}>
              <span className="text-2xl">{choices[playerChoice].emoji}</span>
              <span className={`text-lg font-bold ${currentTheme.accent}`}>
                {choices[playerChoice].name} Selected!
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}















































































