const json=(status,body)=>new Response(JSON.stringify(body),{status,headers:{"content-type":"application/json","cache-control":"no-store"}});
export default async(request)=>{
 if(request.method!=="POST")return json(405,{error:"Method not allowed"});
 const key=Netlify.env.get("OPENAI_API_KEY"),code=Netlify.env.get("HANDYHOLMZ_ACCESS_CODE");
 if(!key||!code)return json(503,{error:"Transcription service not configured for this deployment."});
 if(request.headers.get("x-handyholmz-access")!==code)return json(401,{error:"Invalid operator access code."});
 const type=(request.headers.get("content-type")||"").split(";")[0].trim();
 const types={"audio/webm":"webm","audio/mp4":"m4a","audio/mpeg":"mp3","audio/ogg":"ogg","audio/wav":"wav","audio/x-wav":"wav"};
 if(!types[type])return json(415,{error:"Unsupported recording format."});
 const maxBytes=10*1024*1024;
 if(Number(request.headers.get("content-length")||0)>maxBytes)return json(413,{error:"Recording too large. Keep it under 10 MB."});
 const bytes=await request.arrayBuffer();
 if(bytes.byteLength<100||bytes.byteLength>maxBytes)return json(413,{error:"Recording empty or too large."});
 const form=new FormData();
 form.append("file",new Blob([bytes],{type}),"handyholmz-recording."+types[type]);
 form.append("model","gpt-4o-mini-transcribe");
 form.append("language","en");
 const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),25000);
 try{
  const response=await fetch("https://api.openai.com/v1/audio/transcriptions",{method:"POST",headers:{authorization:"Bearer "+key},body:form,signal:controller.signal});
  if(!response.ok)return json(502,{error:response.status===429?"Transcription rate limit reached.":"Transcription service unavailable ("+response.status+")."});
  const data=await response.json();
  return json(200,{text:String(data.text||"").slice(0,4000)});
 }catch{return json(502,{error:"Transcription failed or timed out. Try a shorter recording."})}
 finally{clearTimeout(timeout)}
};
export const config={path:"/api/transcribe"};
