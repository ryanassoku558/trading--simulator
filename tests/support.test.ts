import {it,expect} from 'vitest';
import {answerHelp} from '../lib/support/answers';
it('answers platform questions with factual help and internal destinations',()=>{
 expect(answerHelp('How do referrals work?').text).toContain('$5,000');
 expect(answerHelp('Can I withdraw my profits?').text).toContain('cannot be withdrawn');
 expect(answerHelp('What minimum amount of money do I need to start?').text).toContain('no single amount');
 expect(answerHelp('How much money do I need to start?').text).toContain('no single amount');
 expect(answerHelp('How do I create an account?').links[0].href).toBe('#account');
 expect(answerHelp('How do I place a trade?').links[0].href).toContain('/market');
});
it('finds educational answers instead of making personalized trade calls',()=>{
 expect(answerHelp('What is compound interest?').text).toContain('Compounding');
 expect(answerHelp('What is a candlestick?').text.toLowerCase()).toContain('candle');
 expect(answerHelp('Should I buy AAPL now?').text).toContain('cannot decide');
 expect(answerHelp('asdfqwerty xyzzy').text).toContain('don’t have a reliable answer');
 expect(answerHelp('Can I speak to a human agent?').text).toContain('cannot');
 expect(answerHelp('Give me an example',69).links[0].href).toBe('/learn?lesson=69');
 expect(answerHelp('Show latest insider transactions').text).toContain('does not provide a current');
});
