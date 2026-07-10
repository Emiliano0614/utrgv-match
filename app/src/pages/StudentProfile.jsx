import { useState } from 'react'
import { Link } from 'react-router-dom'
function StudentProfile(){
    const [error, setError] = useState('')
    async function handlesubmit(event){
        event.preventDefault()
        const bio = event.target.bio.value
        const classification = event.target.classification.value
        const major= event.target.major.value
        const storage = localStorage.getItem('user')
        const user = JSON.parse(storage)
        const userId = user.id
        const response = await fetch('http://localhost:3000/profile/student',{
            method: 'POST',
            headers:  { 'Content-Type': 'application/json' },
            body: JSON.stringify({bio,classification,major,userId})
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
                <h2>Student Profile</h2>
                <p>Tell us a bit more about your academic background</p>

                <form className="auth-form" onSubmit={handlesubmit}>
                    <div className="input-group">
                        <input type="text" name="major" placeholder="Major (e.g. Computer Science)" required />
                    </div>

                    <div className="input-group">
                        <select name="classification" required>
                            <option value="">Classification</option>
                            <option value="freshman">Freshman</option>
                            <option value="sophomore">Sophomore</option>
                            <option value="junior">Junior</option>
                            <option value="senior">Senior</option>
                            <option value="graduate">Graduate</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <textarea name="bio" placeholder="Tell us about your skills and project interests... (optional)" rows="4" style={{width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd'}}></textarea>
                    </div>

                    <button type="submit" className="login-btn">Save Profile</button>
                </form>
            </div>
        </div>
    );
}

export default StudentProfile