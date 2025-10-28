import React, { useState } from 'react';
import ChatBox from './ChatBox'; // Import the new component

const MIN_HINTS_TO_UNLOCK_APPROACH = 3;

function TabbedInterface({ guidance, problemSlug }) { // problemSlug prop added
    const [activeTab, setActiveTab] = useState('hints');
    const [hintsRevealed, setHintsRevealed] = useState(1); // Start with 1 hint visible
    const [hasAttempted, setHasAttempted] = useState(false);
    
    // Locking Conditions
    const isApproachLocked = hintsRevealed < MIN_HINTS_TO_UNLOCK_APPROACH; 
    const isSolutionLocked = !hasAttempted; 

    const renderContent = () => {
        if (!guidance) return null;

        switch (activeTab) {
            case 'hints':
                return (
                    <div>
                        <h3>Hints:</h3>
                        <ol>
                            {/* Slice the array to show only revealed hints */}
                            {guidance.hints.slice(0, hintsRevealed).map((hint, index) => (
                                <li key={index}>{hint}</li>
                            ))}
                        </ol>
                        {hintsRevealed < guidance.hints.length && (
                            <button 
                                onClick={() => setHintsRevealed(h => h + 1)}
                                style={{ marginTop: 10 }}
                            >
                                Reveal Next Hint ({hintsRevealed}/{guidance.hints.length})
                            </button>
                        )}
                    </div>
                );

            case 'approach':
                if (isApproachLocked) {
                    return <p style={{ color: 'orange', fontWeight: 'bold' }}>🔒 Unlock required: View {MIN_HINTS_TO_UNLOCK_APPROACH} hints first to access the high-level approach.</p>;
                }
                return (
                    <div>
                        <h3>High-Level Approach:</h3>
                        <pre style={{ whiteSpace: 'pre-wrap' }}>{guidance.approach}</pre>
                    </div>
                );

            case 'solution':
                if (isSolutionLocked) {
                    return (
                        <div style={{ padding: 10, border: '1px dashed red', background: '#fffafa' }}>
                            <p style={{ color: 'red', fontWeight: 'bold' }}>🛑 Solution Locked: Attempt the problem yourself first.</p>
                            <button onClick={() => setHasAttempted(true)}>✅ I have submitted an attempt (Unlock Solution)</button>
                        </div>
                    );
                } 
                return (
                    <div>
                        <h3>Solution 1 (Optimal):</h3>
                        <pre style={{ whiteSpace: 'pre-wrap' }}>{guidance.solution1}</pre>
                        <h3>Solution 2 (Alternative):</h3>
                        <pre style={{ whiteSpace: 'pre-wrap' }}>{guidance.solution2}</pre>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div>
            {/* Tab Buttons */}
            <div>
                <button onClick={() => setActiveTab('hints')}>Hints</button>
                <button onClick={() => setActiveTab('approach')}>Approach</button>
                <button onClick={() => setActiveTab('solution')} >Solution</button>
            </div>

            {/* Content Area */}
            <div style={{ border: '1px solid #ccc', padding: 15, marginTop: 10 }}>
                {renderContent()}
                
                {/* Chat Integration: Appears below the guidance content */}
                <ChatBox slug={problemSlug} context={activeTab} />
            </div>
        </div>
    );
}
export default TabbedInterface;