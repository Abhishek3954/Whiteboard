import { useRef, useState } from 'react';
import { useSocket } from '../context/SocketContext.jsx';

export default function Preroom({onBack, onSuccess}) {
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const { checkCode } = useSocket();
  
  const handleSubmit = async () => {
    try {
      const value = inputRef.current.value;
      const allowedChars = 'QWERTYUIOPASDFGHJKLZXCVBNM1234567890';
      if (!value) throw new Error('Please Enter the code');
      if (value.length < 6) throw new Error('Code Length should be 6');
      const isValid = value.split('').every(char => allowedChars.includes(char));
      if (!isValid) throw new Error('Invalid Characters Used');
      
      // Ensure we clear any lingering host title before joining
      const existingUser = JSON.parse(sessionStorage.getItem('user'));
      if (existingUser && existingUser.title) {
        delete existingUser.title;
        sessionStorage.setItem('user', JSON.stringify(existingUser));
      }
      
      await checkCode(value);
      onSuccess();
    }
    catch (err) {
      setError(err.message);
    }
  }
  
  return (
    <div className='h-screen bg-slate-800 flex flex-col justify-center items-center'>
      <button className='font-bold text-3xl bg-red-500 hover:bg-red-400 active:bg-red-600 rounded-lg transition-all mb-5 px-4 w-52'
        onClick={onBack}>Go Back</button>
      
      <div>
        <label className='text-2xl transition-all font-bold' htmlFor='codeInput'>Enter Code:</label>
        <input className='text-2xl transition-all border-4 border-gray-800 bg-gray-200 text-emerald-700 font-bold rounded-md ml-3 mb-4 pl-2 py-1'
          id='codeInput' maxLength={6} ref={inputRef} type='text'></input>
      </div>
      
      <button className="bg-indigo-200 text-indigo-600 px-6 py-2 rounded-lg font-medium hover:bg-indigo-100 transition-all w-52 mb-4"
        onClick={handleSubmit}>Enter</button>
      <p>{error}</p>
    </div>
  )
}