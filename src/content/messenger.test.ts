import { expect, it } from 'vitest';
import { z } from 'zod';
import messages from './messenger.json';
import { days } from './days';
it('every message task has a sender, bilingual conversation and a reachable reply', () => {
  const text = z.object({ko:z.string().min(1),en:z.string().min(1)});
  const schema = z.object({contact:z.string().min(1),name:text,subject:text,body:text,goal:text,reply:text,intent:z.enum(['ack','inquiry','revise','room','thanks']),attachment:z.object({name:text,body:text}).nullable()});
  expect(Object.keys(messages).sort()).toEqual(days.flatMap(day=>day.tasks.filter(t=>t.kind==='message').map(t=>t.id)).sort());
  for(const message of Object.values(messages)) expect(()=>schema.parse(message)).not.toThrow();
});
