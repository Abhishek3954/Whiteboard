import { useState, useContext, createContext } from 'react';

const RoomContext = createContext();

export function RoomProvider({ children }){

  const [tool, setTool] = useState('drag');
  
  return (
    <RoomContext.Provider value={{tool, setTool}}>
      {children}
    </RoomContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useRoom = ()=>{return useContext(RoomContext)}