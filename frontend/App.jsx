import React, { useState } from 'react';
import axios from 'axios';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input) return;
    const userMsg = { role: "user", content: input };
    setMessages([...messages, userMsg]);
    setLoading(true);

    try {
      // Use FormData as backend expects Form(...)
      const formData = new FormData();
      formData.append('query', input);
      
      const res = await axios.post('http://localhost:8000/chat', formData);
      const botMsg = { role: "bot", content: res.data.answer };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
    setInput("");
  };

  const uploadFile = async (e, type) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    await axios.post(`http://localhost:8000/ingest/${type}`, formData);
    alert(`${type} uploaded and indexed!`);
  };

  return (
    <div className="p-10 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Omni-Scribe 🧠</h1>
      
      <div className="flex gap-4 mb-6">
        <input type="file" onChange={(e) => uploadFile(e, 'audio')} className="hidden" id="audioUpload"/>
        <label htmlFor="audioUpload" className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer">Upload Audio</label>
        
        <input type="file" onChange={(e) => uploadFile(e, 'image')} className="hidden" id="imgUpload"/>
        <label htmlFor="imgUpload" className="bg-green-500 text-white px-4 py-2 rounded cursor-pointer">Upload Image</label>
      </div>

      <div className="bg-gray-100 p-4 h-96 overflow-y-auto rounded mb-4">
        {messages.map((m, i) => (
          <div key={i} className={`mb-2 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block p-2 rounded ${m.role === 'user' ? 'bg-blue-200' : 'bg-white border'}`}>
              {m.content}
            </span>
          </div>
        ))}
        {loading && <div className="text-gray-500">Thinking...</div>}
      </div>

      <div className="flex gap-2">
        <input 
          className="border p-2 flex-grow rounded" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage} className="bg-black text-white px-6 rounded">Send</button>
      </div>
    </div>
  );
}
