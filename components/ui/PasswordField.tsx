'use client';
import {useId,useState,type InputHTMLAttributes} from 'react';
import {Eye,EyeOff} from 'lucide-react';
type Props=Omit<InputHTMLAttributes<HTMLInputElement>,'type'> & {label:string};
export default function PasswordField({label,id,...props}:Props){const generated=useId(),inputId=id??generated;const [visible,setVisible]=useState(false);return <div className="password-field"><label htmlFor={inputId}>{label}</label><div className="password-control"><input {...props} id={inputId} type={visible?'text':'password'}/><button type="button" aria-label={`${visible?'Hide':'Show'} ${label.toLowerCase()}`} aria-controls={inputId} aria-pressed={visible} onClick={()=>setVisible(v=>!v)}>{visible?<EyeOff size={17}/>:<Eye size={17}/>}<span>{visible?'Hide':'Show'}</span></button></div></div>;}
