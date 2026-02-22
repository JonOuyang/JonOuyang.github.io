import { useEffect, useState } from 'react';

const Labs = () => {
  const fullText = 'Ouyang Labs';
  const [text, setText] = useState('');

  useEffect(() => {
    let index = 0;
    let typingInterval;

    setText('');
    const startTimeout = setTimeout(() => {
      typingInterval = setInterval(() => {
        index += 1;
        setText(fullText.slice(0, index));

        if (index >= fullText.length) {
          clearInterval(typingInterval);
        }
      }, 45);
    }, 200);

    return () => {
      clearTimeout(startTimeout);
      clearInterval(typingInterval);
    };
  }, []);

  return (
    <section className="bg-black min-h-screen text-white flex items-center justify-center">
      <h1 className="text-4xl md:text-6xl tracking-tight">{text}</h1>
    </section>
  );
};

export default Labs;
