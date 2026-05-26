import {createContext, useRef, useContext, useState } from 'react';
import { wsURL } from '../constants/index.js';
import { useAuth } from './AuthContext.jsx'

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const { username } = useAuth();
  const ws = useRef(null)
  const [colorId, setColorId] = useState();
  const [messages, setMessages] = useState([]);
  const [code, setCode] = useState('');
  const [host, setHost] = useState(false);
  const [memberNames, setMemberNames] = useState([]);
  // UNDO limit
  const MAX = 50;
  
  const [preview, setPreview] = useState([]);
  // Properties of the User
  const [pencilWidth, setPencilWidth] = useState(4);
  const [pencilColor, setPencilColor] = useState('#000000');
  const [eraserWidth, setEraserWidth] = useState(4);
  const [highlighterWidth, setHighlighterWidth] = useState(4);
  const [highlighterColor, setHighlighterColor] = useState('#FFFF00');
  const [tool, setTool] = useState('drag');

  // Authorized tools
  const [allowPencil, setAllowPencil] = useState(true);
  const [allowHighlighter, setAllowHighlighter] = useState(true);
  const [allowEraser, setAllowEraser] = useState(true);
  const [allowClear, setAllowClear] = useState(true);

  // storing Strokes
  const [strokes, setStrokes] = useState([]);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    
    const lastStroke = undoStack.at(-1);
    setUndoStack(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, lastStroke]);
    setStrokes(prev => prev.filter(s => s.id !== lastStroke.id));

    canvasChange({
      type: 'undo',
      id: lastStroke.id
    })
  };
  
  const handleRedo = () => {
    if (redoStack.length === 0) return;
      
    const lastStroke = redoStack.at(-1);
      
    setRedoStack(prev => prev.slice(0, -1));
    setUndoStack(prev => [...prev, lastStroke]);
    setStrokes(prev => [...prev, lastStroke]);

    canvasChange({
      type: 'redo',
      stroke: lastStroke
    });
  }

  const handleClear = () => {
    setStrokes([]);
    setUndoStack([]);
    setRedoStack([]);

    canvasChange({
      type: 'clear',
    });
  }
  
  const checkCode = async (code) => {
    try {
      const response = await fetch(`http://localhost:8080/checkCode/${code}`);
      if (!response.ok) throw new Error('Invalid Code')
      const data = await response.json();
      handleSocket(data.code);
      setCode(data.code);
    }
    catch (err) {
      console.log(err.message);
      throw err;
    }
  }
  
  const handleSocket = (code) => {
    if (ws.current && ws.current.readyState !== WebSocket.CLOSED) {
      ws.current.close();
    }
    
    setMessages([]);
    setColorId(null);
    setMemberNames([]);
    
    ws.current = new WebSocket(`${wsURL}/ws`)
    ws.current.onopen = () => {
      const user = JSON.parse(sessionStorage.getItem('user'));
      if (user.title === 'host') {
        ws.current.send(JSON.stringify({ type: 'join', name: username, code: code, isHost: true }));
      }
      else { ws.current.send(JSON.stringify({ type: 'join', name: username, code: code, isHost: false })) };
      ws.current.code = code;
      console.log('Websocket connection with server established');
    }
    
    //Handles all kinds of Messages
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'color') { setColorId(data.id); return; };
      if (data.type === 'message') { setMessages((prev) => [...prev, { name: data.name, text: data.text, id: data.id }]); return; };
      if (data.type === 'names') { setMemberNames(data.members) };
      if (data.type === 'makeHost') {
        setHost(true);
        const saved = JSON.parse(sessionStorage.getItem('user'));
        saved.title = 'host';
        sessionStorage.setItem('user', JSON.stringify(saved));
        
        // Automatically unlock all tools for the new host
        setAllowPencil(true);
        setAllowHighlighter(true);
        setAllowEraser(true);
        setAllowClear(true);
      };

      // Canvas Messages
      if (data.type === 'preview') { setPreview(data); };
      if (data.type === 'fullStroke') { setStrokes((prev) => [...prev, data]); };
      if (data.type === 'erase') { setStrokes(prev => prev.filter(s => s.id !== data.strokeId)); }
      if (data.type === 'undo') { setStrokes(prev => prev.filter(s => s.id !== data.id)) };
      if (data.type === 'redo') { setStrokes(prev => [...prev, data.stroke]) };
      if (data.type === 'clear') { setStrokes([]); setUndoStack([]); setRedoStack([]); }
      if (data.type === 'tools') { setAllowPencil(data.pencil); setAllowHighlighter(data.highlighter); setAllowEraser(data.eraser); setAllowClear(data.clear); };
      if (data.type === 'syncStrokes') { setStrokes(data.strokes) };
      if (data.type === 'kicked') { handleDisconnect(); window.location.reload() };
    }
    
    ws.current.onclose = () => {
      console.log('Websocket Disconnected')
    }
  }
  
  const handleSendMessage = (message) => {
    if (!message) { console.error('cannot send empty message'); return; };
    ws.current.send(JSON.stringify({ type: 'message', text: message }));
    setMessages((prev) => [...prev, { name: username, id: colorId, text: message }]);
  }
  
  const handleDisconnect = () => {
    setHost(false);
    setUndoStack([]);
    setRedoStack([]);
    setStrokes([]);
    setPreview([]);
    setPencilWidth(4);
    setPencilColor('#000000');
    setEraserWidth(4);
    setHighlighterWidth(4);
    setHighlighterColor('#FFFF00');
    
    const existingUser = JSON.parse(sessionStorage.getItem('user'));
    if(existingUser && existingUser.title){
      delete existingUser.title;
      sessionStorage.setItem('user', JSON.stringify(existingUser));
    }

    if (ws.current && ws.current.readyState !== WebSocket.CLOSED) {
      ws.current.close(1000, 'user disconneted');
    }
    ws.current = null;
  }

  const canvasChange = (data) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN && (data.type === 'preview' || data.type === 'undo' || data.type === 'redo' || data.type === 'erase' || data.type === 'clear')) {
      ws.current.send(JSON.stringify(data));
    };
    if (ws.current && ws.current.readyState === WebSocket.OPEN && data.type === 'fullStroke') {
      setStrokes((prev) => [...prev, data]);
      setRedoStack([]);
      setUndoStack(prev => {
        const next = prev.length >= MAX ? prev.slice(1) : prev;
        return [...next, data];
      });
      ws.current.send(JSON.stringify(data));
    }
  }

  const updatePermission = (data) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN && (data.type === 'updatePermission' || data.type === 'kick') && host) {
      ws.current.send(JSON.stringify(data))
    }
  }

  return (
    <SocketContext.Provider value={{
      handleSocket, handleSendMessage, messages, handleDisconnect, colorId,
      checkCode, code, memberNames, host, setHost, canvasChange, preview, pencilColor,
      pencilWidth, setPencilColor, setPencilWidth, strokes, eraserWidth, setEraserWidth, highlighterWidth, setHighlighterWidth,
      highlighterColor, setHighlighterColor, undoStack, redoStack, handleUndo, handleRedo, handleClear, allowPencil,
      allowHighlighter, allowEraser, allowClear, updatePermission, tool, setTool
    }}>
      {children}
    </SocketContext.Provider>
  )
}
// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () => { return useContext(SocketContext) }