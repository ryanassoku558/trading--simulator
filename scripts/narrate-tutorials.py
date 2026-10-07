"""Generate local synthetic narration and word-timed captions.
Requires piper-tts (its bundled eSpeak library); model downloads are not needed.
Usage: python scripts/narrate-tutorials.py /tmp/sprout-narration
"""
import ctypes, json, pathlib, sys, wave
from importlib.util import find_spec
root=pathlib.Path(find_spec('piper').origin).parent
lib=ctypes.CDLL(str(root/'espeakbridge.so'))
class EventId(ctypes.Union):
    _fields_=[('number',ctypes.c_int),('name',ctypes.c_char_p),('string',ctypes.c_char*8)]
class Event(ctypes.Structure):
    _fields_=[('type',ctypes.c_int),('unique_identifier',ctypes.c_uint),('text_position',ctypes.c_int),('length',ctypes.c_int),('audio_position',ctypes.c_int),('sample',ctypes.c_int),('user_data',ctypes.c_void_p),('id',EventId)]
callback_type=ctypes.CFUNCTYPE(ctypes.c_int,ctypes.POINTER(ctypes.c_short),ctypes.c_int,ctypes.POINTER(Event))
samples=[];words=[]
@callback_type
def collect(wav,count,events):
    if wav and count:samples.append(ctypes.string_at(wav,count*2))
    if events:
        i=0
        while events[i].type:
            e=events[i]
            if e.type==1:words.append((e.text_position-1,e.audio_position/1000))
            i+=1
    return 0
lib.espeak_Initialize.argtypes=[ctypes.c_int,ctypes.c_int,ctypes.c_char_p,ctypes.c_int]
rate=lib.espeak_Initialize(2,0,str(root).encode(),0)
if rate<=0:raise RuntimeError('Could not initialize local narration')
lib.espeak_SetSynthCallback(collect)
lib.espeak_SetVoiceByName.argtypes=[ctypes.c_char_p]
if lib.espeak_SetVoiceByName(b'en-us')!=0:raise RuntimeError('English voice unavailable')
lib.espeak_SetParameter(1,155,0)
lib.espeak_Synth.argtypes=[ctypes.c_void_p,ctypes.c_size_t,ctypes.c_uint,ctypes.c_int,ctypes.c_uint,ctypes.c_uint,ctypes.c_void_p,ctypes.c_void_p]
output=pathlib.Path(sys.argv[1]);output.mkdir(parents=True,exist_ok=True)
for video in json.loads(pathlib.Path('lib/education/tutorials.json').read_text()):
    for index,scene in enumerate(video['scenes']):
        samples.clear();words.clear()
        text=scene['title']+'. '+scene['caption'];encoded=text.encode('utf-8')
        buf=ctypes.create_string_buffer(encoded)
        if lib.espeak_Synth(buf,len(encoded)+1,0,1,0,1|0x1000,None,None)!=0:raise RuntimeError('Narration failed')
        lib.espeak_Synchronize()
        pcm=b''.join(samples);duration=len(pcm)/(rate*2)
        path=output/f"{video['slug']}-{index}"
        with wave.open(str(path)+'.wav','wb') as wav:
            wav.setnchannels(1);wav.setsampwidth(2);wav.setframerate(rate);wav.writeframes(pcm)
        # eSpeak character offsets identify the spoken words, including numbers.
        unique=[];seen=set()
        for position,time in words:
            if position not in seen and 0<=position<len(text):unique.append((position,time));seen.add(position)
        unique.sort(key=lambda w:w[1]);cues=[]
        for start in range(0,len(unique),7):
            group=unique[start:start+7];following=unique[start+7] if start+7<len(unique) else (len(text),duration)
            caption=text[group[0][0]:following[0]].strip()
            if caption:cues.append({'start':group[0][1],'end':max(group[0][1]+0.1,following[1]),'text':caption})
        path.with_suffix('.json').write_text(json.dumps({'duration':duration+0.4,'cues':cues}))
    print('Narrated '+video['slug'],flush=True)
lib.espeak_Terminate()
