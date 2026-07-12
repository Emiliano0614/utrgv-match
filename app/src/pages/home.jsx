import { useEffect, useState } from "react"
import Sidebar from "../components/SidebarH"
// useState stores values so they survive across re-renders, instead of
// resetting every time the component re-renders like a normal variable would.
// setX(...) updates that value and triggers React to re-render with the new data.
function Home (){
    // stored in state (not a plain variable) so it survives every re-render —
// Home re-renders on every swipe, and we still need user.id for /discover and /swipe
    const [user,setUser] = useState(null)//
// fetched once from /discover, then kept in state so it survives every
// re-render (each swipe) without needing to refetch from the route again
    const [profiles, setProfiles] = useState([])
    // index is in state because if it were a plain variable it would reset to 0
// on every re-render — keeping it in state lets it remember which profile
// we're currently viewing as the user swipes through the list
    const [index, setIndex] = useState(0)
// loading needs to be state because setLoading(false) is what triggers the
// re-render that switches the UI from the "Loading..." screen to the actual
// profile card — without state, the UI would have no way to know the fetch finished
    const [loading, setLoading] = useState(true)
// matched needs to be state because setMatched(true) is what triggers the
// re-render that switches the UI from showing the profile card to showing
// the match popup — without state, the UI would have no way to know when to show it
    const [matched, setMatched] = useState(false)
    // when the page is first loaded or refreshed or mounted it does this
   async function fetchProfiles(){
    const storeddata = JSON.parse(localStorage.getItem('user'))
    setUser(storeddata)
    const response = await fetch(`http://localhost:3000/discover/${storeddata.id}`, {
        method: 'GET'
    })
    const data = await response.json()
    const profile = data.profiles
    setProfiles(profile)
    setLoading(false)
}

useEffect(() => {
    fetchProfiles()
}, [])
    
 async function handleSwiped(liked){
    const current = profiles[index]
    const swiper_id = user.id
    const swiped_id = current.id
    const response = await fetch ("http://localhost:3000/swipe", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({swiped_id,swiper_id,liked})
    })
    const data = await response.json()
    if (data.matched == true){
        setMatched(true)
        setTimeout(() => setMatched(false), 2500);
    }
    setIndex(prev => prev + 1)
}
const current = profiles[index]

return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#1a1a1a' }}>
            <Sidebar user={user} />

            {/* It's a match banner */}
            {matched && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(240, 80, 35, 0.92)',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    zIndex: 9999, color: '#fff', textAlign: 'center'
                }}>
                    <h1 style={{ fontSize: '3rem', marginBottom: '12px' }}>🎉 It's a Match!</h1>
                    <p style={{ fontSize: '1.2rem' }}>You and {profiles[index - 1]?.fullName} liked each other.</p>
                </div>
            )}

            <div style={{ marginLeft: '260px', flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
               {loading ? (
    <p>Loading...</p>
) : !current ? (
    <div className="auth-card" style={{ textAlign: 'center' }}>
        <h2 style={{ color: '#F05023' }}>No more profiles</h2>
        <p style={{ color: '#666' }}>Check back later for new matches.</p>
        <button className="login-btn" onClick={() => { setIndex(0); fetchProfiles(); }}>
            Refresh
        </button>
    </div>
) : (
                    <div className="auth-card" style={{ width: '100%', maxWidth: '450px', textAlign: 'center' }}>
                        <h2 style={{ color: '#F05023', marginBottom: '5px' }}>UTRGV Match</h2>
                        <p style={{ color: '#666', marginBottom: '20px' }}>Welcome, {user.fullName}</p>

                        <div style={{
                            padding: '20px', border: '1px solid #eee',
                            borderRadius: '12px', textAlign: 'left', backgroundColor: '#fafafa'
                        }}>
                            <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{current.fullName}</h3>

                            <span style={{
                                background: '#F05023', color: '#fff',
                                padding: '4px 12px', borderRadius: '20px',
                                fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase'
                            }}>
                                {current.role === 'student' ? 'Student' : 'Business'}
                            </span>

                            <div style={{ marginTop: '15px', color: '#444' }}>
                                <p style={{ marginBottom: '8px' }}>
                                    <strong>{current.role === 'student' ? 'Major:' : 'Project:'}</strong>{' '}
                                    {current.role === 'student' ? current.major : current.projectName}
                                </p>
                                <p style={{ lineHeight: '1.5', fontSize: '0.95rem' }}>
                                    {current.role === 'student' ? current.bio : current.needs}
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '15px', marginTop: '25px' }}>
                            <button
                                className="login-btn"
                                style={{ background: '#e0e0e0', color: '#444', flex: 1, marginTop: 0 }}
                                onClick={() => handleSwiped(false)}
                            >
                                Pass
                            </button>
                            <button
                                className="login-btn"
                                style={{ flex: 1, marginTop: 0 }}
                                onClick={() => handleSwiped(true)}
                            >
                                Like
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
export default Home