import Simulator from "@/components/Simulator";
import {redirect} from "next/navigation";
export default async function Page({params}:{params:Promise<{path?:string[]}>}) {
  const {path}=await params;
  if(path?.[0]==="today")redirect("/classrooms");
  return <Simulator />;
}
