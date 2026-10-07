export const avatarChoices={
 sprout:{label:'Sprout',color:'#239767'},leaf:{label:'Leaf',color:'#399779'},sun:{label:'Sun',color:'#c38521'},moon:{label:'Moon',color:'#8a7ed5'},
 tree:{label:'Pine',color:'#39946b'},flower:{label:'Bloom',color:'#d36e9b'},mountain:{label:'Mountain',color:'#728da9'},waves:{label:'Waves',color:'#369db3'},
 compass:{label:'Explorer',color:'#ba854c'},star:{label:'Star',color:'#c18a33'},feather:{label:'Feather',color:'#9882c7'},cat:{label:'Cat',color:'#be8560'},
 fish:{label:'Fish',color:'#3896aa'},bird:{label:'Bird',color:'#6798ca'},rocket:{label:'Rocket',color:'#d17665'},shield:{label:'Guardian',color:'#49a08f'},
} as const;
export type AvatarId=keyof typeof avatarChoices;
export const avatarIds=Object.keys(avatarChoices) as AvatarId[];
