import Simulator from "@/components/Simulator";
import {redirect} from "next/navigation";
export default async function Page({params,searchParams}:{params:Promise<{path?:string[]}>;searchParams:Promise<Record<string,string|string[]|undefined>>}) {
  const {path}=await params;
  const query=await searchParams;
  if(path?.[0]==="about")redirect("/");
  if(path?.[0]==="learn"&&query.view==="Glossary")redirect("/play?mode=Flashcards");
  if(path?.[0]==="classrooms"&&query.view==="resources")redirect("/classrooms");
  if(path?.[0]==="educators")redirect("/classrooms");
  if(path?.[0]==="today")redirect("/classrooms");
  return <Simulator />;
}
