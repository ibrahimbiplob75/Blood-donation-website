import React, { useState, useEffect } from "react";

const UnderConstruction = () => {
  const [codeLines, setCodeLines] = useState([]);
  const [progress, setProgress] = useState(0);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);

  const codeSequence = [
    { text: "// Building something amazing...", type: "comment" },
    { text: "const project = {", type: "keyword" },
    { text: '  status: "in-progress",', type: "variable" },
    { text: '  message: "Coming soon!"', type: "string" },
    { text: "};", type: "keyword" },
    { text: "deployWhenReady()", type: "function" },
  ];

  const floatingCodeSnippets = [
    "console.log();",
    "function() {}",
    "npm install",
    "git commit",
    "BloodDonationApp",
    "Donor",
    "construction",
    "working",
  ];

  useEffect(() => {
    const typewriterInterval = setInterval(() => {
      if (currentLineIndex < codeSequence.length) {
        setCodeLines((prev) => [...prev, codeSequence[currentLineIndex]]);
        setCurrentLineIndex((prev) => prev + 1);
      } else {
        setTimeout(() => {
          setCodeLines([]);
          setCurrentLineIndex(0);
        }, 3000);
      }
    }, 800);

    return () => clearInterval(typewriterInterval);
  }, [currentLineIndex]);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + Math.random() * 15;
      });
    }, 1000);

    return () => clearInterval(progressInterval);
  }, []);

  const styles = {
    container: {
      minHeight: "100vh",
      background:
        "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
      position: "relative",
      overflow: "hidden",
    },
    floatingCode: {
      position: "absolute",
      color: "rgba(88, 166, 255, 0.2)",
      fontFamily: '"Courier New", monospace',
      fontSize: "14px",
      pointerEvents: "none",
      animation: "floatCode 8s linear infinite",
    },
    constructionContainer: {
      textAlign: "center",
      color: "white",
      maxWidth: "700px",
      padding: "40px",
      background: "rgba(255, 255, 255, 0.05)",
      backdropFilter: "blur(15px)",
      borderRadius: "20px",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      boxShadow: "0 25px 45px rgba(0, 0, 0, 0.3)",
      animation: "fadeInUp 1s ease-out",
    },
    developerAnimation: {
      width: "300px",
      height: "200px",
      margin: "0 auto 30px",
      position: "relative",
      background: "#1e1e1e",
      borderRadius: "15px",
      border: "2px solid #333",
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
      overflow: "hidden",
    },
    titleBar: {
      position: "absolute",
      top: "0",
      left: "0",
      right: "0",
      height: "25px",
      background: "#21262d",
      borderRadius: "12px 12px 0 0",
      display: "flex",
      alignItems: "center",
      padding: "0 10px",
    },
    windowControls: {
      display: "flex",
      gap: "5px",
    },
    control: {
      width: "10px",
      height: "10px",
      borderRadius: "50%",
    },
    controlClose: {
      background: "#ff5f56",
    },
    controlMinimize: {
      background: "#ffbd2e",
    },
    controlMaximize: {
      background: "#27ca3f",
    },
    screen: {
      width: "100%",
      height: "100%",
      background: "#0d1117",
      position: "relative",
      borderRadius: "12px",
    },
    codeEditor: {
      position: "absolute",
      top: "35px",
      left: "10px",
      right: "10px",
      bottom: "10px",
      background: "#0d1117",
      borderRadius: "8px",
      padding: "15px",
      fontFamily: '"Courier New", monospace',
      fontSize: "10px",
      overflow: "hidden",
    },
    codeLine: {
      margin: "2px 0",
      opacity: "1",
      transition: "opacity 0.5s ease-in-out",
    },
    comment: { color: "#6a737d" },
    function: { color: "#79c0ff" },
    variable: { color: "#ffa657" },
    string: { color: "#a5d6ff" },
    keyword: { color: "#ff7b72" },
    cursor: {
      display: "inline-block",
      width: "8px",
      height: "12px",
      background: "#58a6ff",
      marginLeft: "2px",
      animation: "blink 1s infinite",
    },
    coffeeCup: {
      position: "absolute",
      top: "10px",
      right: "20px",
      width: "25px",
      height: "20px",
      background: "#8b4513",
      borderRadius: "0 0 10px 10px",
    },
    coffeeCupHandle: {
      position: "absolute",
      top: "5px",
      right: "-8px",
      width: "12px",
      height: "10px",
      border: "2px solid #8b4513",
      borderLeft: "none",
      borderRadius: "0 5px 5px 0",
    },
    steam: {
      position: "absolute",
      top: "-15px",
      width: "2px",
      height: "10px",
      background: "#fff",
      opacity: "0.6",
      borderRadius: "1px",
      animation: "steam 2s ease-in-out infinite",
    },
    steam1: { left: "5px" },
    steam2: { left: "10px", animationDelay: "0.5s" },
    steam3: { left: "15px", animationDelay: "1s" },
    developerFigure: {
      position: "absolute",
      bottom: "-20px",
      right: "-30px",
      width: "120px",
      height: "120px",
    },
    developerHead: {
      width: "30px",
      height: "30px",
      background: "#ffdbac",
      borderRadius: "50%",
      position: "absolute",
      top: "20px",
      left: "45px",
      animation: "nod 3s ease-in-out infinite",
    },
    developerBody: {
      width: "40px",
      height: "50px",
      background: "#4a90e2",
      borderRadius: "10px",
      position: "absolute",
      top: "45px",
      left: "40px",
    },
    developerArm: {
      width: "25px",
      height: "8px",
      background: "#ffdbac",
      borderRadius: "4px",
      position: "absolute",
      top: "55px",
    },
    armLeft: {
      left: "25px",
      transformOrigin: "right center",
      animation: "typeLeft 2s ease-in-out infinite",
    },
    armRight: {
      right: "25px",
      transformOrigin: "left center",
      animation: "typeRight 2s ease-in-out infinite",
    },
    title: {
      fontSize: "3rem",
      fontWeight: "bold",
      marginBottom: "20px",
      textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
      color: "#58a6ff",
      animation: "pulse 2s ease-in-out infinite alternate",
    },
    subtitle: {
      fontSize: "1.2rem",
      marginBottom: "30px",
      opacity: "0.9",
      lineHeight: "1.6",
      color: "#e6edf3",
    },
    progressContainer: {
      margin: "30px 0",
    },
    progressLabel: {
      fontSize: "0.9rem",
      marginBottom: "10px",
      color: "#7d8590",
    },
    progressBar: {
      width: "100%",
      height: "6px",
      background: "rgba(255, 255, 255, 0.1)",
      borderRadius: "3px",
      overflow: "hidden",
      position: "relative",
    },
    progressFill: {
      height: "100%",
      background: "linear-gradient(90deg, #58a6ff, #39d353)",
      borderRadius: "3px",
      transition: "width 1s ease-in-out",
      width: `${Math.min(progress, 100)}%`,
    },
    statusText: {
      fontSize: "0.9rem",
      color: "#39d353",
      marginTop: "20px",
      opacity: "0.8",
    },
  };

  const keyframes = `
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes blink {
      0%, 50% { opacity: 1; }
      51%, 100% { opacity: 0; }
    }
    @keyframes nod {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(-2deg); }
      75% { transform: rotate(2deg); }
    }
    @keyframes typeLeft {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(-15deg); }
    }
    @keyframes typeRight {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(15deg); }
    }
    @keyframes steam {
      0% { opacity: 0.6; transform: translateY(0); }
      100% { opacity: 0; transform: translateY(-20px); }
    }
    @keyframes pulse {
      from { transform: scale(1); }
      to { transform: scale(1.05); }
    }
    @keyframes floatCode {
      0% { transform: translateY(100vh) translateX(-50px); opacity: 0; }
      10% { opacity: 0.3; }
      90% { opacity: 0.3; }
      100% { transform: translateY(-100px) translateX(50px); opacity: 0; }
    }
    @media (max-width: 768px) {
      .construction-container { margin: 20px; padding: 30px 20px; }
      .title { font-size: 2rem; }
      .subtitle { font-size: 1rem; }
      .developer-animation { width: 250px; height: 160px; }
    }
  `;

  return (
    <>
      <style>{keyframes}</style>
      <div style={styles.container}>
        {floatingCodeSnippets.map((code, index) => (
          <div
            key={index}
            style={{
              ...styles.floatingCode,
              top: `${((index * 15) % 80) + 10}%`,
              left: index % 2 === 0 ? `${5 + ((index * 3) % 10)}%` : "auto",
              right: index % 2 === 1 ? `${8 + ((index * 2) % 15)}%` : "auto",
              animationDelay: `${index * 2}s`,
            }}
          >
            {code}
          </div>
        ))}

        <div style={styles.constructionContainer}>
          <div style={styles.developerAnimation}>
            <div style={styles.titleBar}>
              <div style={styles.windowControls}>
                <div
                  style={{ ...styles.control, ...styles.controlClose }}
                ></div>
                <div
                  style={{ ...styles.control, ...styles.controlMinimize }}
                ></div>
                <div
                  style={{ ...styles.control, ...styles.controlMaximize }}
                ></div>
              </div>
            </div>

            <div style={styles.screen}>
              <div style={styles.codeEditor}>
                {codeLines.map((line, index) => (
                  <div
                    key={index}
                    style={{
                      ...styles.codeLine,
                      ...styles[line.type],
                    }}
                  >
                    {line.text}
                    {index === codeLines.length - 1 && (
                      <span style={styles.cursor}></span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.coffeeCup}>
              <div style={styles.coffeeCupHandle}></div>
              <div style={{ ...styles.steam, ...styles.steam1 }}></div>
              <div style={{ ...styles.steam, ...styles.steam2 }}></div>
              <div style={{ ...styles.steam, ...styles.steam3 }}></div>
            </div>

            <div style={styles.developerFigure}>
              <div style={styles.developerHead}></div>
              <div style={styles.developerBody}></div>
              <div style={{ ...styles.developerArm, ...styles.armLeft }}></div>
              <div style={{ ...styles.developerArm, ...styles.armRight }}></div>
            </div>
          </div>

          <h1 style={styles.title}>This Page under Construction</h1>
          <p style={styles.subtitle}>
            we are working hard to bring you something amazing.
            <br />
            Please wait for a while and try again later.
          </p>

          <div style={styles.progressContainer}>
            <div style={styles.progressLabel}>Development Progress</div>
            <div style={styles.progressBar}>
              <div style={styles.progressFill}></div>
            </div>
          </div>

          <p style={styles.statusText}>
            âœ“ Coding in progress... Thank you for your patience
          </p>
        </div>
      </div>
    </>
  );
};

export default UnderConstruction;
