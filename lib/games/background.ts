export const liveBackgroundBucket='sprout-live-backgrounds';
export const liveBackgroundLimit=800_000;
export function ownedBackground(path:unknown,host:string):path is string {
 return typeof path==='string'&&path.startsWith(host+'/')&&/^[a-f0-9-]{36}\/[a-f0-9-]{36}\.jpg$/.test(path);
}
export function decodeBackground(value:unknown):Buffer {
 if(typeof value!=='string'||value.length>1_070_000||!/^data:image\/jpeg;base64,[A-Za-z0-9+/]+=*$/.test(value))throw Error('Choose a JPEG, PNG or WebP photo using the background picker.');
 const bytes=Buffer.from(value.slice(value.indexOf(',')+1),'base64');
 if(bytes.length>liveBackgroundLimit||bytes.length<4||bytes[0]!==255||bytes[1]!==216||bytes[2]!==255||bytes.at(-2)!==255||bytes.at(-1)!==217)throw Error('This image could not be read. Choose another photo.');
 return bytes;
}
