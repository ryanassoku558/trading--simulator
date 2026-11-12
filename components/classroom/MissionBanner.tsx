"use client";
import Link from 'next/link';
import {useSearchParams} from 'next/navigation';
import {Flag,ArrowRight} from 'lucide-react';
import {useClassroom} from './ClassroomProvider';
import {missionTypes} from '@/lib/classroom/learning';
export default function MissionBanner(){const params=useSearchParams(),{overview}=useClassroom(),id=params.get('assignment'),row=overview?.assignments.find(r=>r.assignment.id===id);if(!row)return null;const mission=missionTypes.find(m=>m.id===row.assignment.mission)!;return <aside className="classroom-mission-banner" aria-label="Current classroom simulator mission"><Flag size={24}/><div><span className="eyebrow">{row.className} · ASSIGNED PRACTICE</span><h2>{mission.title}</h2><p>{mission.description} Return to the assignment to submit your evidence and reflection.</p></div><Link className="primary" href={`/assignments/${row.assignment.id}`}>Return to assignment <ArrowRight size={16}/></Link></aside>;}
