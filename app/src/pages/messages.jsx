import React from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/SidebarH';

const API = 'http://localhost:3000';
const POLL_INTERVAL = 3000; // refresh messages every 3 seconds

// useState stores values so they survive across re-renders, instead of
// resetting every time the component re-renders like a normal variable would.
// setX(...) updates that value and triggers React to re-render with the new data.
export default function Messages() {
    const location = useLocation();
    const [user, setUser] = React.useState(null);
    const [matches, setMatches] = React.useState([]);
    // to store what the conversation the user has selected
    const [selectedMatch, setSelectedMatch] = React.useState(null);
    // to show the messages between the users (the messages history)
    const [messages, setMessages] = React.useState([]);
    // holds what the user types / whats going to be sent
    const [input, setInput] = React.useState('');
    const [loading, setLoading] = React.useState(true);
    const bottomRef = React.useRef(null);
    const pollRef = React.useRef(null);

    // when mounted get the different matches
    // stored in state (not a plain variable) so it survives every re-render
    React.useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                const parsed = JSON.parse(savedUser);
                setUser(parsed);
                fetchMatches(parsed.id);
            } catch (e) {
                console.error('Error loading user', e);
            }
        }
    }, []);

    // dependency array is [matches, location.state] instead of [] because this effect needs to
    // run again specifically when matches finishes loading (changes from []
    // to the real array) — that's the moment we can actually search it for
    // the matchId passed in from Matches.jsx
    // the auto select doesn't change the match itself, its the 2nd rendering that activates the use effect
    // [] from the first rendering thats one change [matches] the 2nd change
    // check if the user came from the matches page
    // checks if matches are finished loading
    // it is used to find the match
    React.useEffect(() => {
        if (location.state?.matchId && matches.length > 0) {
            // loops through the array until it finds a matchId thats the same as location.state.matchId
            // then gets that user info and conversation
            const found = matches.find(m => m.matchId === location.state.matchId);
            if (found) selectMatch(found);
        }
    }, [matches, location.state]);

    // auto-scroll to bottom when messages change
    React.useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // poll for new messages while a conversation is open
    React.useEffect(() => {
        if (selectedMatch) {
            pollRef.current = setInterval(() => {
                fetchMessages(selectedMatch.matchId);
            }, POLL_INTERVAL);
        }
        return () => clearInterval(pollRef.current);
    }, [selectedMatch]);

    // matches is the way to show the different conversations
    // gives setMatches the whole matches array
    async function fetchMatches(userId) {
        setLoading(true);
        try {
            const res = await fetch(`${API}/matches/${userId}`);
            const data = await res.json();
            if (data.ok) setMatches(data.matches);
        } catch (e) {
            console.error('Failed to fetch matches', e);
        } finally {
            setLoading(false);
        }
    }

    // sets it to the convo of that match id
    async function fetchMessages(matchId) {
        try {
            const res = await fetch(`${API}/messages/${matchId}`);
            const data = await res.json();
            if (data.ok) setMessages(data.messages);
        } catch (e) {
            console.error('Failed to fetch messages', e);
        }
    }

    // gets the match the whole profile object
    // sets the state to the exact profile match
    // gets the messages from that match convo
    function selectMatch(match) {
        setSelectedMatch(match);
        setMessages([]);
        fetchMessages(match.matchId);
    }

    // if you need to pass your own specific argument to the handler, wrap it
    // in an arrow function. If the handler is fine just receiving the raw
    // event (or needs nothing at all), you can pass it directly without wrapping.
    // clear the box immediately, since content already has the text saved
    // then fetch messages again so the new message shows up
    async function handleSend() {
        if (!input.trim() || !selectedMatch || !user) return;
        const content = input.trim();
        setInput('');

        try {
            const res = await fetch(`${API}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    match_id: selectedMatch.matchId,
                    sender_id: user.id,
                    content,
                }),
            });
            const data = await res.json();
            if (data.ok) fetchMessages(selectedMatch.matchId);
        } catch (e) {
            console.error('Failed to send message', e);
        }
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }

    if (!user || loading) {
        return (
            <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9f9f9', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: '#888' }}>Loading...</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar user={user} />
            <div style={{
                marginLeft: '260px', display: 'flex', width: '100%',
                minHeight: '100vh', backgroundColor: '#f9f9f9', fontFamily: 'Georgia, serif'
            }}>
                {/* LEFT PANEL: conversation list */}
                {/* map over every match and render a card for each one with an onClick so
                 when its clicked it opens that conversation. match has the profile object */}
                <div style={{
                    width: '300px', borderRight: '1px solid #e0e0e0',
                    backgroundColor: '#fff', padding: '24px 0', flexShrink: 0
                }}>
                    <h2 style={{ padding: '0 20px', color: '#F05023', marginBottom: '16px', fontSize: '1.3rem' }}>
                        Messages
                    </h2>

                    {matches.length === 0 ? (
                        <p style={{ padding: '0 20px', color: '#aaa', fontSize: '0.85rem' }}>
                            No matches yet.
                        </p>
                    ) : (
                        matches.map(match => (
                            <div
                                key={match.matchId}
                                onClick={() => selectMatch(match)}
                                style={{
                                    padding: '16px 20px', cursor: 'pointer',
                                    backgroundColor: selectedMatch?.matchId === match.matchId ? '#fff5f2' : 'transparent',
                                    borderLeft: selectedMatch?.matchId === match.matchId ? '3px solid #F05023' : '3px solid transparent',
                                    transition: 'all 0.15s ease'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '50%',
                                        backgroundColor: '#F05023', color: '#fff',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 'bold', flexShrink: 0
                                    }}>
                                        {match.fullName.charAt(0)}
                                    </div>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: '600', fontSize: '0.9rem', color: '#1a1a1a' }}>
                                            {match.fullName}
                                        </p>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#888' }}>
                                            {match.role === 'student' ? match.major : match.projectName}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* RIGHT PANEL: chat area */}
                {/* chained ternary: works like if/else —
                    1. if no conversation selected, show "Select a match to start chatting"
                    2. else show the conversation, messages, and input box */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '32px' }}>
                    {!selectedMatch ? (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>
                            <p>Select a match to start chatting.</p>
                        </div>
                    ) : (
                        <>
                            <h2 style={{ margin: '0 0 24px', color: '#1a1a1a', fontSize: '1.2rem' }}>
                                {selectedMatch.fullName}
                            </h2>

                            {/* messages list — .map() over messages array, one bubble per message
                                sender_id === user.id means it's mine (right side), otherwise theirs (left side) */}
                            <div style={{
                                flex: 1, backgroundColor: '#fff', borderRadius: '12px',
                                padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                                overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px',
                                minHeight: '400px', maxHeight: '60vh'
                            }}>
                                {messages.length === 0 ? (
                                    <p style={{ color: '#aaa', textAlign: 'center', marginTop: 'auto' }}>
                                        No messages yet. Say hi! 👋
                                    </p>
                                ) : (
                                    messages.map(msg => {
                                        const isMe = msg.sender_id === user.id;
                                        return (
                                            <div
                                                key={msg.id}
                                                style={{
                                                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                                                    backgroundColor: isMe ? '#F05023' : '#f0f0f0',
                                                    color: isMe ? '#fff' : '#1a1a1a',
                                                    padding: '12px 16px',
                                                    borderRadius: isMe ? '12px 12px 0 12px' : '12px 12px 12px 0',
                                                    maxWidth: '60%', fontSize: '0.9rem', lineHeight: '1.4'
                                                }}
                                            >
                                                {msg.content}
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={bottomRef} />
                            </div>

                            {/* input box + send button
                                value={input} and onChange keep the input box tied to state (controlled input)
                                handleKeyDown lets the user press Enter to send instead of only clicking the button */}
                            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                                <input
                                    type="text"
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Type a message..."
                                    style={{
                                        flex: 1, padding: '12px 16px', borderRadius: '8px',
                                        border: '1px solid #e0e0e0', fontSize: '0.9rem', outline: 'none'
                                    }}
                                />
                                <button
                                    onClick={handleSend}
                                    style={{
                                        padding: '12px 24px', backgroundColor: '#F05023',
                                        color: '#fff', border: 'none', borderRadius: '8px',
                                        cursor: 'pointer', fontWeight: '600'
                                    }}
                                >
                                    Send
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}