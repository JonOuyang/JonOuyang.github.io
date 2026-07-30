const ChatPage = () => (
  <div className="cv-root">
    <style>{`
      .cv-root {
        position: fixed; inset: 0;
        background: #000;
        display: flex; align-items: center; justify-content: center;
        overflow: hidden;
        cursor: default;
      }
      .cv-card { text-align: center; padding: 0 1.5rem; }
      .cv-word {
        font-family: "Space Grotesk", "Google Sans", sans-serif;
        font-weight: 700; color: #fff;
        font-size: clamp(3.5rem, 15vw, 15rem);
        letter-spacing: -0.035em; line-height: 1;
        text-shadow: 0 0 clamp(14px, 2.5vw, 40px) rgba(215, 226, 236, 0.18);
        margin: 0;
      }
      .cv-sub {
        font-family: "Space Grotesk", "Google Sans", sans-serif;
        font-weight: 500;
        font-size: clamp(0.7rem, 1.1vw, 0.92rem);
        letter-spacing: 0.02em;
        color: #5c6672;
        margin-top: clamp(1rem, 2.5vh, 1.8rem);
      }
    `}</style>
    <div className="cv-card">
      <h1 className="cv-word">Jonathan</h1>
      <div className="cv-sub">I couldn&apos;t figure out how to design a good home page. I&apos;m just an engineer</div>
    </div>
  </div>
);

export default ChatPage;
