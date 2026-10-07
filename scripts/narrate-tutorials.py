"""Create neural narration with captions aligned to spoken sentences.
Requires piper-tts and the CC0 en_US-joe-medium voice (see voices/README.md).
Usage: python scripts/narrate-tutorials.py OUTPUT_DIR --model MODEL.onnx
"""
import argparse,json,pathlib,re,wave
import numpy as np
import onnxruntime as ort
from piper import PiperVoice
from piper.config import PiperConfig,SynthesisConfig
parser=argparse.ArgumentParser();parser.add_argument('output');parser.add_argument('--model',required=True);args=parser.parse_args()
config_path=pathlib.Path(__file__).parent/'voices/en_US-joe-medium.json'
options=ort.SessionOptions();options.intra_op_num_threads=2;options.inter_op_num_threads=1
voice=PiperVoice(config=PiperConfig.from_dict(json.loads(config_path.read_text())),session=ort.InferenceSession(args.model,sess_options=options,providers=['CPUExecutionProvider']))
synthesis=SynthesisConfig(length_scale=1.06,noise_scale=0.6,noise_w_scale=0.7)
output=pathlib.Path(args.output);output.mkdir(parents=True,exist_ok=True)
def sentences(text):
    # Keep time abbreviations together rather than interpreting them as sentence endings.
    protected=text.replace('a.m.','a<M>m<T>').replace('p.m.','p<M>m<T>')
    return [s.replace('<M>','.').replace('<T>','.') for s in re.split(r'(?<=[.!?])\s+(?=[A-Z0-9])',protected)]
def spoken(text):
    text=text.replace('×',' times ').replace('÷',' divided by ').replace('→',' to ').replace('—',', ').replace('–',' to ')
    text=re.sub(r'\$(\d[\d,]*(?:\.\d+)?)',r'\1 dollars',text)
    return text.replace('%',' percent').replace('24/7','twenty-four hours a day, seven days a week')
for video in json.loads(pathlib.Path('lib/education/tutorials.json').read_text()):
    for index,scene in enumerate(video['scenes']):
        title=scene['title']+('' if scene['title'].endswith(('.', '?','!')) else '.')
        parts=[title]+sentences(scene['caption']);pcm=[];cues=[];offset=0
        for part in parts:
            chunks=list(voice.synthesize(spoken(part),synthesis));rate=chunks[0].sample_rate
            audio=np.concatenate([chunk.audio_int16_array for chunk in chunks]);duration=len(audio)/rate
            pcm.append(audio);cues.append({'start':offset,'end':offset+duration,'text':part});offset+=duration
            pause=np.zeros(round(rate*0.12),dtype=np.int16);pcm.append(pause);offset+=len(pause)/rate
        path=output/f"{video['slug']}-{index}";audio=np.concatenate(pcm)
        with wave.open(str(path)+'.wav','wb') as wav:
            wav.setnchannels(1);wav.setsampwidth(2);wav.setframerate(rate);wav.writeframes(audio.tobytes())
        path.with_suffix('.json').write_text(json.dumps({'duration':offset+0.4,'cues':cues,'voice':'joe-neural-v1'}))
    print('Neural narration: '+video['slug'],flush=True)
