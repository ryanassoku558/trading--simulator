export default function ToolGuide({description,steps,example}:{description:string;steps:string[];example?:string}){
 return <div className="tool-guide"><p className="small">{description}</p><details><summary>How to use it</summary><ol>{steps.map(step=><li key={step}>{step}</li>)}</ol>{example&&<p className="small"><strong>Example:</strong> {example}</p>}</details></div>;
}
