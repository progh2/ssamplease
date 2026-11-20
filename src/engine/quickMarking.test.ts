import {expect,it} from 'vitest';
import {resolveMark} from './quickMarking';
const criteria=[{id:'process',points:2},{id:'result',points:1}];
it('a mistaken stamp is corrected in the record, rather than blocking the player',()=>{
 expect(resolveMark({credits:['process'],ambiguous:false},criteria,'0')).toEqual({score:'2',corrected:true});
 expect(resolveMark({credits:['process'],ambiguous:false},criteria,'2')).toEqual({score:'2',corrected:false});
});
it('unclear originals stay pending, even if a player stamps a score',()=>{
 expect(resolveMark({credits:[],ambiguous:true},criteria,'3')).toEqual({score:'review',corrected:true});
 expect(resolveMark({credits:[],ambiguous:true},criteria,'review')).toEqual({score:'review',corrected:false});
});
it('asking a colleague remains a valid choice for a readable answer',()=>{
 expect(resolveMark({credits:['process','result'],ambiguous:false},criteria,'review')).toEqual({score:'review',corrected:false});
});
