"use client";
import Link from "next/link";
import {ArrowRight,CalendarCheck} from "lucide-react";
import {assignmentStep,sortedAssignments} from "@/lib/classroom/learning";
import {useClassroom} from "./ClassroomProvider";
export function ClassroomHomePrompt(){const {overview}=useClassroom(),next=sortedAssignments(overview?.assignments??[]).find(r=>{const s=assignmentStep(r).stage;return s>=0&&s<5;});return next?<section className="classroom-home-prompt"><CalendarCheck size={24}/><div><span className="eyebrow">YOUR CLASSROOM · {next.className}</span><h2>{next.assignment.title}</h2><p>{assignmentStep(next).action} · Due {new Date(next.assignment.due_at).toLocaleDateString()}</p></div><Link className="primary" href={`/assignments/${next.assignment.id}`}>Open assignment <ArrowRight size={16}/></Link></section>:null;}
