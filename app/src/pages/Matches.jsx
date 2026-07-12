import { useEffect, useState } from "react"
import { useNavigate } from 'react-router-dom';
import Sidebar from "../components/SidebarH";

function Matches (){
    const navigate = useNavigate();
    const [user, setUser] = useState(null)
    const [matches, setMatches] = useState([])
    const [loading, setLoading] = useState(true)

    async function getMatches(){
        const storedData = JSON.parse(localStorage.getItem('user'))
        setUser(storedData)
        const response = await fetch(`http://localhost:3000/matches/${storedData.id}`, {
            method: 'GET'
        })
        const data = await response.json()
        const matches = data.matches
        setMatches(matches)
        setLoading(false)
    }

    useEffect(() => {
        getMatches()
    },[])

    // send them to the conversation with the full match object
    function handleMessage(match) {
        navigate('/messages', { state: { matchId: match.matchId, otherUser: match } });
    }https://github.com/luiscarlosgarcia1/social-app/security

    //if you need to pass your own specific argument to the handler, wrap it 
    // in an arrow function. If the handler is fine just receiving the raw 
    // event (or needs nothing at all), you can pass it directly without wrapping.

    //the button needs to be outside the role check chain so that it can be in each match

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#1a1a1a' }}>
            <Sidebar user={user} />
            {/* 3-way conditional: 
        1. if loading, show "loading..."
        2. else if there are no matches, show "No matches yet"
        3. else, map over every match and render a card for each one */}
            <div style={{ marginLeft: '260px', flex: 1, padding: '40px' }}>
                <h2 style={{ color: '#F05023', marginBottom: '24px' }}>My Matches</h2>

                {loading ? (
                    <p style={{ color: '#fff' }}>Loading...</p>
                ) : matches.length === 0 ? (
                    <div className="auth-card" style={{ textAlign: 'center' }}>
                        <h2 style={{ color: '#F05023' }}>No matches yet</h2>
                        <p style={{ color: '#666' }}>Keep swiping to find your project partner.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {matches.map(match => (
                            <div key={match.matchId} style={{
                                backgroundColor: '#fff', borderRadius: '12px',
                                padding: '20px 24px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{
                                        width: '48px', height: '48px', borderRadius: '50%',
                                        backgroundColor: '#F05023', color: '#fff',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 'bold', fontSize: '1.2rem', flexShrink: 0
                                    }}>
                                        {match.fullName.charAt(0)}
                                    </div>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: '600', color: '#1a1a1a', fontSize: '1rem' }}>
                                            {match.fullName}
                                        </p>
                                        <p style={{ margin: '4px 0 0', color: '#666', fontSize: '0.85rem' }}>
                                            {match.role === 'student' ? match.major : match.projectName}
                                        </p>
                                        <p style={{ margin: '4px 0 0', color: '#888', fontSize: '0.8rem' }}>
                                            {match.role === 'student' ? match.bio : match.needs}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    className="login-btn"
                                    style={{ width: 'auto', marginTop: 0, padding: '10px 20px' }}
                                    onClick={() => handleMessage(match)}
                                >
                                    Message
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Matches