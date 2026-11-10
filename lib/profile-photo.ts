export function isProfilePhoto(value:unknown):value is string{return typeof value==='string'&&value.length<=140000&&/^data:image\/jpeg;base64,[A-Za-z0-9+/]+=*$/.test(value);}
export async function prepareProfilePhoto(file:File):Promise<string>{
 if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('Choose a JPG, PNG, or WebP image.');
 if(file.size>5*1024*1024)throw new Error('Choose an image smaller than 5 MB.');
 const url=URL.createObjectURL(file);
 try{const image=new Image();image.src=url;await image.decode();if(!image.width||!image.height)throw new Error();const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;const context=canvas.getContext('2d');if(!context)throw new Error();const size=Math.min(image.width,image.height);context.fillStyle='#edf5ef';context.fillRect(0,0,256,256);context.drawImage(image,(image.width-size)/2,(image.height-size)/2,size,size,0,0,256,256);const photo=canvas.toDataURL('image/jpeg',.8);if(!isProfilePhoto(photo))throw new Error();return photo;}catch{throw new Error('This image could not be opened. Try another JPG, PNG, or WebP.');}finally{URL.revokeObjectURL(url);}
}
