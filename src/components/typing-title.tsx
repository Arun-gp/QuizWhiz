
'use client';

import { useState, useEffect } from 'react';

interface TypingTitleProps {
  text: string;
  speed?: number;
}

export default function TypingTitle({ text, speed = 100 }: TypingTitleProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(speed);

  useEffect(() => {
    let ticker: NodeJS.Timeout;
    const handleTyping = () => {
      const i = loopNum % 1;
      const fullText = text;
      
      setDisplayedText(
        fullText.substring(0, displayedText.length + (isDeleting ? -1 : 1))
      );

      setTypingSpeed(isDeleting ? speed / 2 : speed);

      if (!isDeleting && displayedText === fullText) {
         setTimeout(() => setIsDeleting(true), 1000);
      } else if (isDeleting && displayedText === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    };
    
    ticker = setTimeout(handleTyping, typingSpeed);

    return () => clearTimeout(ticker);
  }, [displayedText, isDeleting, loopNum, speed, text, typingSpeed]);

  return (
    <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl h-14">
      {displayedText}
      <span className="animate-ping">|</span>
    </h1>
  );
}
