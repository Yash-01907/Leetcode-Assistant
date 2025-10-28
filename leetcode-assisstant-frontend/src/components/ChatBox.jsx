import React, { useState } from 'react';

function ChatBox({ slug, context }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);

    const sendMessage = async () => {
        if (!input.trim() || isSending) return;

        const userMessage = input.trim();
        setMessages(m => [...m, { sender: 'user', text: userMessage }]);
        setInput('');
        setIsSending(true);

        try {
            const response = await fetch('http://localhost:3000/api/chat', { // Adjust URL
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    problemSlug: slug, 
                    userQuery: userMessage, 
                    chatContext: context 
                }),
            });
            const data = await response.json();
            
            // Add AI response (handle both success and error response from API)
            const aiResponseText = data.response || data.error || "Could not connect to the AI service.";
            console.log(aiResponseText)
            setMessages(m => [...m, { sender: 'ai', text: aiResponseText }]);

        } catch (error) {
            console.error("Chat API error:", error);
            setMessages(m => [...m, { sender: 'ai', text: "Network error. Check your backend server." }]);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div style={{ marginTop: 20, borderTop: '1px solid #eee', paddingTop: 10 }}>
            <h4>Chat: Ask about the {context}</h4>
            <div style={{ height: 150, overflowY: 'auto', border: '1px solid #ccc', padding: 8, marginBottom: 10 }}>
                {messages.length === 0 ? (
                    <p style={{ color: '#888' }}>Ask me anything about the {context}!</p>
                ) : (
                    messages.map((msg, index) => (
                        <div key={index} style={{ marginBottom: 5, color: msg.sender === 'user' ? 'blue' : 'green' }}>
                            <strong>{msg.sender}:</strong> {msg.text}
                        </div>
                    ))
                )}
                {isSending && <p>AI is thinking... 🤔</p>}
            </div>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => { if (e.key === 'Enter') sendMessage(); }}
                disabled={isSending}
                placeholder={`Ask about the ${context} only...`}
                style={{ width: 'calc(100% - 70px)', padding: 5 }}
            />
            <button onClick={sendMessage} disabled={isSending} style={{ width: 60, marginLeft: 5 }}>Send</button>
        </div>
    );
}

export default ChatBox;