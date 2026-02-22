import { useEffect, useRef, useState } from 'react';

const ScrollTypingLine = () => {
  const fullText = 'pushing forward the possibilities of agentic applications';
  const [typed, setTyped] = useState('');
  const [showCursor, setShowCursor] = useState(false);
  const [cursorFading, setCursorFading] = useState(false);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
        }
      },
      { threshold: 0.45 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;

    let index = 0;
    let typingInterval;
    let fadeTimeout;

    setTyped('');
    setShowCursor(false);
    setCursorFading(false);

    const cursorTimeout = setTimeout(() => {
      setShowCursor(true);
    }, 200);

    const typingStart = setTimeout(() => {
      typingInterval = setInterval(() => {
        index += 1;
        setTyped(fullText.slice(0, index));
        if (index >= fullText.length) {
          clearInterval(typingInterval);
          setCursorFading(true);
          fadeTimeout = setTimeout(() => {
            setShowCursor(false);
            setCursorFading(false);
          }, 800);
        }
      }, 18);
    }, 600);

    return () => {
      clearTimeout(cursorTimeout);
      clearTimeout(typingStart);
      clearTimeout(fadeTimeout);
      clearInterval(typingInterval);
    };
  }, [started]);

  return (
    <section ref={ref} className="bg-black min-h-screen text-white flex items-center justify-center px-6 py-24">
      <div className="w-full">
        <p className="text-center text-3xl md:text-6xl leading-tight tracking-tight max-w-6xl mx-auto">
          {typed}
          {showCursor && (
            <span
              className="inline-block w-0 overflow-visible"
              style={{
                animation: cursorFading ? 'none' : 'blink 1s step-end infinite',
                color: '#2997FF',
                textShadow: '0 0 8px #2997FF, 0 0 20px rgba(41,151,255,0.4)',
                transition: 'opacity 0.6s ease',
                opacity: cursorFading ? 0 : 1,
              }}
            >
              |
            </span>
          )}
          <span className="invisible">{fullText.slice(typed.length)}</span>
        </p>
      </div>
    </section>
  );
};

const Labs = () => {
  const fullText = 'Ouyang Labs';
  const [text, setText] = useState('');
  const [showCursor, setShowCursor] = useState(false);
  const [cursorFading, setCursorFading] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);

  useEffect(() => {
    let index = 0;
    let typingInterval;
    let endTimeout;

    setText('');
    setShowCursor(false);
    setCursorFading(false);
    setShowComingSoon(false);

    const cursorTimeout = setTimeout(() => {
      setShowCursor(true);
    }, 200);

    const startTimeout = setTimeout(() => {
      typingInterval = setInterval(() => {
        index += 1;
        setText(fullText.slice(0, index));

        if (index >= fullText.length) {
          clearInterval(typingInterval);
          setCursorFading(true);
          endTimeout = setTimeout(() => {
            setShowCursor(false);
            setCursorFading(false);
            setShowComingSoon(true);
          }, 800);
        }
      }, 45);
    }, 600);

    return () => {
      clearTimeout(cursorTimeout);
      clearTimeout(startTimeout);
      clearTimeout(endTimeout);
      clearInterval(typingInterval);
    };
  }, []);

  return (
    <>
      <style>
        {'@keyframes blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } } @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }'}
      </style>
      <section className="bg-black min-h-screen text-white flex items-center justify-center">
        <div className="-mt-32 md:-mt-40 text-center">
          <h1 className="text-8xl md:text-[12rem] tracking-tight">
            {text}
            {showCursor && (
              <span
                className="inline-block w-0 overflow-visible"
                style={{
                  animation: cursorFading ? 'none' : 'blink 1s step-end infinite',
                  color: '#2997FF',
                  textShadow: '0 0 8px #2997FF, 0 0 20px rgba(41,151,255,0.4)',
                  transition: 'opacity 0.6s ease',
                  opacity: cursorFading ? 0 : 1,
                }}
              >
                |
              </span>
            )}
            <span className="invisible">{fullText.slice(text.length)}</span>
          </h1>
          <p
            className="mt-16 md:mt-24 text-2xl md:text-4xl text-zinc-400 tracking-wide"
            style={{
              opacity: showComingSoon ? 1 : 0,
              animation: showComingSoon ? 'fadeIn 700ms ease forwards' : 'none',
            }}
          >
            coming soon
          </p>
        </div>
      </section>

      <ScrollTypingLine />
    </>
  );
};

export default Labs;
