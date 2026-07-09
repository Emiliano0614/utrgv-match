import { useState } from 'react'
import { Link } from 'react-router-dom'
function Login(){
    const [error, setError] = useState('')
    async function HandleSubmit(event){
         

        event.preventDefault()
        setError(' ')
        const email = event.target.email.value
        const password = event.target.password.value
        const response = await fetch('http://localhost:3000/login' , {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }  ,
            body: JSON.stringify({ email, password })
        })
        const users = await response.json()
        const { user } = users
        if(users.ok == false){
             setError('INVALID CREDENTIALS')
             return
        }
        localStorage.setItem('user', JSON.stringify(user))
        if(user.role == 'student'){
            if(user.major == null){                
                window.location.href = '/StudentProfile'
                return
            }           
            window.location.href = '/home'
        }
        if(user.role == 'business'){
            if(user.industry == null){                
                window.location.href = 'BusinessProfile'
                return
            }
            window.location.href = '/home'
        }
    }
    return (
         <div className="auth-page-container">
            <div className="auth-card">
                <h2>UTRGV Match</h2>
                <p>Sign in to find your project partner</p>

                <form className="auth-form" onSubmit={HandleSubmit}>
                    <div className="input-group">
                        <input
                        type = "text" 
                        name="email"
                        placeholder="Email"
                        required
                        />
                    </div>
                    
                    <div className="input-group">
                        <input
                        type = "password"
                        name="password"
                        placeholder="Password"
                        required
                        />
                    </div>

                    {error && <p style={{ color: '#e53e3e', marginTop: '8px', fontSize: '0.9rem' }}>{error}</p>}
                    <button type="submit" className="login-btn">
                        Login
                    </button>
                </form>

                <p className="footer-text">
                    Don't have an account?{' '}
                    <Link to="/signup">Register here</Link>
                </p>
            </div>
        </div>
    );
}
export default Login;