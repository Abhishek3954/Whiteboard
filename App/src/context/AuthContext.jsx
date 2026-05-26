import { signupApi, loginApi } from '../api/auth.jsx'
import { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export function AuthProvider({children}) {
  const [signupError, setSignupError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [signupMessage, setSignupMessage] = useState('');
  const [loginMessage, setLoginMessage] = useState('');
  const [username, setUsername] = useState(() => {
    try {
      const saved = sessionStorage.getItem('user');
      return saved ? JSON.parse(saved).name : '';
    } catch {
      sessionStorage.removeItem('user');
      return '';
    }
  });
  
  const handleSignupSubmit = async (formData) => {
    try {
      await signupApi(formData)
      sessionStorage.setItem('user', JSON.stringify({ name: formData.name, view: 'selection' }));
      setSignupMessage('Signup Successful, please Log in')
      setUsername(formData.name)
    }
    catch (err) {
      setSignupError(err.message);
      throw err;
    }
  }
  
  const handleLoginSubmit = async (formData) => {
    try {
      const response = await loginApi(formData)
      setLoginMessage(response.message);
      setUsername(formData.name);
      sessionStorage.setItem('user', JSON.stringify({ name: formData.name, view: 'home' }));
    }
    catch (err) {
      setLoginError(err.message);
      throw err;
    }
  }
  
  const handleLogout = () => {
    sessionStorage.removeItem('user');
    setUsername('');
  }
  
  const generateKey = async () => {
    try {
      const response = await fetch(`http://localhost:8080/hostCode/${username}`);
      if (!response.ok) throw new Error('Generate key response failed');
      const data = await response.text();
      return data;
    }
    catch (err) {
      console.log(err.message);
      throw err;
    }
  }
  
  
  const deleteCode = async () => {
    await fetch(`http://localhost:8080/deleteCode/${username}`, {method: 'DELETE'});
  }
  
  return (
    <AuthContext.Provider value={{
      username, signupError, loginError, signupMessage, loginMessage,
      handleSignupSubmit, handleLoginSubmit, handleLogout, generateKey, deleteCode
    }}>
      {children}
    </AuthContext.Provider>
  )
}
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = ()=>{ return useContext(AuthContext)}