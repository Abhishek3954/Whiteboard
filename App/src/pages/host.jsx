
export default function Host({ onBack, onCreate }) {
  
  const makeHost = () => {
    const existing = JSON.parse(sessionStorage.getItem('user'));
    const updatedUser = { ...existing, title: 'host' };
    sessionStorage.setItem('user', JSON.stringify(updatedUser));
  } 
    
  return (
    <div className='h-screen bg-slate-800 flex flex-col items-center justify-center'>
      <button className="font-bold text-3xl bg-red-500 hover:bg-red-400 active:bg-red-600 rounded-lg transition-all m-3 px-4 w-52"
        onClick={onBack}>Go Back</button>
      <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 shadow-sm transition-all w-52 my-4"
        onClick={() => { makeHost(); onCreate(); }}>Create Room</button>
    </div>
  )
}