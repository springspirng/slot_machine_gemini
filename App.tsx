
import React, { useState, useEffect, useCallback } from 'react';
import { SymbolDefinition } from './types';
import { generateSymbols } from './services/geminiService';
import Reel from './components/Reel';
import SpinnerIcon from './components/SpinnerIcon';

const REEL_COUNT = 3;
const INITIAL_BALANCE = 100;
const SPIN_COST = 5;
const DEFAULT_THEME = 'classic fruit';

const DEFAULT_SYMBOLS: SymbolDefinition[] = [
    { name: 'Cherry', emoji: '🍒', payout: 10 },
    { name: 'Lemon', emoji: '🍋', payout: 5 },
    { name: 'Orange', emoji: '🍊', payout: 5 },
    { name: 'Plum', emoji: '🍇', payout: 15 },
    { name: 'Bell', emoji: '🔔', payout: 20 },
    { name: 'Bar', emoji: '🍫', payout: 50 },
    { name: 'Seven', emoji: '7️⃣', payout: 100 },
];

const App: React.FC = () => {
    const [symbols, setSymbols] = useState<SymbolDefinition[]>(DEFAULT_SYMBOLS);
    const [reels, setReels] = useState<SymbolDefinition[]>(() => Array(REEL_COUNT).fill(DEFAULT_SYMBOLS[0]));
    const [spinning, setSpinning] = useState<boolean>(false);
    const [loadingTheme, setLoadingTheme] = useState<boolean>(false);
    const [balance, setBalance] = useState<number>(INITIAL_BALANCE);
    const [message, setMessage] = useState<string>('Welcome! Spin to win!');
    const [themeInput, setThemeInput] = useState<string>(DEFAULT_THEME);
    const [winnings, setWinnings] = useState<number>(0);

    const handleThemeGenerate = useCallback(async () => {
        if (!themeInput || loadingTheme) return;
        setLoadingTheme(true);
        setMessage(`Generating symbols for "${themeInput}"...`);
        try {
            const newSymbols = await generateSymbols(themeInput);
            if(newSymbols && newSymbols.length > 0) {
                setSymbols(newSymbols);
                setReels(Array(REEL_COUNT).fill(newSymbols[0]));
                setMessage(`Theme set to "${themeInput}"! Ready to spin.`);
            } else {
                 throw new Error("Received empty symbols.");
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            setMessage(`Error: ${errorMessage}`);
            setSymbols(DEFAULT_SYMBOLS);
        } finally {
            setLoadingTheme(false);
        }
    }, [themeInput, loadingTheme]);

    useEffect(() => {
        setReels(Array(REEL_COUNT).fill(symbols[0]));
    }, [symbols]);

    const checkWin = (finalReels: SymbolDefinition[]) => {
        const isWin = finalReels.every(symbol => symbol.emoji === finalReels[0].emoji);
        
        if (isWin) {
            const winAmount = finalReels[0].payout * (SPIN_COST / 5); // Scale payout with bet
            setBalance(prev => prev + winAmount);
            setMessage(`🎉 You won ${winAmount} credits! 🎉`);
            setWinnings(winAmount);
        } else {
            setMessage('So close! Try again.');
            setWinnings(0);
        }
    };

    const handleSpin = () => {
        if (spinning || loadingTheme) return;

        if (balance < SPIN_COST) {
            setMessage('Not enough credits!');
            return;
        }

        setSpinning(true);
        setBalance(prev => prev - SPIN_COST);
        setMessage('Spinning...');
        setWinnings(0);

        const finalReels: SymbolDefinition[] = Array(REEL_COUNT).fill(null).map(() => symbols[Math.floor(Math.random() * symbols.length)]);

        const flickerInterval = setInterval(() => {
            const randomReels = Array(REEL_COUNT).fill(null).map(() => symbols[Math.floor(Math.random() * symbols.length)]);
            setReels(randomReels);
        }, 75);

        setTimeout(() => {
            clearInterval(flickerInterval);
            setReels(finalReels);
            setSpinning(false);
            checkWin(finalReels);
        }, 2500);
    };
    
    const isSpinDisabled = spinning || loadingTheme || balance < SPIN_COST;

    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-900 via-gray-900 to-black text-white flex flex-col items-center justify-center p-4 font-sans">
            <div className="w-full max-w-4xl mx-auto">

                <header className="text-center mb-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" style={{fontFamily: '"Bungee", cursive'}}>
                        GEMINI SLOTS
                    </h1>
                    <div className="mt-2 text-lg bg-black/30 backdrop-blur-sm rounded-lg p-2 inline-flex items-center gap-2">
                        <span>Balance:</span>
                        <span className="font-bold text-yellow-300">{balance} Credits</span>
                    </div>
                </header>

                <main className="bg-black/40 p-4 sm:p-6 md:p-8 rounded-2xl shadow-2xl border-2 border-yellow-500/50 shadow-yellow-500/20">
                    <div className="bg-gray-900/50 p-4 rounded-xl shadow-inner">
                        <div className="flex justify-center items-center gap-2 sm:gap-4">
                            {reels.map((symbol, index) => (
                                <Reel key={index} symbol={symbol} spinning={spinning} />
                            ))}
                        </div>
                    </div>
                    
                    <div className="text-center h-16 flex items-center justify-center mt-4">
                        <p className={`text-xl md:text-2xl font-semibold transition-all duration-300 ${winnings > 0 ? 'text-green-400 animate-pulse' : 'text-purple-300'}`}>
                           {message}
                        </p>
                    </div>

                    <div className="mt-4 space-y-4">
                        <div className="flex flex-col sm:flex-row gap-2 items-center">
                             <input
                                type="text"
                                value={themeInput}
                                onChange={(e) => setThemeInput(e.target.value)}
                                placeholder="Enter a theme (e.g., space, pirates)"
                                className="w-full sm:flex-grow bg-gray-700 text-white placeholder-gray-400 px-4 py-3 rounded-md border border-gray-600 focus:ring-2 focus:ring-yellow-400 focus:outline-none transition"
                                disabled={loadingTheme || spinning}
                            />
                            <button
                                onClick={handleThemeGenerate}
                                disabled={loadingTheme || spinning || !themeInput}
                                className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:text-gray-400 disabled:cursor-not-allowed rounded-md font-bold transition-all duration-200 shadow-lg text-white"
                            >
                                {loadingTheme ? <SpinnerIcon /> : 'Generate Symbols'}
                            </button>
                        </div>
                       
                        <button
                            onClick={handleSpin}
                            disabled={isSpinDisabled}
                            className={`w-full py-4 rounded-lg text-2xl font-bold uppercase tracking-widest transition-all duration-200 shadow-xl
                                ${isSpinDisabled 
                                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                    : 'bg-yellow-500 hover:bg-yellow-400 text-gray-900 transform hover:scale-105'
                                }
                            `}
                        >
                            Spin ({SPIN_COST} credits)
                        </button>
                    </div>
                </main>
                
                <footer className="text-center text-gray-500 mt-6 text-sm">
                    <p>Powered by React, Tailwind CSS, and the Google Gemini API.</p>
                    <p>Refresh page to reset balance and symbols to default.</p>
                </footer>

            </div>
        </div>
    );
};

export default App;
