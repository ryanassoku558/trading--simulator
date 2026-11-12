"use client";
import Link from 'next/link';
import {useSearchParams} from 'next/navigation';
import {ArrowLeft} from 'lucide-react';
import {useClassroom} from './ClassroomProvider';
export default function AssignmentReturn(){const params=useSearchParams(),{overview}=useClassroom(),id=params.get('assignment'),row=overview?.assignments.find(r=>r.assignment.id===id);if(!row)return null;return <div className="classroom-return-link"><Link href={`/assignments/${row.assignment.id}`}><ArrowLeft size={15}/> Return to {row.assignment.title}</Link><span>{row.className} · Assigned learning</span></div>;}
