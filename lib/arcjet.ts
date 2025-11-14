import "server-only";

import arcjet, {
  detectBot,
  fixedWindow,
  protectSignup,
  sensitiveInfo,
  shield,
  slidingWindow,

} from '@arcjet/next';
import { Fingerprint } from 'lucide-react';
import { env } from './env';


export {
  detectBot,
  fixedWindow,
  sensitiveInfo,
  protectSignup,
  shield,
  slidingWindow,
};


export default arcjet({
  key: env.ARCJET_KEY,


  characteristics: ["Fingerprint"],
  //define base rule hear, can also be empty if you dont want to have any base rules
  rules: [
    shield({
      mode: "LIVE",
    }),

  ],
});