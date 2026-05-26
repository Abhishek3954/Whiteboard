import { useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx';

let popupShown = false;
let loginPopup = 'Login Successful';

function Home({onRoom, onLogout, onHost}) {
  const { username, handleLogout } = useAuth();
  
  useEffect(() => {
    if (popupShown) { loginPopup = ''; return; };
    popupShown = true;
    const timer = setTimeout(() => {
      loginPopup = '';
    }, 8000);
    
    return () => { clearTimeout(timer) };
  }, [])
  
  return (
    <div className='h-screen bg-slate-800'>
      <div className='h-screen flex flex-col justify-center items-center'>
        <h3 className="text-2xl transition-all font-bold uppercase tracking-widest text-gray-500 mb-1">Username:
          <span className='text-2xl transition-all font-extrabold text-emerald-600'>  {username}</span></h3>
        
        <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 shadow-sm transition-all w-52 my-4"
          onClick={onHost}>Host a Meeting</button>
        <button className="bg-indigo-200 text-indigo-600 px-6 py-2 rounded-lg font-medium hover:bg-indigo-100 transition-all w-52 mb-4"
          onClick={() => { onRoom(); }}>Join a Meeting</button>
        
        <p className='loginMessage'>{loginPopup}</p>
        <button className="transition-all font-bold text-2xl bg-red-500 hover:bg-red-400 active:bg-red-600 rounded-lg m-3 px-4 py-2"
          onClick={() => { handleLogout(); onLogout(); }}>Log Out</button>
      </div>
    </div>
  )
}

export default Home