import { useState } from 'react'
function BusinessProfile (){
    const [error, setError] = useState('')
    async function handlesubmit (event){
        event.preventDefault()
        const projectName = event.target.projectName.value
        const industry  = event.target.industry.value
        const needs = event.target.needs.value
        const storage = localStorage.getItem('user')
        const user = JSON.parse(storage)
        const userId = user.id
        const response = await fetch('http://localhost:3000/profile/business', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({projectName,industry,needs,userId})
        })
        const data = await response.json()
        if(data.code === 'VALIDATION_ERROR'){
            setError('VALIDATION_ERROR')
            return
        }
        window.location.href = "/home"
        return
    }
    return(
      <div className="auth-page-container">
            <div className="auth-card">
                <h2>Business Partner Profile</h2>
                <p>Tell students about your ideas and projects</p>
                <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '-4px' }}>
                    Project name and description are optional. Industry is required.
                </p>

                <form className="auth-form" onSubmit={handlesubmit}>
                    <div className="input-group">
                        <input type="text" name="projectName" placeholder="Project Name (optional)" />
                    </div>

                    <div className="input-group">
                        <input type="text" name="industry" placeholder="Industry" required />
                    </div>

                    <div className="input-group">
                        <textarea name="needs" placeholder="What kind of projects or ideas are you looking to create? (optional)" rows="4" style={{width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd'}}></textarea>
                    </div>

                    <button type="submit" className="login-btn">Create Business Profile</button>
                </form>
            </div>
        </div>
    );
}
export default BusinessProfile;