import { useState } from 'react'
import { Link } from 'react-router-dom'

function SignUp (){
    const [error, setError] = useState('')
    async function handleSubmit(event){

        event.preventDefault()
        const email = event.target.email.value
        const phone = event.target.phone.value
        const fullName = event.target.fullName.value
        const password = event.target.password.value
        const role = event.target.role.value
        const response = await fetch('http://localhost:3000/register',{
            method: 'POST',
            headers:  { 'Content-Type': 'application/json' },
            body: JSON.stringify({email,phone ,fullName , password, role})
        })
        const data = await response.json()
        if(data.code == 'EMAIL_TAKEN'){
            setError('That email is already registered.')
             return
        }
        window.location.href = "/"
        return

    }
    return(
         <div className="auth-page-container">
            {/* auth-page-container: Centers the card on the screen */}
            
            <div className="auth-card">
                {/* auth-card: The white box with the shadow and orange top border */}
                
                <h2>Join UTRGV Match</h2>
                <p>Create an account to start finding partners</p>

                <form className="auth-form" onSubmit={handleSubmit}>
                    
                    {/* input-group: Adds space between each text box */}
                    <div className="input-group">
                        <input
                        type = "email"
                        placeholder="Email"
                        name = "email"
                        required
                        />
                    </div>

                    <div className="input-group">
                        <input 
                        type = "text"
                        placeholder="Full Name"
                        name ="fullName"
                        required
                        />
                    </div>
                    
                    <div className="input-group">
                        <input 
                        type = "tel"
                        placeholder="Phone number"
                        name = "phone"
                        required
                        />
                    </div>

                    <div className="input-group">
                        <input 
                        type = "password"
                        placeholder = "Password"
                        name = "password"
                        required
                        />
                    </div>

                    {/*DROPDOWN ADDED TO SELECT BUISNES OR STUDENT */}
                    <div className="input-group">
                        <select name="role" required className="auth-input">
                            <option value="">I am a...</option>
                            <option value="student">UTRGV Student</option>
                            <option value="business">Business / Partner</option>
                        </select>
                    </div>

                    {error && <p style={{ color: '#e53e3e', marginTop: '8px', fontSize: '0.9rem' }}>{error}</p>}
                    {/* login-btn: Applies the UTRGV Orange styling */}
                    <button type="submit" className="login-btn">
                        Create Account
                    </button>
                </form>

                <p className="footer-text">
                    Already have an account?{' '}
                    <Link to="/">Login here</Link>
                </p>
            </div>
        </div>
    );
}

export default SignUp