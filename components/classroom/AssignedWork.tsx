"use client";
import Link from 'next/link';
import {ArrowRight} from 'lucide-react';
import {assignmentStep,sortedAssignments} from '@/lib/classroom/learning';
import {useClassroom} from './ClassroomProvider';

export default function AssignedWork({classId}:{classId:string}) {
 const {overview}=useClassroom();
 const rows=sortedAssignments(overview?.assignments.filter(row=>row.assignment.class_id===classId)??[]);
 return <div className="classroom-assigned-work"><h4>Assigned work</h4>{rows.length?rows.map(row=>{
  const step=assignmentStep(row);
  return <div key={row.assignment.id}><Link className="text-link" href={`/assignments/${row.assignment.id}`}>{row.assignment.title} · {step.action} <ArrowRight size={14}/></Link><p>{step.label} · Due {new Date(row.assignment.due_at).toLocaleDateString()}</p></div>;
 }):<p>Your teacher hasn’t published an assignment yet.</p>}</div>;
}
