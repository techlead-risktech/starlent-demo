import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import { conversations } from '../../data/mockChats.js';
import { users } from '../../data/mockUsers.js';
import LearnerLayout from '../../components/layout/LearnerLayout.jsx';

export default function ChatTrainer() {
  const {convId}=useParams(); const {user}=useAuth(); const navigate=useNavigate();
  const [conv,setConv]=useState(null); const [text,setText]=useState('');
  const [msgs,setMsgs]=useState([]); const bottomRef=useRef(null);

  useEffect(()=>{const c=conversations.find(c=>c.id===convId);setConv(c);if(c)setMsgs(c.messages);},[convId]);
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:'smooth'});},[msgs]);

  const send=()=>{if(!text.trim())return;setMsgs([...msgs,{id:'n'+Date.now(),senderId:user.id,text:text.trim(),timestamp:new Date().toISOString(),type:'text'}]);setText('');};
  if (!conv) return <LearnerLayout topBar={<div className="page__header"><div className="page__title">Đang tải...</div></div>}><div className="empty-state">Đang tải...</div></LearnerLayout>;

  const name=conv.groupName||users.find(u=>u.id===conv.participants.find(p=>p!==user?.id))?.name||'Người dùng';

  return (
    <LearnerLayout topBar={<div className="page__header"><button className="btn btn--ghost btn--sm" onClick={()=>navigate(-1)} style={{marginBottom:8}}>← Quay lại</button><div className="page__title">{name}</div></div>}>
      <div style={{display:'flex',flexDirection:'column',height:'calc(100vh - 160px)'}}>
        {conv.pinnedMaterials.length>0&&<div className="card" style={{margin:8,padding:12,background:'var(--color-warning-light)'}}><div style={{fontSize:12,fontWeight:600,color:'#92400E',marginBottom:4}}>📌 Tài liệu ghim:</div>{conv.pinnedMaterials.map((m,i)=><div key={i} style={{fontSize:13,color:'var(--color-text-secondary)'}}>• {m}</div>)}</div>}
        <div style={{flex:1,overflowY:'auto',padding:16}}>
          {msgs.map(msg=>{const isMine=msg.senderId===user?.id;const sender=users.find(u=>u.id===msg.senderId);return(
            <div key={msg.id} style={{display:'flex',justifyContent:isMine?'flex-end':'flex-start',marginBottom:12}}>
              <div style={{maxWidth:'80%'}}>
                {!isMine&&<div style={{fontSize:11,color:'var(--color-text-muted)',marginBottom:2}}>{sender?.name}</div>}
                {msg.type==='text'?<div style={{padding:'10px 14px',borderRadius:16,borderTopRightRadius:isMine?4:16,borderTopLeftRadius:isMine?16:4,background:isMine?'var(--color-primary)':'var(--color-divider)',color:isMine?'#fff':'var(--color-text-primary)',fontSize:14}}>{msg.text}</div>
                :msg.type==='file'?<div style={{padding:'10px 14px',borderRadius:12,background:'var(--color-divider)',fontSize:13}}>📎 <strong>{msg.fileName}</strong> ({msg.fileSize})</div>
                :msg.type==='voice'?<div style={{padding:'10px 14px',borderRadius:12,background:'var(--color-divider)',fontSize:13}}>🎤 Tin nhắn thoại · {msg.duration}s</div>:null}
                <div style={{fontSize:10,color:'var(--color-text-muted)',marginTop:2,textAlign:isMine?'right':'left'}}>{new Date(msg.timestamp).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})}</div>
              </div>
            </div>
          );})}
          <div ref={bottomRef}/>
        </div>
        <div style={{padding:12,borderTop:'1px solid var(--color-border)',display:'flex',gap:8}}>
          <input className="input" style={{flex:1}} value={text} onChange={e=>setText(e.target.value)} placeholder="Nhập tin nhắn..." onKeyDown={e=>{if(e.key==='Enter')send();}}/>
          <button className="btn btn--primary btn--sm" onClick={send} disabled={!text.trim()}>Gửi</button>
        </div>
      </div>
    </LearnerLayout>
  );
}
